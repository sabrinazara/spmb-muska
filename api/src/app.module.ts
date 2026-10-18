import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiIntegrationModule } from './ai-integration/ai-integration.module';
import { AuthModule } from './auth/auth.module';
import { DokumenModule } from './dokumen/dokumen.module';
import { PrismaModule } from './prisma/prisma.module';
import { PendaftaranModule } from './pendaftaran/pendaftaran.module';
import { AdminModule } from './admin/admin.module';
import { LandingPageModule } from './landing-page/landing-page.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AiIntegrationModule,
    AuthModule,
    DokumenModule,
    PrismaModule,
    PendaftaranModule,
    AdminModule,
    LandingPageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
