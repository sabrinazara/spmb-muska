import os
# Matikan mode SSR Node.js Gradio 5/6 agar tidak crash di Hugging Face Spaces
os.environ["GRADIO_SSR_MODE"] = "False"

import io
import re
import cv2
import numpy as np
from PIL import Image
import pytesseract
import gradio as gr
from typing import Optional, Dict, Any, Union

# Dukungan Hugging Face ZeroGPU (@spaces.GPU)
try:
    import spaces
except ImportError:
    class spaces:
        @staticmethod
        def GPU(fn=None, *args, **kwargs):
            if fn:
                return fn
            def decorator(f):
                return f
            return decorator

# Set Tesseract path for Windows environments if present (Hugging Face Linux uses /usr/bin/tesseract)
if os.name == 'nt' and os.path.exists(r'C:\Program Files\Tesseract-OCR\tesseract.exe'):
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
    """Normalize OCR text removing non-printable artifacts."""
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

def preprocess_image_for_ocr(img: np.ndarray) -> list[tuple[str, np.ndarray]]:
    """Generate image variations for robust OCR extraction."""
    h, w = img.shape[:2]
    if w < 1400:
        scale = 1400.0 / w
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img

    _, thresh_otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    filtered = cv2.bilateralFilter(gray, 9, 75, 75)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(filtered)
    _, thresh_otsu_clahe = cv2.threshold(clahe, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    return [
        ("CLAHE", clahe),
        ("OTSU_CLAHE", thresh_otsu_clahe),
        ("OTSU", thresh_otsu),
        ("GRAY", gray),
    ]

def parse_identity_document(text: str) -> Dict[str, Any]:
    """Parse text into structured fields for KTP, Kartu Keluarga (KK), and Kartu Pelajar."""
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

    # Document type detection
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

    # Extract 16 digit sequences
    all_16 = re.findall(r'\b\d{16}\b', upper_text)
    if all_16:
        if is_kk:
            data["no_kk"] = all_16[0]
            data["nomor_kk"] = all_16[0]
            if len(all_16) > 1:
                data["nik"] = all_16[1]
        else:
            data["nik"] = all_16[0]

    # Check for NIS / NISN
    nis_match = re.search(r'\b(?:NISN|NIS|NO\.?\s*INDUK)\s*[:=~?.\s]*(\d{5,12})\b', upper_text)
    if nis_match:
        data["nis"] = nis_match.group(1)
        data["nisn"] = nis_match.group(1)

    # Line by line extraction
    for line in lines:
        upper = line.upper()

        # NAMA
        if not data["nama"]:
            if 'NAMA' in upper and not any(k in upper for k in ['SEKOLAH', 'IBU', 'AYAH', 'ORANG TUA', 'KOTA', 'DESA', 'GURU']):
                val = re.sub(r'^(?:.*NAMA\s*(?:SISWA|LENGKAP|KEPALA\s*KELUARGA)?\s*[:=~?.\s]*|[:=~?.\s]+)', '', line, flags=re.IGNORECASE).strip()
                val = re.sub(r'[^A-Za-z\s\.,\']', '', val).strip()
                if len(val) >= 3 and not any(k in val.upper() for k in ['KEPALA', 'KELUARGA', 'KARTU', 'PELAJAR', 'SMP', 'SEKOLAH']):
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

    # Fallback heuristic for gender and religion
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

    if not data["tempat_tanggal_lahir"] and (data["tempat_lahir"] or data["tanggal_lahir"]):
        data["tempat_tanggal_lahir"] = f"{data['tempat_lahir']}, {data['tanggal_lahir']}".strip(', ')

    return data

# ==========================================
# 1. FUNGSI PROSES OCR
# ==========================================
@spaces.GPU
def proses_ocr(gambar: Union[str, Image.Image, np.ndarray, None]) -> Dict[str, Any]:
    """
    Memproses gambar dokumen identitas (KTP, KK, Kartu Pelajar) menggunakan Tesseract OCR.
    Menghasilkan data terstruktur (NIK, Nama, Tanggal Lahir, Alamat, dll).
    """
    if gambar is None:
        return {
            "error": "Tidak ada berkas gambar yang diunggah.",
            "text": "",
            "parsed_data": {},
            "detectedNik": None,
            "confidence": "LOW"
        }

    try:
        # Konversi input ke numpy ndarray BGR untuk OpenCV
        if isinstance(gambar, str):
            cv_img = cv2.imread(gambar)
        elif isinstance(gambar, Image.Image):
            cv_img = cv2.cvtColor(np.array(gambar), cv2.COLOR_RGB2BGR)
        elif isinstance(gambar, np.ndarray):
            if len(gambar.shape) == 3 and gambar.shape[2] == 3:
                cv_img = cv2.cvtColor(gambar, cv2.COLOR_RGB2BGR)
            else:
                cv_img = gambar
        else:
            return {
                "error": "Format gambar tidak didukung.",
                "text": "",
                "parsed_data": {},
                "detectedNik": None,
                "confidence": "LOW"
            }

        candidates = preprocess_image_for_ocr(cv_img)
        best_text = ""
        best_parsed: Dict[str, Any] = {}
        highest_score = -1

        for label, img_candidate in candidates:
            for psm in [4, 6]:
                config_str = f'--oem 3 --psm {psm}'
                try:
                    text_candidate = pytesseract.image_to_string(img_candidate, lang='ind+eng', config=config_str)
                except Exception:
                    try:
                        text_candidate = pytesseract.image_to_string(img_candidate, lang='ind', config=config_str)
                    except Exception:
                        text_candidate = pytesseract.image_to_string(img_candidate, lang='eng', config=config_str)

                parsed = parse_identity_document(text_candidate)
                # Hitung skor kelengkapan field
                score = sum(1 for v in parsed.values() if v and v != "UNKNOWN" and v != "-")
                if parsed.get("nik"): score += 5
                if parsed.get("nama"): score += 5

                if score > highest_score:
                    highest_score = score
                    best_text = text_candidate
                    best_parsed = parsed

                if parsed.get("nama") and parsed.get("nik"):
                    break
            if highest_score >= 12:
                break

        detected_nik = best_parsed.get("nik") or None
        is_high_conf = bool(best_parsed.get("nama") and detected_nik)

        return {
            "text": best_text.strip(),
            "parsed_data": best_parsed,
            "detectedNik": detected_nik,
            "confidence": "HIGH" if is_high_conf else "MEDIUM"
        }

    except Exception as e:
        return {
            "error": f"Gagal mengekstraksi OCR: {str(e)}",
            "text": "",
            "parsed_data": {},
            "detectedNik": None,
            "confidence": "ERROR"
        }

# ==========================================
# 2. FUNGSI TANYA RAG (CHATBOT)
# ==========================================
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

@spaces.GPU
def tanya_rag(pertanyaan: str) -> str:
    """
    Logika dasar chatbot asisten informasi SPMB SMK Muhammadiyah Sekampung berbasis RAG / Knowledge Base.
    """
    q = (pertanyaan or '').lower().strip()

    if not q:
        return "Silakan ketik pertanyaan Anda seputar SPMB SMK Muhammadiyah Sekampung."

    if any(k in q for k in ["jurusan", "prodi", "kejuruan", "daftar jurusan", "pilihan"]):
        return (
            "SMK Muhammadiyah Sekampung memiliki 8 Program Keahlian unggulan berstandar industri:\n"
            "1. Teknik Jaringan Komputer dan Telekomunikasi (TJKT)\n"
            "2. Teknik Otomotif / Sepeda Motor (TSM)\n"
            "3. Desain Komunikasi Visual (DKV)\n"
            "4. Bisnis Digital dan Kreatif (BD)\n"
            "5. Kulineri / Tata Boga\n"
            "6. Kecantikan dan Tata Rias\n"
            "7. Teknik Pemesinan (CNC)\n"
            "8. Teknik Pengelasan (Welding)\n\n"
            "Semua jurusan dilengkapi bengkel & laboratorium berstandar industri modern."
        )

    if any(k in q for k in ["biaya", "bayar", "uang", "gratis", "tarif"]):
        return (
            "Pendaftaran online di SPMB SMK Muhammadiyah Sekampung adalah GRATIS (Rp 0). "
            "Biaya seragam dan administrasi daftar ulang dapat dibayarkan saat verifikasi berkas offline di sekolah setelah dinyatakan lulus seleksi."
        )

    if any(k in q for k in ["syarat", "dokumen", "berkas", "ktp", "kk", "ijazah", "upload"]):
        return (
            "Persyaratan berkas pendaftaran yang wajib diunggah:\n"
            "• Scan/Foto KTP Calon Siswa / KIA atau Kartu Keluarga (KK)\n"
            "• Scan/Foto Ijazah SMP/MTs atau Surat Keterangan Lulus (SKL)\n"
            "• Pas Foto calon siswa terbaru.\n"
            "Sistem kami dilengkapi teknologi OCR otomatis yang akan mengenali data berkas secara instan."
        )

    if any(k in q for k in ["ujian", "tes", "jadwal", "cbt", "kapan", "lokasi"]):
        return (
            "Jadwal dan ruang ujian CBT diatur oleh panitia setelah berkas diverifikasi. "
            "Setelah status berkas Anda 'VALID', Anda dapat mencetak 'Kartu Peserta Ujian' langsung dari halaman dashboard peserta."
        )

    if any(k in q for k in ["seragam", "baju", "ukuran"]):
        return (
            "Ukuran seragam sekolah tersedia mulai dari ukuran S, M, L, XL, XXL, XXXL, hingga 4XL, "
            "serta opsi ukuran kustom sesuai ukuran badan calon siswa."
        )

    if any(k in q for k in ["ekstra", "organisasi", "kegiatan", "ipm", "hw", "tapak suci"]):
        return (
            "SMK Muhammadiyah Sekampung menyediakan kegiatan organisasi & ekstrakurikuler yang lengkap: "
            "Ikatan Pelajar Muhammadiyah (IPM), Hizbul Wathan (HW), Tapak Suci Putra Muhammadiyah, "
            "Futsal, Bola Voli, Web Programming, Band, E-Sport, dan Jurnalistik."
        )

    return (
        f"Terima kasih atas pertanyaannya mengenai '{pertanyaan}'. "
        "Pendaftaran Siswa Baru (SPMB) SMK Muhammadiyah Sekampung sedang dibuka secara online. "
        "Silakan lengkapi formulir pendaftaran dan unggah berkas Anda. "
        "Jika ada pertanyaan lebih lanjut, Anda dapat menghubungi sekretariat panitia di 0813-7765-3555."
    )

# ==========================================
# 3. ANTARMUKA GRADIO (gr.Blocks)
# ==========================================
with gr.Blocks(title="SPMB MUSKA AI Engine") as demo:
    gr.Markdown("# 🚀 SPMB SMK Muhammadiyah Sekampung - AI Engine")
    gr.Markdown("Layanan Microservice Kecerdasan Buatan untuk **Optical Character Recognition (OCR)** Dokumen Identitas dan **RAG Asisten Informasi SPMB**.")

    with gr.Tab("📄 OCR Dokumen Identitas"):
        gr.Markdown("Unggah foto/scan dokumen KTP, Kartu Keluarga (KK), atau Kartu Pelajar untuk mengekstrak data teks dan identitas.")
        with gr.Row():
            with gr.Column():
                input_image = gr.Image(type="pil", label="Unggah Dokumen (KTP / KK / Kartu Pelajar)")
                btn_ocr = gr.Button("🔍 Proses Ekstraksi Dokumen", variant="primary")
            with gr.Column():
                output_ocr = gr.JSON(label="Hasil Ekstraksi OCR (JSON)")

        # Binding REST API dengan api_name="ocr"
        btn_ocr.click(
            fn=proses_ocr,
            inputs=input_image,
            outputs=output_ocr,
            api_name="ocr"
        )

    with gr.Tab("💬 SPMB RAG Chatbot"):
        gr.Markdown("Asisten virtual cerdas untuk menjawab informasi seputar pendaftaran, jurusan, biaya, jadwal ujian, dan persyaratan.")
        with gr.Row():
            with gr.Column():
                input_pertanyaan = gr.Textbox(lines=3, placeholder="Contoh: Apa saja syarat pendaftaran dan jurusan yang tersedia?", label="Pertanyaan Anda")
                btn_rag = gr.Button("💬 Tanyakan ke Asisten", variant="primary")
            with gr.Column():
                output_jawaban = gr.Textbox(lines=6, label="Jawaban Asisten SPMB")

        # Binding REST API dengan api_name="rag"
        btn_rag.click(
            fn=tanya_rag,
            inputs=input_pertanyaan,
            outputs=output_jawaban,
            api_name="rag"
        )

if __name__ == "__main__":
    try:
        demo.launch(server_name="0.0.0.0", server_port=7860, ssr_mode=False)
    except TypeError:
        demo.launch(server_name="0.0.0.0", server_port=7860)
