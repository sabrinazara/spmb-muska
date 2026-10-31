import { Controller, Post, Put, Get, Body, UseGuards, Request, Res, Query } from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { AuthGuard } from '../auth/auth.guard';
import { LengkapiDataDto } from './dto/lengkapi-data.dto';
import type { Response } from 'express';

@Controller('pendaftaran')
export class PendaftaranController {
    constructor(private readonly pendaftaranService: PendaftaranService) { }

    @Get('saya')
    @UseGuards(AuthGuard)
    async getPendaftaranSaya(@Request() req: any) {
        return this.pendaftaranService.getPendaftaranByUserId(req.user.sub);
    }

    @Get('status')
    @UseGuards(AuthGuard)
    async getStatusPendaftaran(@Request() req: any) {
        return this.pendaftaranService.getStatusPendaftaran(req.user.sub);
    }

    @Post('buat')
    @UseGuards(AuthGuard)
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
    @UseGuards(AuthGuard)
    async simpanLengkapiDataPost(@Request() req: any, @Body() dto: LengkapiDataDto) {
        return this.pendaftaranService.simpanLengkapiData(req.user.sub, dto);
    }

    @Put('lengkapi-data')
    @UseGuards(AuthGuard)
    async simpanLengkapiDataPut(@Request() req: any, @Body() dto: LengkapiDataDto) {
        return this.pendaftaranService.simpanLengkapiData(req.user.sub, dto);
    }

    @Get('kartu-ujian')
    @UseGuards(AuthGuard)
    async downloadKartuUjian(@Request() req: any, @Res() res: Response) {
        const { buffer, filename } = await this.pendaftaranService.generateKartuUjianPdf(req.user.sub);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    }

    @Get('ringkasan-formulir')
    @UseGuards(AuthGuard)
    async downloadRingkasanFormulir(@Request() req: any, @Res() res: Response) {
        const { buffer, filename } = await this.pendaftaranService.generateRingkasanFormulirPdf(req.user.sub);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    }

    // Public: Pengumuman Kelulusan countdown & status pendaftaran SPMB
    @Get('pengumuman')
    async getPengumuman() {
        return this.pendaftaranService.getPengumumanStatus();
    }

    // Public: Cek Status Kelulusan Online Tanpa Login (by NISN atau Nomor Pendaftaran/Ujian)
    @Get('cek-kelulusan')
    async cekKelulusanPublic(@Query('keyword') keyword: string) {
        return this.pendaftaranService.cekKelulusanPublic(keyword);
    }

    // Public: Unduh Surat Keterangan Lulus (SKL) PDF
    @Get('surat-kelulusan-pdf')
    async downloadSuratKelulusanPdf(@Query('keyword') keyword: string, @Res() res: Response) {
        const { buffer, filename } = await this.pendaftaranService.generateSuratKelulusanPdf(keyword);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        res.end(buffer);
    }

    // Public: Status SPMB (Buka/Tutup, Tahun Ajaran)
    @Get('status-sistem')
    async getStatusSistem() {
        return this.pendaftaranService.getPengumumanStatus();
    }
}