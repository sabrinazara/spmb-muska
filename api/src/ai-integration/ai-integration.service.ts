import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiIntegrationService {
  private readonly logger = new Logger(AiIntegrationService.name);

  constructor(private readonly httpService: HttpService) {}

  async scanDocument(file: Express.Multer.File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await firstValueFrom(
      this.httpService.post('http://localhost:8000/ocr/scan', formData, {
        headers: formData.getHeaders(),
      }),
    );

    return response.data;
  }

  async chat(question: string): Promise<{ question: string; answer: string; source: string }> {
    const cleanQuestion = (question || '').trim();

    // 1. Coba hubungi microservice Python RAG di port 8000
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'http://localhost:8000/rag/chat',
          { question: cleanQuestion },
          { timeout: 3500 },
        ),
      );

      if (response.data && response.data.answer) {
        return {
          question: cleanQuestion,
          answer: response.data.answer,
          source: 'Python RAG AI Engine',
        };
      }
    } catch (err: any) {
      this.logger.warn(`Python AI service tidak merespon (${err.message}). Menggunakan basis data cerdas internal.`);
    }

    // 2. Intelligent Fallback Knowledge Base SMK Muhammadiyah Sekampung
    const qLower = cleanQuestion.toLowerCase();

    if (qLower.includes('jurusan') || qLower.includes('prodi') || qLower.includes('kejuruan') || qLower.includes('daftar jurusan')) {
      return {
        question: cleanQuestion,
        answer:
          'SMK Muhammadiyah Sekampung membuka 8 Program Keahlian unggulan berstandar industri:\n' +
          '1. Teknik Jaringan Komputer dan Telekomunikasi\n' +
          '2. Teknik Otomotif (Teknik Sepeda Motor)\n' +
          '3. Desain Komunikasi Visual\n' +
          '4. Bisnis Digital dan Kreatif\n' +
          '5. Kulineri (Tata Boga)\n' +
          '6. Kecantikan dan Tata Rias\n' +
          '7. Teknik Pemesinan (CNC)\n' +
          '8. Teknik Pengelasan (Welding).\n' +
          'Semua jurusan dilengkapi bengkel & laboratorium standar industri (DUDI).',
        source: 'Basis Pengetahuan Internal SPMB MUSKA',
      };
    }

    if (qLower.includes('syarat') || qLower.includes('dokumen') || qLower.includes('berkas') || qLower.includes('ktp') || qLower.includes('kk') || qLower.includes('ijazah')) {
      return {
        question: cleanQuestion,
        answer:
          'Persyaratan berkas pendaftaran yang wajib diunggah:\n' +
          '• Scan/Foto KTP Calon Siswa / KIA (akan diekstraksi NIK-nya oleh sistem OCR kami)\n' +
          '• Scan/Foto Kartu Keluarga (KK)\n' +
          '• Scan/Foto Ijazah SMP/MTs atau Surat Keterangan Lulus (SKL)\n' +
          '• Bukti transfer biaya pendaftaran.\n' +
          'Pastikan foto dokumen jelas dan terbaca agar verifikasi otomatis berjalan lancar.',
        source: 'Basis Pengetahuan Internal SPMB MUSKA',
      };
    }

    if (qLower.includes('organisasi') || qLower.includes('ekstra') || qLower.includes('intra') || qLower.includes('kegiatan')) {
      return {
        question: cleanQuestion,
        answer:
          'SMK Muhammadiyah Sekampung menyediakan wadah pengembangan diri yang lengkap:\n' +
          '• Intrakurikuler: Ikatan Pelajar Muhammadiyah (IPM), Hizbul Wathan, Tapak Suci Putra Muhammadiyah, Pramuka.\n' +
          '• Ekstrakurikuler: Bola Voli, Paskibra, Beladiri, Futsal, Web Programming, Paduan Suara, Seni Tari, Muska Band, E-Sport, dan Jurnalistik.',
        source: 'Basis Pengetahuan Internal SPMB MUSKA',
      };
    }

    if (qLower.includes('seragam') || qLower.includes('baju') || qLower.includes('ukuran')) {
      return {
        question: cleanQuestion,
        answer:
          'Ukuran seragam sekolah tersedia lengkap disesuaikan dengan berat badan Anda:\n' +
          '• S (30-40 kg)\n• M (40-45 kg)\n• L (45-50 kg)\n• XL (50-55 kg)\n• XXL (55-60 kg)\n• XXXL (60-65 kg)\n• 4XL (65-70 kg)\n' +
          'Serta opsi "Ukuran Lainnya" jika Anda membutuhkan penyesuaian khusus.',
        source: 'Basis Pengetahuan Internal SPMB MUSKA',
      };
    }

    if (qLower.includes('jadwal') || qLower.includes('kapan') || qLower.includes('tes') || qLower.includes('ujian') || qLower.includes('cbt')) {
      return {
        question: cleanQuestion,
        answer:
          'Pendaftaran Gelombang 1 dibuka mulai sekarang. Ujian seleksi dilaksanakan di Ruang CBT Kampus 1 SMK Muhammadiyah Sekampung. ' +
          'Setelah seluruh berkas Anda dinyatakan "Terverifikasi" oleh panitia, tombol "Unduh Kartu Peserta Ujian" akan otomatis aktif di dashboard Anda.',
        source: 'Basis Pengetahuan Internal SPMB MUSKA',
      };
    }

    return {
      question: cleanQuestion,
      answer:
        `Halo! Terima kasih atas pertanyaannya mengenai "${cleanQuestion}". ` +
        'Pendaftaran Peserta Didik Baru SMK Muhammadiyah Sekampung sedang dibuka secara online. ' +
        'Silakan lengkapi formulir pendaftaran di menu "Lengkapi Data" dan unggah berkas Anda di menu "Upload Dokumen". ' +
        'Jika Anda butuh bantuan lebih lanjut, silakan tanyakan spesifik mengenai jurusan, biaya, seragam, atau jadwal ujian.',
      source: 'Asisten Virtual SPMB MUSKA',
    };
  }
}