import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiIntegrationService } from './ai-integration.service';

@Controller('ai')
export class AiIntegrationController {
  constructor(private readonly aiService: AiIntegrationService) {}

  @Post('ocr')
  @UseInterceptors(FileInterceptor('file'))
  async ocr(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Berkas gambar tidak ditemukan. Pastikan field form-data bernama "file".',
      );
    }
    return this.aiService.extractKtp(file.buffer, file.mimetype);
  }

  @Post('chat')
  async chat(@Body('question') question: string) {
    return this.aiService.chat(question || '');
  }
}

