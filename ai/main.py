from fastapi import FastAPI, UploadFile, File, HTTPException
import pytesseract
from PIL import Image
import io
from pydantic import BaseModel

app = FastAPI()

# UNTUK WINDOWS: Hapus tanda pagar (#) di bawah dan sesuaikan path instalasi Tesseract kamu
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

@app.get("/")
def index():
    return {"status": "AI Service Running"}

@app.post("/ocr/scan")
async def scan_document(file: UploadFile = File(...)):
    # Validasi tipe file
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar (JPG, PNG, dll)")

    try:
        # Baca gambar dari request
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Ekstraksi teks menggunakan pytesseract (gunakan bahasa Indonesia 'ind' jika sudah download traineddata-nya)
        extracted_text = pytesseract.image_to_string(image, lang='ind')
        
        return {
            "filename": file.filename,
            "text": extracted_text.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
class ChatRequest(BaseModel):
    question: str

# Data dummy pengetahuan SPMB (nantinya bisa diambil dari database/vector store)
SPMB_KNOWLEDGE = """
Sekolah: SMK Muhammadiyah Sekampung
Jurusan: Teknik Kendaraan Ringan (TKR), Teknik Komputer & Jaringan (TKJ), Akuntansi.
Persyaratan Pendaftaran: Fotokopi KTP/Kartu Keluarga, Fotokopi Ijazah/SKL, Pas Foto 3x4 (2 lembar).
Jadwal Pendaftaran: Gelombang 1 buka dari Mei hingga Juni.
"""

@app.post("/rag/chat")
async def chat_spmb(payload: ChatRequest):
    # Logika RAG sederhana: Mencari konteks jawaban berdasarkan pertanyaan
    # Nantinya bagian ini dihubungkan dengan LLM (OpenAI/Ollama) & Vector Database
    return {
        "question": payload.question,
        "answer": f"Terima kasih telah bertanya tentang '{payload.question}'. Saat ini pendaftaran SMK Muhammadiyah Sekampung sedang dibuka.",
        "context_used": SPMB_KNOWLEDGE
    }