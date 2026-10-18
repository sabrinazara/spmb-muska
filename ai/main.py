from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
from PIL import Image
import io
import re
import cv2
import numpy as np
from pydantic import BaseModel
from typing import Optional, Dict, Any

app = FastAPI(title="SPMB MUSKA AI Microservice", description="OCR and RAG Service for SMK Muhammadiyah Sekampung")

# Allow CORS from NextJS and NestJS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Windows Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def clean_ocr_text(text: str) -> str:
    """Normalize OCR text removing strange artifacts while preserving letters and digits."""
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)

def preprocess_image_for_ocr(image_bytes: bytes) -> list[np.ndarray]:
    """
    Apply advanced OpenCV preprocessing for blurry, low-contrast, or unevenly lit KTP/KK.
    Returns multiple image candidates (Enhanced Grayscale, Bilateral+CLAHE, and Adaptive Threshold).
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Gagal membaca berkas gambar.")

    # 1. Resize if image is too small for character recognition (< 1200px width)
    h, w = img.shape[:2]
    if w < 1200:
        scale = 1200.0 / w
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

    # 2. Grayscale conversion
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 3. Bilateral filter to smooth noise while keeping text edges sharp
    filtered = cv2.bilateralFilter(gray, 9, 75, 75)

    # 4. Contrast Limited Adaptive Histogram Equalization (CLAHE) - critical for KTP backgrounds
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced_clahe = clahe.apply(filtered)

    # 5. Adaptive Gaussian Thresholding
    thresh_adaptive = cv2.adaptiveThreshold(
        enhanced_clahe, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 15
    )

    # 6. Otsu thresholding
    _, thresh_otsu = cv2.threshold(enhanced_clahe, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    return [enhanced_clahe, thresh_otsu, thresh_adaptive]

def extract_nik_advanced(text: str) -> Optional[str]:
    """
    Extract 16-digit NIK using multiple heuristic patterns and character repair.
    """
    # 1. Exact 16 digits
    match = re.search(r'\b(\d{16})\b', text)
    if match:
        return match.group(1)

    # 2. Look for lines containing 'NIK'
    for line in text.split('\n'):
        if 'NIK' in line.upper():
            # Clean possible OCR misreads in digits: O->0, I/l->1, B->8, S->5, Z->2
            cleaned = line.upper().replace('NIK', '').strip()
            repaired = (
                cleaned
                .replace('O', '0')
                .replace('D', '0')
                .replace('I', '1')
                .replace('L', '1')
                .replace('B', '8')
                .replace('S', '5')
                .replace('Z', '2')
                .replace('G', '6')
                .replace('A', '4')
            )
            digits = re.findall(r'\d', repaired)
            if len(digits) >= 16:
                return "".join(digits[:16])

    # 3. Scan whole text for 16-digit like sequence with OCR error tolerance
    normalized = text.upper()
    for char, rep in [('O', '0'), ('I', '1'), ('L', '1'), ('B', '8'), ('S', '5'), ('Z', '2')]:
        normalized = normalized.replace(char, rep)
    all_digits = re.findall(r'\b\d{16}\b', normalized)
    if all_digits:
        return all_digits[0]

    return None

def parse_ktp_kk_fields(text: str) -> Dict[str, Any]:
    """
    Extract all rich fields from Indonesian Identity Documents (KTP, KK, KIA).
    """
    lines = [clean_ocr_text(l).strip() for l in text.split('\n') if l.strip()]
    data: Dict[str, Any] = {
        "nik": extract_nik_advanced(text) or "-",
        "nomor_kk": "-",
        "nama": "-",
        "tempat_lahir": "-",
        "tanggal_lahir": "-",
        "jenis_kelamin": "-",
        "gol_darah": "-",
        "alamat": "-",
        "rt_rw": "-",
        "kel_desa": "-",
        "kecamatan": "-",
        "agama": "-",
        "status_perkawinan": "-",
        "pekerjaan": "-",
        "kewarganegaraan": "WNI",
        "berlaku_hingga": "SEUMUR HIDUP",
    }

    # Extract Nomor KK if present
    kk_match = re.search(r'(?:NO|NOMOR)\s*K(?:ARTU)?\s*K(?:ELUARGA)?\s*[:\.]?\s*(\d{16})', text, re.IGNORECASE)
    if kk_match:
        data["nomor_kk"] = kk_match.group(1)

    for i, line in enumerate(lines):
        upper = line.upper()

        # NAMA
        if 'NAMA' in upper and data["nama"] == "-":
            val = re.sub(r'^(?:[0-9\W_]*NAMA\s*[:\.]?\s*)', '', line, flags=re.IGNORECASE).strip()
            # Clean out common OCR noise
            val = re.sub(r'[^A-Z\s\.,\']', '', val.upper()).strip()
            if len(val) >= 3:
                data["nama"] = val

        # TEMPAT / TGL LAHIR
        if any(keyword in upper for keyword in ['LAHIR', 'TEMPAT/TGL', 'TPT/TGL']):
            val = re.sub(r'^(?:.*(?:LAHIR|TPT/TGL)\s*[:\.]?\s*)', '', line, flags=re.IGNORECASE).strip()
            # Try to split by comma
            parts = val.split(',')
            if len(parts) >= 2:
                data["tempat_lahir"] = re.sub(r'[^A-Za-z\s]', '', parts[0]).strip().title()
                date_part = parts[1].strip()
                date_match = re.search(r'(\d{2}[-/ ]\d{2}[-/ ]\d{4})', date_part)
                if date_match:
                    data["tanggal_lahir"] = date_match.group(1).replace('/', '-').replace(' ', '-')
            else:
                date_match = re.search(r'(\d{2}[-/ ]\d{2}[-/ ]\d{4})', val)
                if date_match:
                    data["tanggal_lahir"] = date_match.group(1).replace('/', '-').replace(' ', '-')
                    place_part = val.replace(date_match.group(0), '')
                    data["tempat_lahir"] = re.sub(r'[^A-Za-z\s]', '', place_part).strip().title()

        # JENIS KELAMIN & GOL DARAH
        if 'KELAMIN' in upper:
            if 'LAKI' in upper or 'LAKILAKI' in upper:
                data["jenis_kelamin"] = "LAKI-LAKI"
            elif 'PEREMPUAN' in upper or 'WANITA' in upper:
                data["jenis_kelamin"] = "PEREMPUAN"

            blood_match = re.search(r'DARAH\s*[:\.]?\s*([ABO\+]+)', upper)
            if blood_match:
                data["gol_darah"] = blood_match.group(1)

        # ALAMAT
        if 'ALAMAT' in upper and data["alamat"] == "-":
            val = re.sub(r'^(?:.*ALAMAT\s*[:\.]?\s*)', '', line, flags=re.IGNORECASE).strip()
            if val:
                data["alamat"] = val

        # RT / RW
        if 'RT' in upper and 'RW' in upper:
            rt_match = re.search(r'(\d{2,3}\s*/\s*\d{2,3})', upper)
            if rt_match:
                data["rt_rw"] = rt_match.group(1).replace(' ', '')

        # KEL / DESA
        if any(k in upper for k in ['KEL', 'DESA']) and data["kel_desa"] == "-":
            val = re.sub(r'^(?:.*(?:KEL|DESA|KELURAHAN)\s*[:\.]?\s*)', '', line, flags=re.IGNORECASE).strip()
            if len(val) >= 2:
                data["kel_desa"] = re.sub(r'[^A-Za-z0-9\s]', '', val).strip().title()

        # KECAMATAN
        if 'KECAMATAN' in upper and data["kecamatan"] == "-":
            val = re.sub(r'^(?:.*KECAMATAN\s*[:\.]?\s*)', '', line, flags=re.IGNORECASE).strip()
            if len(val) >= 2:
                data["kecamatan"] = re.sub(r'[^A-Za-z0-9\s]', '', val).strip().title()

        # AGAMA
        if 'AGAMA' in upper and data["agama"] == "-":
            val = re.sub(r'^(?:.*AGAMA\s*[:\.]?\s*)', '', upper).strip()
            for ag in ['ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU']:
                if ag in val:
                    data["agama"] = ag
                    break

        # STATUS PERKAWINAN
        if 'PERKAWINAN' in upper or 'STATUS' in upper:
            for st in ['BELUM KAWIN', 'KAWIN', 'CERAI HIDUP', 'CERAI MATI']:
                if st in upper:
                    data["status_perkawinan"] = st
                    break

        # PEKERJAAN
        if 'PEKERJAAN' in upper and data["pekerjaan"] == "-":
            val = re.sub(r'^(?:.*PEKERJAAN\s*[:\.]?\s*)', '', line, flags=re.IGNORECASE).strip().upper()
            if any(p in val for p in ['PELAJAR', 'MAHASISWA']):
                data["pekerjaan"] = "PELAJAR / MAHASISWA"
            elif 'BELUM' in val:
                data["pekerjaan"] = "BELUM / TIDAK BEKERJA"
            elif 'SWASTA' in val:
                data["pekerjaan"] = "KARYAWAN SWASTA"
            elif 'WIRASWASTA' in val:
                data["pekerjaan"] = "WIRASWASTA"
            elif 'PNS' in val or 'NEGERI' in val:
                data["pekerjaan"] = "PNS / ASN"
            elif len(val) >= 3:
                data["pekerjaan"] = val

    # Backup checks across full text
    full_upper = text.upper()
    if data["jenis_kelamin"] == "-":
        if "LAKI-LAKI" in full_upper or "LAKI - LAKI" in full_upper:
            data["jenis_kelamin"] = "LAKI-LAKI"
        elif "PEREMPUAN" in full_upper:
            data["jenis_kelamin"] = "PEREMPUAN"

    if data["agama"] == "-":
        for ag in ['ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU']:
            if ag in full_upper:
                data["agama"] = ag
                break

    if data["pekerjaan"] == "-":
        if "PELAJAR" in full_upper or "MAHASISWA" in full_upper:
            data["pekerjaan"] = "PELAJAR / MAHASISWA"

    return data

@app.get("/")
def index():
    return {
        "status": "AI Service Running",
        "service": "SPMB MUSKA RAG & OCR",
        "engine": "OpenCV + Tesseract OCR + Fast RAG",
        "version": "2.1.0"
    }

@app.post("/ocr/scan")
async def scan_document(file: UploadFile = File(...)):
    """
    Enhanced OCR Endpoint:
    Uses OpenCV CLAHE + Otsu adaptive thresholding to handle blurry or low-contrast KTP/KK.
    Extracts and parses all identity fields (NIK, Nama, TTL, Alamat, etc.).
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar (JPG, PNG, JPEG, dll)")

    try:
        contents = await file.read()
        preprocessed_images = preprocess_image_for_ocr(contents)

        # Run Tesseract with custom config
        custom_config = r'--oem 3 --psm 6'
        extracted_text = ""
        best_parsed: Dict[str, Any] = {}

        # Scan enhanced grayscale first
        for i, img in enumerate(preprocessed_images):
            try:
                # Use ind+eng languages
                text_candidate = pytesseract.image_to_string(img, lang='ind+eng', config=custom_config)
            except Exception:
                # Fallback to ind only
                try:
                    text_candidate = pytesseract.image_to_string(img, lang='ind', config=custom_config)
                except Exception:
                    text_candidate = pytesseract.image_to_string(img, lang='eng', config=custom_config)

            candidate_parsed = parse_ktp_kk_fields(text_candidate)
            
            # Prefer candidate that detected NIK or the most fields
            score = sum(1 for v in candidate_parsed.values() if v != "-")
            best_score = sum(1 for v in best_parsed.values() if v != "-") if best_parsed else -1

            if score > best_score or (candidate_parsed.get("nik") != "-" and best_parsed.get("nik") == "-"):
                extracted_text = text_candidate
                best_parsed = candidate_parsed

            # If we found NIK and Nama, we are in great shape
            if candidate_parsed.get("nik") != "-" and candidate_parsed.get("nama") != "-":
                break

        # Fallback to raw PIL Image if opencv candidates were too aggressive
        if not extracted_text or best_parsed.get("nik") == "-":
            raw_pil = Image.open(io.BytesIO(contents))
            fallback_text = pytesseract.image_to_string(raw_pil, lang='ind')
            fallback_parsed = parse_ktp_kk_fields(fallback_text)
            if fallback_parsed.get("nik") != "-":
                extracted_text = fallback_text
                best_parsed = fallback_parsed

        return {
            "filename": file.filename,
            "text": extracted_text.strip(),
            "parsed_data": best_parsed,
            "detectedNik": best_parsed.get("nik") if best_parsed.get("nik") != "-" else None,
            "confidence": "HIGH" if best_parsed.get("nik") != "-" and best_parsed.get("nama") != "-" else "MEDIUM"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses dokumen dengan OCR: {str(e)}")

class ChatRequest(BaseModel):
    question: str

SPMB_KNOWLEDGE = """
Sekolah: SMK Muhammadiyah Sekampung (MUSKA), Lampung Timur.
Status Akreditasi: Terakreditasi A (Unggul).
Program Keahlian / Jurusan:
1. Teknik Jaringan Komputer dan Telekomunikasi
2. Teknik Otomotif (Teknik Sepeda Motor)
3. Desain Komunikasi Visual
4. Bisnis Digital dan Kreatif
5. Kulineri (Tata Boga)
6. Kecantikan dan Tata Rias
7. Teknik Pemesinan (CNC)
8. Teknik Pengelasan (Welding)

Biaya Pendaftaran: Gratis (Rp 0). Biaya administrasi & daftar ulang dibayarkan saat verifikasi berkas langsung di kampus.
Persyaratan Dokumen: Scan/Foto KTP/KIA atau Kartu Keluarga (KK), Pas Foto, Ijazah SMP/MTs atau SKL.
Alur Pendaftaran: Isi Biodata -> Unggah Berkas & OCR -> Tunggu Verifikasi -> Cetak Kartu Peserta -> Ikuti Ujian CBT -> Cek Pengumuman Kelulusan.
"""

@app.post("/rag/chat")
async def chat_spmb(payload: ChatRequest):
    q = payload.question.lower().strip()
    
    # Specific intelligent answers
    if "jurusan" in q or "prodi" in q or "kejuruan" in q:
        ans = (
            "SMK Muhammadiyah Sekampung memiliki 8 Program Keahlian unggulan berstandar industri:\n"
            "1. Teknik Jaringan Komputer dan Telekomunikasi\n"
            "2. Teknik Otomotif (Teknik Sepeda Motor)\n"
            "3. Desain Komunikasi Visual\n"
            "4. Bisnis Digital dan Kreatif\n"
            "5. Kulineri (Tata Boga)\n"
            "6. Kecantikan dan Tata Rias\n"
            "7. Teknik Pemesinan (CNC)\n"
            "8. Teknik Pengelasan (Welding)\n"
            "Semuanya didukung fasilitas bengkel dan laboratorium modern standar industri."
        )
    elif "biaya" in q or "bayar" in q or "uang" in q:
        ans = (
            "Pendaftaran online di SPMB SMK Muhammadiyah Sekampung adalah GRATIS (Rp 0). "
            "Biaya daftar ulang dan seragam dapat diselesaikan saat daftar ulang offline di sekolah setelah dinyatakan lulus seleksi."
        )
    elif "syarat" in q or "berkas" in q or "dokumen" in q:
        ans = (
            "Persyaratan berkas pendaftaran:\n"
            "• Scan/Foto KTP Calon Siswa / KIA atau Kartu Keluarga (KK)\n"
            "• Scan/Foto Ijazah SMP/MTs atau Surat Keterangan Lulus (SKL)\n"
            "• Pas Foto terbaru\n"
            "Sistem kami dilengkapi OCR otomatis yang akan membaca data berkas Anda."
        )
    elif "ujian" in q or "tes" in q or "jadwal" in q:
        ans = (
            "Jadwal dan ruang ujian CBT diatur oleh panitia setelah berkas diverifikasi. "
            "Anda dapat melihat jadwal dan mengunduh Kartu Peserta Ujian langsung dari menu 'Kartu Peserta Ujian'."
        )
    else:
        ans = (
            f"Terima kasih telah bertanya mengenai '{payload.question}'. "
            "Pendaftaran SPMB SMK Muhammadiyah Sekampung sedang dibuka secara online. "
            "Anda dapat melengkapi data biodata dan mengunggah berkas persyaratan di portal peserta ini."
        )

    return {
        "question": payload.question,
        "answer": ans,
        "context_used": SPMB_KNOWLEDGE.strip()
    }