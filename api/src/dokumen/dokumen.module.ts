import { Module } from '@nestjs/common';
import { DokumenService } from './dokumen.service';
import { DokumenController } from './dokumen.controller';
import { AiIntegrationModule } from '../ai-integration/ai-integration.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AiIntegrationModule, PrismaModule],
  controllers: [DokumenController],
  providers: [DokumenService],
})
export class DokumenModule { }