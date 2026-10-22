import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // WAJIB ADA AGAR FRONTEND BISA MENGAKSES API
  app.enableCors();

  // Sajikan berkas unggahan dokumen & bukti transfer secara statis dari root folder uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend API SPMB MUSKA running on port ${port}`);
}
bootstrap();