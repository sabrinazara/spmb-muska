import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // WAJIB ADA AGAR FRONTEND BISA MENGAKSES API
  app.enableCors();

  await app.listen(3000);
}
bootstrap();