import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { DbController } from './db.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'rahasia-spmb-muska-2026',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [AdminController, DbController],
    providers: [AdminService, AdminGuard],
    exports: [AdminService],
})
export class AdminModule { }
