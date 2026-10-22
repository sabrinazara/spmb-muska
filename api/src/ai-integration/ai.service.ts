import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { client, handle_file } from '@gradio/client';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {}

  private getSpaceUrl(): string {
    return (
      this.configService.get<string>('HF_SPACE_URL') ||
      process.env.HF_SPACE_URL ||
      'https://faiz140405-spmb-ai-engine.hf.space'
    );
  }

  private getHfToken(): string {
    return (
      this.configService.get<string>('HF_TOKEN') ||
      process.env.HF_TOKEN ||
      ''
    ).trim();
  }

  /**
   * Ekstraksi dokumen KTP/KK/Kartu Pelajar menggunakan Gradio OCR di Hugging Face Private Space
   * @param fileBuffer Buffer berkas dari multer
   * @param mimeType MIME type berkas (default: image/jpeg)
   */
  async extractKtp(fileBuffer: Buffer, mimeType: string = 'image/jpeg'): Promise<any> {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw new HttpException(
        'Buffer berkas KTP tidak valid atau kosong',
        HttpStatus.BAD_REQUEST,
      );
    }

    const spaceUrl = this.getSpaceUrl();
    const hfToken = this.getHfToken();

    try {
      this.logger.log(`Menghubungkan ke AI Engine di ${spaceUrl}...`);
      const app = await client(spaceUrl, {
        token: hfToken,
        hf_token: hfToken,
      });

      // Konversi buffer ke Blob dan siapkan payload via handle_file
      const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType });
      const payload = handle_file(blob);

      this.logger.log('Mengirim berkas ke endpoint /ocr Hugging Face...');
      const result: any = await app.predict('/ocr', [payload]);

      const ocrData = result?.data?.[0];
      if (!ocrData) {
        throw new Error('Hasil ekstraksi data OCR kosong dari AI Engine');
      }

      this.logger.log('Ekstraksi OCR berhasil diproses');
      return ocrData;
    } catch (err: any) {
      this.logger.error(`Gagal memproses OCR di Hugging Face: ${err.message}`, err.stack);
      throw new HttpException(
        `Layanan AI Engine OCR gagal merespons atau sedang sleeping: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Tanya RAG Chatbot Asisten SPMB di Hugging Face Private Space
   * @param question Pertanyaan pengguna
   */
  async tanyaRag(question: string): Promise<string> {
    const cleanQuestion = (question || '').trim();
    if (!cleanQuestion) {
      throw new HttpException('Pertanyaan tidak boleh kosong', HttpStatus.BAD_REQUEST);
    }

    const spaceUrl = this.getSpaceUrl();
    const hfToken = this.getHfToken();

    try {
      const app = await client(spaceUrl, {
        token: hfToken,
        hf_token: hfToken,
      });

      const result: any = await app.predict('/rag', [cleanQuestion]);
      const rawAnswer = result?.data?.[0];

      return typeof rawAnswer === 'string'
        ? rawAnswer
        : (rawAnswer?.answer || JSON.stringify(rawAnswer));
    } catch (err: any) {
      this.logger.error(`Gagal memproses RAG di Hugging Face: ${err.message}`);
      throw new HttpException(
        `Layanan AI RAG Chatbot gagal merespons atau sedang sleeping: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
