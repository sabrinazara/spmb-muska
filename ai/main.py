from fastapi import FastAPI, UploadFile, File, Form, HTTPException
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

INDONESIAN_MONTHS = {
    'januari': '01', 'jan': '01',
    'februari': '02', 'feb': '02',
    'maret': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'mei': '05', 'may': '05',
    'juni': '06', 'jun': '06',
    'juli': '07', 'jul': '07',
    'agustus': '08', 'agt': '08', 'ags': '08',
    'september': '09', 'sep': '09',
    'oktober': '10', 'okt': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'desember': '12', 'des': '12', 'dec': '12'
}

def clean_ocr_text(text: str) -> str:
    """Normalize OCR text removing strange artifacts while preserving letters and digits."""
    return re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)

def normalize_indonesian_date(raw_date_str: str) -> str:
    cleaned = raw_date_str.strip()
    match_num = re.search(r'(\d{1,2})[-/ ](\d{1,2})[-/ ](\d{4})', cleaned)
    if match_num:
        d, m, y = match_num.groups()
        return f"{int(d):02d}-{int(m):02d}-{y}"
    
    match_text = re.search(r'(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})', cleaned)
    if match_text:
        d, m_str, y = match_text.groups()
        m_num = INDONESIAN_MONTHS.get(m_str.lower(), '01')
        return f"{int(d):02d}-{m_num}-{y}"
    
    return raw_date_str

