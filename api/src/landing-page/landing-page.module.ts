import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LandingPageController } from './landing-page.controller';
import { LandingPageService } from './landing-page.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'rahasia-spmb-muska-2026',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [LandingPageController],
    providers: [LandingPageService],
    exports: [LandingPageService],
})
export class LandingPageModule { }
