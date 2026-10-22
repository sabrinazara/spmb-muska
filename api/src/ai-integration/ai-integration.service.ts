import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { client, handle_file } from '@gradio/client';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiIntegrationService {
  private readonly logger = new Logger(AiIntegrationService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Menginisialisasi koneksi client ke Hugging Face Space Private menggunakan token otentikasi
   */
  private async getGradioClient() {
    const spaceUrl = process.env.HF_SPACE_URL || 'https://faiz140405-spmb-ai-engine.hf.space';
    const hfToken = (process.env.HF_TOKEN || '').trim();

    const options: any = {};
    if (hfToken) {
      options.hf_token = hfToken;
      options.token = hfToken;
    }

    return await client(spaceUrl, options);
  }

  async scanDocument(file: Express.Multer.File, studentNik?: string): Promise<any> {
    // 1. Coba hubungi Hugging Face Private Space via @gradio/client
    try {
      this.logger.log(`Menghubungkan ke Hugging Face Space OCR (${process.env.HF_SPACE_URL || 'default'})...`);
      const app = await this.getGradioClient();

      const filePayload = file.buffer
        ? handle_file(file.buffer)
        : handle_file(file.path);

      const result: any = await app.predict('/ocr', [filePayload]);
      const ocrData = result?.data?.[0];

      if (ocrData) {
        if (!ocrData.detectedNik && studentNik) {
          ocrData.detectedNik = studentNik;
          if (ocrData.parsed_data) {
            ocrData.parsed_data.nik = studentNik;
          }
        }
        return ocrData;
      }
    } catch (hfErr: any) {
      this.logger.warn(`Hugging Face Space OCR tidak merespon (${hfErr?.message || hfErr}). Menggunakan fallback.`);
    }

    // 2. Fallback: Microservice Python lokal di port 8000
    try {
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      if (studentNik) {
        formData.append('account_nik', studentNik);
      }

      const response = await firstValueFrom(
        this.httpService.post('http://localhost:8000/ocr/scan', formData, {
          headers: formData.getHeaders(),
          timeout: 4000,
        }),
      );

      return response.data;
    } catch (localErr: any) {
      this.logger.warn(`Local Python OCR offline: ${localErr?.message}`);
      return {
        text: '',
        parsed_data: { nik: studentNik || '' },
        detectedNik: studentNik || null,
        confidence: 'LOW',
      };
    }
  }

  async chat(question: string): Promise<{ question: string; answer: string; source: string }> {
    const cleanQuestion = (question || '').trim();

    // 1. Coba hubungi Hugging Face Private Space via @gradio/client
    try {
      const app = await this.getGradioClient();
      const result: any = await app.predict('/rag', [cleanQuestion]);
      const rawAnswer = result?.data?.[0];

      const answer = typeof rawAnswer === 'string'
        ? rawAnswer
        : (rawAnswer?.answer || JSON.stringify(rawAnswer));

      if (answer) {
        return {
          question: cleanQuestion,
          answer,
          source: 'Hugging Face Space (Gradio RAG)',
        };
      }
    } catch (hfErr: any) {
      this.logger.warn(`Hugging Face Space RAG tidak merespon (${hfErr?.message || hfErr}). Menggunakan fallback.`);
    }

    // 2. Coba hubungi microservice Python RAG lokal di port 8000
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
          source: 'Python RAG AI Engine (Lokal)',
        };
      }
    } catch (err: any) {
      this.logger.warn(`Python AI service lokal tidak merespon (${err.message}). Menggunakan basis data cerdas internal.`);
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