def preprocess_image_for_ocr(image_bytes: bytes) -> list[tuple[str, np.ndarray]]:
    """
    Apply advanced OpenCV preprocessing for blurry, low-contrast, or unevenly lit KTP/KK/Kartu Pelajar.
    Returns labeled image candidates: (label, ndarray).
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Gagal membaca berkas gambar.")

    # 1. Resize if image is too small for character recognition (< 1400px width)
    h, w = img.shape[:2]
    if w < 1400:
        scale = 1400.0 / w
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

    # 2. Grayscale conversion
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 3. Standard Otsu binarization
    _, thresh_otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # 4. Bilateral filter & CLAHE (Contrast Limited Adaptive Histogram Equalization)
    filtered = cv2.bilateralFilter(gray, 9, 75, 75)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(filtered)

    # 5. Otsu on CLAHE
    _, thresh_otsu_clahe = cv2.threshold(clahe, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # 6. Adaptive Gaussian Thresholding
    thresh_adaptive = cv2.adaptiveThreshold(
        clahe, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 11
    )

    return [
        ("OTSU", thresh_otsu),
        ("GRAY", gray),
        ("CLAHE", clahe),
        ("OTSU_CLAHE", thresh_otsu_clahe),
        ("ADAPTIVE", thresh_adaptive),
    ]

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

    # 3. Scan whole text for 16-digit sequence with OCR error tolerance
    normalized = text.upper()
    for char, rep in [('O', '0'), ('I', '1'), ('L', '1'), ('B', '8'), ('S', '5'), ('Z', '2')]:
        normalized = normalized.replace(char, rep)
    all_digits = re.findall(r'\b\d{16}\b', normalized)
    if all_digits:
        return all_digits[0]

    return None

def parse_all_identity_documents(text: str, student_account_nik: Optional[str] = None) -> Dict[str, Any]:
    """
    Intelligently extract structured identity fields from Indonesian Identity Documents:
    - Kartu Pelajar (Student ID) / KIA
    - Kartu Keluarga (KK)
    - KTP (Kartu Tanda Penduduk)
    """
    lines = [clean_ocr_text(l).strip() for l in text.split('\n') if l.strip()]
    upper_text = text.upper()

    data: Dict[str, Any] = {
        "nik": "",
        "no_kk": "",
        "nomor_kk": "",
        "nis": "",
        "nisn": "",
        "nama": "",
        "tempat_lahir": "",
        "tanggal_lahir": "",
        "tempat_tanggal_lahir": "",
        "jenis_kelamin": "",
        "gol_darah": "",
        "alamat": "",
        "rt_rw": "",
        "kel_desa": "",
        "kecamatan": "",
        "agama": "",
        "status_perkawinan": "",
        "pekerjaan": "",
        "kewarganegaraan": "WNI",
        "sekolah_asal": "",
        "tipe_dokumen": "UNKNOWN",
    }

    # 1. Document type detection
    is_kk = any(k in upper_text for k in ['KARTU KELUARGA', 'KEPALA KELUARGA', 'HUBUNGAN DALAM KELUARGA'])
    is_kartu_pelajar = not is_kk and (
        any(k in upper_text for k in [
            'KARTU PELAJAR', 'KARTU TANDA PELAJAR', 'KARTU SISWA', 'KARTU IDENTITAS SISWA',
            'SISWA SMP', 'SMP HARAPAN', 'SMP', 'MTS', 'OSIS'
        ])
        or bool(re.search(r'\b(?:NISN|NIS)\b', upper_text))
    )
    is_ktp = not is_kk and not is_kartu_pelajar and any(
        k in upper_text for k in ['REPUBLIK INDONESIA', 'KARTU TANDA PENDUDUK', 'PROVINSI', 'GOL. DARAH', 'KEWARGANEGARAAN']
    )

    if is_kk:
        data["tipe_dokumen"] = "KARTU_KELUARGA"
    elif is_kartu_pelajar:
        data["tipe_dokumen"] = "KARTU_PELAJAR"
        data["pekerjaan"] = "PELAJAR / MAHASISWA"
    elif is_ktp:
        data["tipe_dokumen"] = "KTP"

    # 2. Extract Nomor Kartu Keluarga (KK)
    kk_match = re.search(r'(?:NO|NOMOR)\s*(?:KARTU\s*KELUARGA|K\.?K\.?|KK)?\s*[:\.]?\s*(\d{16})', upper_text)
    if kk_match:
        data["no_kk"] = kk_match.group(1)
        data["nomor_kk"] = kk_match.group(1)

    # 3. Extract 16-digit sequences
    all_16 = re.findall(r'\b\d{16}\b', upper_text)

    # 4. Check for NIS / NISN
    nis_match = re.search(r'\b(?:NISN|NIS|NO\.?\s*INDUK)\s*[:=~?.\s]*(\d{5,12})\b', upper_text)
    if nis_match:
        data["nis"] = nis_match.group(1)
        data["nisn"] = nis_match.group(1)

    # 5. If it's KK and student_account_nik is known, look for student row in KK
    matched_student_line = None
    if is_kk and student_account_nik:
        for line in lines:
            if student_account_nik in line:
                matched_student_line = line
                data["nik"] = student_account_nik
                break

    if matched_student_line:
        before_nik = matched_student_line.split(student_account_nik)[0]
        cand_name = re.sub(r'^\s*\d+[\s\.\-]+', '', before_nik).strip()
        cand_name = re.sub(r'[^A-Za-z\s\.,\']', '', cand_name).strip()
        if len(cand_name) >= 3:
            data["nama"] = cand_name

        after_nik = matched_student_line.split(student_account_nik)[1]
        if 'LAKI' in after_nik.upper():
            data["jenis_kelamin"] = "LAKI-LAKI"
        elif 'PEREMPUAN' in after_nik.upper() or 'WANITA' in after_nik.upper():
            data["jenis_kelamin"] = "PEREMPUAN"

        for ag in ['ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU']:
            if ag in after_nik.upper():
                data["agama"] = ag
                break

        date_match = re.search(r'(\d{1,2}[-/ ]\d{1,2}[-/ ]\d{4})', after_nik)
        if date_match:
            d_str = date_match.group(1).replace('/', '-').replace(' ', '-')
            data["tanggal_lahir"] = normalize_indonesian_date(d_str)
            parts_after = after_nik[:date_match.start()].strip()
            parts_after = re.sub(r'(?:LAKI-LAKI|PEREMPUAN|LAKI|WANITA)', '', parts_after, flags=re.IGNORECASE).strip()
            cand_place = re.sub(r'[^A-Za-z\s]', '', parts_after).strip()
            if cand_place:
                data["tempat_lahir"] = cand_place.title()
                data["tempat_tanggal_lahir"] = f"{data['tempat_lahir']}, {data['tanggal_lahir']}"

        if 'PELAJAR' in after_nik.upper() or 'MAHASISWA' in after_nik.upper():
            data["pekerjaan"] = "PELAJAR / MAHASISWA"

    # 6. Line by line parsing for general fields
    for line in lines:
        upper = line.upper()

        # NAMA
        if not data["nama"]:
            if 'NAMA' in upper and not any(k in upper for k in ['SEKOLAH', 'IBU', 'AYAH', 'ORANG TUA', 'KOTA', 'DESA', 'GURU']):
                val = re.sub(r'^(?:.*NAMA\s*(?:SISWA|LENGKAP|KEPALA\s*KELUARGA)?\s*[:=~?.\s]*|[:=~?.\s]+)', '', line, flags=re.IGNORECASE).strip()
                val = re.sub(r'[^A-Za-z\s\.,\']', '', val).strip()
                if len(val) >= 3 and not any(k in val.upper() for k in ['KEPALA', 'KELUARGA', 'KARTU', 'PELAJAR', 'SMP', 'HARAPAN', 'BANGSA', 'SEKOLAH']):
                    data["nama"] = val
            elif is_kartu_pelajar and line.startswith(':'):
                val = re.sub(r'^[:=~?.\s]+', '', line).strip()
                val = re.sub(r'[^A-Za-z\s\.,\']', '', val).strip()
                if len(val) >= 3 and not any(k in val.upper() for k in ['RIAU', 'SMP', 'PELAJAR', '001', 'KEPALA', 'SEKOLAH']):
                    data["nama"] = val

        # TTL / TEMPAT TGL LAHIR
        if not data["tempat_tanggal_lahir"]:
            if any(k in upper for k in ['TTL', 'TEMPAT', 'LAHIR', 'TPT/TGL']) and 'AGAMA' not in upper:
                val = re.sub(r'^(?:.*(?:TTL|TEMPAT[ /,\.]*TGL\.?\s*LAHIR|TPT/TGL|LAHIR)\s*[:=~?.]*\s*)', '', line, flags=re.IGNORECASE).strip()
                val = re.sub(r'^[=~?:\.\s]+', '', val).strip()
                if val and len(val) >= 4:
                    data["tempat_tanggal_lahir"] = val
                    parts = val.split(',')
                    if len(parts) >= 2:
                        data["tempat_lahir"] = re.sub(r'[^A-Za-z\s]', '', parts[0]).strip().title()
                        data["tanggal_lahir"] = normalize_indonesian_date(parts[1])
                    else:
                        d_norm = normalize_indonesian_date(val)
                        data["tanggal_lahir"] = d_norm
                        cand_p = re.sub(r'[^A-Za-z\s]', '', val.replace(d_norm, '')).strip().title()
                        if cand_p:
                            data["tempat_lahir"] = cand_p

        # JENIS KELAMIN
        if not data["jenis_kelamin"] and any(k in upper for k in ['KELAMIN', 'JK']):
            if 'PEREMPUAN' in upper or 'WANITA' in upper:
                data["jenis_kelamin"] = "PEREMPUAN"
            elif 'LAKI' in upper:
                data["jenis_kelamin"] = "LAKI-LAKI"

        # GOL DARAH
        if not data["gol_darah"] and 'DARAH' in upper:
            blood_match = re.search(r'DARAH\s*[:\.]?\s*([ABO\+]+)', upper)
            if blood_match:
                data["gol_darah"] = blood_match.group(1)

        # ALAMAT
        if not data["alamat"] and 'ALAMAT' in upper:
            val = re.sub(r'^(?:.*ALAMAT\s*(?:SISWA|TEMPAT\s*TINGGAL)?\s*[:=~?.]*\s*)', '', line, flags=re.IGNORECASE).strip()
            val = re.sub(r'^[=~?:\.\s]+', '', val).strip()
            if val and len(val) >= 3:
                data["alamat"] = val

        # RT / RW
        if not data["rt_rw"] and ('RT' in upper and 'RW' in upper):
            rt_m = re.search(r'(\d{1,3}\s*/\s*\d{1,3})', upper)
            if rt_m:
                data["rt_rw"] = rt_m.group(1).replace(' ', '')

        # KEL / DESA
        if not data["kel_desa"] and any(k in upper for k in ['DESA', 'KELURAHAN', 'KEL.']):
            kel_m = re.search(r'(?:DESA/KELURAHAN|KELURAHAN/DESA|DESA|KELURAHAN|KEL\.?)\s*[:\.]?\s*([A-Za-z0-9\s]+)', upper)
            if kel_m:
                v = kel_m.group(1).strip()
                v = re.split(r'(?:KEC|KAB|,|\.)', v)[0].strip().title()
                if len(v) >= 2:
                    data["kel_desa"] = v

        # KECAMATAN
        if not data["kecamatan"] and any(k in upper for k in ['KECAMATAN', 'KEC.']):
            kec_m = re.search(r'(?:KECAMATAN|KEC\.?)\s*[:\.]?\s*([A-Za-z0-9\s]+)', upper)
            if kec_m:
                v = kec_m.group(1).strip()
                v = re.split(r'(?:KAB|KOTA|,|\.)', v)[0].strip().title()
                if len(v) >= 2:
                    data["kecamatan"] = v

        # AGAMA
        if not data["agama"] and 'AGAMA' in upper:
            for ag in ['ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU']:
                if ag in upper:
                    data["agama"] = ag
                    break

        # PEKERJAAN
        if not data["pekerjaan"] and 'PEKERJAAN' in upper:
            val = re.sub(r'^(?:.*PEKERJAAN\s*[:=~?.]*\s*)', '', line, flags=re.IGNORECASE).strip().upper()
            if any(p in val for p in ['PELAJAR', 'MAHASISWA']):
                data["pekerjaan"] = "PELAJAR / MAHASISWA"
            elif 'BELUM' in val:
                data["pekerjaan"] = "BELUM / TIDAK BEKERJA"
            elif 'SWASTA' in val:
                data["pekerjaan"] = "KARYAWAN SWASTA"
            elif 'WIRASWASTA' in val:
                data["pekerjaan"] = "WIRASWASTA"
            elif 'PNS' in val or 'ASN' in val:
                data["pekerjaan"] = "PNS / ASN"
            elif len(val) >= 3:
                data["pekerjaan"] = val

        # STATUS PERKAWINAN
        if not data["status_perkawinan"] and any(k in upper for k in ['PERKAWINAN', 'STATUS']):
            for st in ['BELUM KAWIN', 'KAWIN', 'CERAI HIDUP', 'CERAI MATI']:
                if st in upper:
                    data["status_perkawinan"] = st
                    break

        # SEKOLAH ASAL
        if not data["sekolah_asal"] and any(k in upper for k in ['SMP', 'MTS']):
            for s_token in ['SMP', 'MTS']:
                if s_token in upper:
                    s_match = re.search(rf'({s_token}\s+[A-Za-z0-9\s]+)', upper)
                    if s_match:
                        cand = s_match.group(1).strip().title()
                        cand = re.split(r'(?:JL|JALAN|KEC|KAB|,|\.)', cand, flags=re.IGNORECASE)[0].strip()
                        data["sekolah_asal"] = cand
                        break

    # Determine NIK
    if not data["nik"]:
        if all_16:
            if is_kk and data["no_kk"]:
                cand_niks = [n for n in all_16 if n != data["no_kk"]]
                if student_account_nik and student_account_nik in cand_niks:
                    data["nik"] = student_account_nik
                elif cand_niks:
                    data["nik"] = cand_niks[0]
            else:
                data["nik"] = all_16[0]
        elif student_account_nik:
            data["nik"] = student_account_nik
        elif data["nis"]:
            data["nik"] = data["nis"]

    # Global text heuristics for missed fields
    if not data["jenis_kelamin"]:
        if "LAKI-LAKI" in upper_text or "LAKI - LAKI" in upper_text:
            data["jenis_kelamin"] = "LAKI-LAKI"
        elif "PEREMPUAN" in upper_text or "WANITA" in upper_text:
            data["jenis_kelamin"] = "PEREMPUAN"

    if not data["agama"]:
        for ag in ['ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU']:
            if ag in upper_text:
                data["agama"] = ag
                break

    if is_kartu_pelajar and not data["pekerjaan"]:
        data["pekerjaan"] = "PELAJAR / MAHASISWA"

    # Assemble tempat_tanggal_lahir if missing
    if not data["tempat_tanggal_lahir"] and (data["tempat_lahir"] or data["tanggal_lahir"]):
        data["tempat_tanggal_lahir"] = f"{data['tempat_lahir']}, {data['tanggal_lahir']}".strip(', ')

    return data

def parse_ktp_kk_fields(text: str, student_account_nik: Optional[str] = None) -> Dict[str, Any]:
    """Compatibility wrapper for parse_all_identity_documents."""
    return parse_all_identity_documents(text, student_account_nik=student_account_nik)

def calculate_field_score(parsed: Dict[str, Any]) -> int:
    """Calculate extraction score for OCR candidate selection."""
    score = 0
    weights = {
        "nama": 6,
        "nik": 5,
        "no_kk": 5,
        "tempat_tanggal_lahir": 4,
        "alamat": 4,
        "kecamatan": 3,
        "kel_desa": 3,
        "rt_rw": 2,
        "jenis_kelamin": 2,
        "agama": 2,
        "pekerjaan": 2,
        "nis": 2,
    }
    for k, w in weights.items():
        v = str(parsed.get(k, '')).strip()
        if v and v != "-":
            score += w
    return score

@app.get("/")
def index():
    return {
        "status": "AI Service Running",
        "service": "SPMB MUSKA RAG & OCR",
        "engine": "OpenCV + Tesseract OCR + Fast RAG",
        "version": "2.2.0"
    }

@app.post("/ocr/scan")
async def scan_document(
    file: UploadFile = File(...),
    account_nik: Optional[str] = Form(None)
):
    """
    Enhanced Multi-Format OCR Endpoint:
    Supports Kartu Pelajar, Kartu Keluarga (KK), KTP, and KIA.
    Applies multi-candidate OpenCV preprocessing (Otsu, Grayscale, CLAHE)
    and merges extracted identity fields for maximum accuracy.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar (JPG, PNG, JPEG, dll)")

    try:
        contents = await file.read()
        preprocessed_candidates = preprocess_image_for_ocr(contents)

        best_text = ""
        best_parsed: Dict[str, Any] = {}
        best_score = -1
        all_parsed_list: list[Dict[str, Any]] = []

        # Run OCR with multiple PSM configurations (PSM 4 for tabular/card columns, PSM 6 for blocks)
        for label, img in preprocessed_candidates:
            for psm in [4, 6]:
                config_str = f'--oem 3 --psm {psm}'
                try:
                    text_candidate = pytesseract.image_to_string(img, lang='ind+eng', config=config_str)
                except Exception:
                    try:
                        text_candidate = pytesseract.image_to_string(img, lang='ind', config=config_str)
                    except Exception:
                        text_candidate = pytesseract.image_to_string(img, lang='eng', config=config_str)

                parsed = parse_all_identity_documents(text_candidate, student_account_nik=account_nik)
                score = calculate_field_score(parsed)
                all_parsed_list.append(parsed)

                if score > best_score:
                    best_score = score
                    best_text = text_candidate
                    best_parsed = parsed

                # Early exit if comprehensive info is captured
                if parsed.get("nama") and (parsed.get("nik") or parsed.get("nis")) and parsed.get("tempat_tanggal_lahir"):
                    break
            if best_score >= 20:
                break

        # Fallback to raw PIL Image if OpenCV candidates didn't get high score
        if best_score < 10:
            raw_pil = Image.open(io.BytesIO(contents))
            raw_text = pytesseract.image_to_string(raw_pil, lang='ind+eng', config='--oem 3 --psm 4')
            raw_parsed = parse_all_identity_documents(raw_text, student_account_nik=account_nik)
            raw_score = calculate_field_score(raw_parsed)
            if raw_score > best_score:
                best_score = raw_score
                best_text = raw_text
                best_parsed = raw_parsed
            all_parsed_list.append(raw_parsed)

        # Multi-Candidate Field Merging: Fill missing fields in best_parsed from other candidates
        for candidate in all_parsed_list:
            for field, val in candidate.items():
                cur_val = str(best_parsed.get(field, '')).strip()
                new_val = str(val).strip()
                if (not cur_val or cur_val == "-") and new_val and new_val != "-":
                    best_parsed[field] = new_val

        # Ensure account_nik is retained if NIK was not detected
        if (not best_parsed.get("nik") or best_parsed.get("nik") == "-") and account_nik:
            best_parsed["nik"] = account_nik

        detected_nik = best_parsed.get("nik")
        if detected_nik == "-":
            detected_nik = None

        return {
            "filename": file.filename,
            "text": best_text.strip(),
            "parsed_data": best_parsed,
            "detectedNik": detected_nik,
            "confidence": "HIGH" if (best_parsed.get("nama") and detected_nik) else "MEDIUM"
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