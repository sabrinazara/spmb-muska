import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'rahasia-spmb-muska-2026', // Idealnya taruh di .env
      signOptions: { expiresIn: '7d' }, // Token berlaku 7 hari agar sesi panitia tidak cepat kedaluwarsa
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule { }