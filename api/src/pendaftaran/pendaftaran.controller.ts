import { Controller, Post, Put, Get, Body, UseGuards, Request, Res } from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { AuthGuard } from '../auth/auth.guard';
import { LengkapiDataDto } from './dto/lengkapi-data.dto';
import type { Response } from 'express';

@Controller('pendaftaran')
@UseGuards(AuthGuard)
export class PendaftaranController {
    constructor(private readonly pendaftaranService: PendaftaranService) { }

    @Get('saya')
    async getPendaftaranSaya(@Request() req: any) {
        return this.pendaftaranService.getPendaftaranByUserId(req.user.sub);
    }

    @Get('status')
    async getStatusPendaftaran(@Request() req: any) {
        return this.pendaftaranService.getStatusPendaftaran(req.user.sub);
    }

    @Post('buat')
    async buatPendaftaran(
        @Request() req: any,
        @Body('userId') bodyUserId?: string,
        @Body('nisn') nisn?: string,
        @Body('nik') nik?: string,
        @Body('jurusan') jurusan?: string,
    ) {
        const userId = bodyUserId || req.user.sub;
        return this.pendaftaranService.buatPendaftaran(userId, nisn || '', nik || '', jurusan || '');
    }

    @Post('lengkapi-data')
    async simpanLengkapiDataPost(@Request() req: any, @Body() dto: LengkapiDataDto) {
        return this.pendaftaranService.simpanLengkapiData(req.user.sub, dto);
    }

    @Put('lengkapi-data')
    async simpanLengkapiDataPut(@Request() req: any, @Body() dto: LengkapiDataDto) {
        return this.pendaftaranService.simpanLengkapiData(req.user.sub, dto);
    }

    @Get('kartu-ujian')
    async downloadKartuUjian(@Request() req: any, @Res() res: Response) {
        const { buffer, filename } = await this.pendaftaranService.generateKartuUjianPdf(req.user.sub);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    }

    @Get('ringkasan-formulir')
    async downloadRingkasanFormulir(@Request() req: any, @Res() res: Response) {
        const { buffer, filename } = await this.pendaftaranService.generateRingkasanFormulirPdf(req.user.sub);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    }
}