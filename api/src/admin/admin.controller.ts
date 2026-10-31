import {
    Controller,
    Get,
    Put,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    Res,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

// Storage configuration for Knowledge Base PDF uploads
const kbStorage = diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './uploads/kb';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `kb-${uniqueSuffix}${ext}`);
    },
});

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('pendaftar')
    async getPendaftarList(
        @Query('search') search?: string,
        @Query('jurusan') jurusan?: string,
        @Query('status') status?: string,
        @Query('statusPembayaran') statusPembayaran?: string,
        @Query('statusKelulusan') statusKelulusan?: string,
        @Query('tahunAjaran') tahunAjaran?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.adminService.getPendaftarList({
            search,
            jurusan,
            status,
            statusPembayaran,
            statusKelulusan,
            tahunAjaran,
            page,
            limit,
        });
    }

    @Get('pendaftar/:id')
    async getPendaftarDetail(@Param('id') id: string) {
        return this.adminService.getPendaftarDetail(id);
    }

    @Put('verifikasi/:id')
    async verifikasiDokumen(
        @Param('id') id: string,
        @Body('status') status: 'VALID' | 'INVALID' | 'PENDING',
        @Body('catatanVerifikasi') catatanVerifikasi: string,
        @Request() req: any,
    ) {
        return this.adminService.verifikasiDokumen(id, status, catatanVerifikasi, req.user);
    }

    @Put('verifikasi-pembayaran/:id')
    async verifikasiPembayaran(
        @Param('id') id: string,
        @Body('statusPembayaran') statusPembayaran: 'TERVERIFIKASI' | 'DITOLAK' | 'MENUNGGU_VERIFIKASI',
        @Request() req: any,
    ) {
        return this.adminService.verifikasiPembayaran(id, statusPembayaran, req.user);
    }

    @Put('nilai/:id')
    async inputNilaiDanKelulusan(
        @Param('id') id: string,
        @Body() body: {
            nilaiUjian?: number;
            statusKelulusan?: 'LULUS' | 'TIDAK_LULUS' | 'CADANGAN' | 'MENUNGGU';
            ruangUjian?: string;
            jadwalUjian?: string;
            catatan?: string;
        },
        @Request() req: any,
    ) {
        return this.adminService.inputNilaiDanKelulusan(id, body, req.user);
    }

    @Put('kelulusan/batch')
    async updateBatchKelulusan(
        @Body() body: {
            pendaftaranIds: string[];
            statusKelulusan: 'LULUS' | 'TIDAK_LULUS' | 'CADANGAN' | 'MENUNGGU';
            catatan?: string;
        },
        @Request() req: any,
    ) {
        return this.adminService.updateBatchKelulusan(body, req.user);
    }

    @Get('export-excel')
    async exportExcel(@Res() res: Response) {
        const { csvString, filename } = await this.adminService.exportCsvData();
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(csvString);
    }

    @Get('audit-logs')
    async getAuditLogs() {
        return this.adminService.getAuditLogs();
    }

    @Delete('audit-logs')
    async clearAuditLogs(@Request() req: any) {
        return this.adminService.clearAuditLogs(req.user);
    }

    @Delete('audit-logs/:id')
    async deleteAuditLog(@Param('id') id: string, @Request() req: any) {
        return this.adminService.deleteAuditLog(id, req.user);
    }

    @Get('knowledge-base')
    async getKnowledgeBase() {
        return this.adminService.getKnowledgeBase();
    }

    @Post('knowledge-base')
    @UseInterceptors(FileInterceptor('file', { storage: kbStorage }))
    async createKnowledgeBase(
        @UploadedFile() file: Express.Multer.File,
        @Body('judul') judul: string,
        @Body('kategori') kategori?: string,
        @Body('deskripsi') deskripsi?: string,
        @Body('fileUrl') bodyFileUrl?: string,
        @Request() req?: any,
    ) {
        const fileUrl = file ? `/uploads/kb/${file.filename}` : (bodyFileUrl || '');
        return this.adminService.createKnowledgeBase(
            { judul, kategori, deskripsi, fileUrl },
            req.user
        );
    }

    @Delete('knowledge-base/:id')
    async deleteKnowledgeBase(@Param('id') id: string, @Request() req: any) {
        return this.adminService.deleteKnowledgeBase(id, req.user);
    }

    @Get('users')
    async getAdminUsers() {
        return this.adminService.getAdminUsers();
    }

    @Post('users')
    async createAdminUser(
        @Body() body: { nama: string; email: string; password?: string },
        @Request() req: any,
    ) {
        return this.adminService.createAdminUser(body, req.user);
    }

    @Put('users/:id')
    async updateAdminUser(
        @Param('id') id: string,
        @Body() body: { nama?: string; email?: string; password?: string; role?: string },
        @Request() req: any,
    ) {
        return this.adminService.updateAdminUser(id, body, req.user);
    }

    @Delete('users/:id')
    async deleteAdminUser(@Param('id') id: string, @Request() req: any) {
        return this.adminService.deleteAdminUser(id, req.user);
    }

    @Get('settings')
    async getSettings() {
        return this.adminService.getSettings();
    }

    @Put('settings')
    async updateSettings(
        @Body() body: {
            pengumumanDibuka?: boolean;
            tanggalPengumuman?: string;
            tahunAjaran?: string;
            bukaPendaftaran?: boolean;
            judulPengumuman?: string;
            pesanLulus?: string;
            pesanTidakLulus?: string;
        },
        @Request() req: any,
    ) {
        return this.adminService.updateSettings(body, req.user);
    }

    @Get('notifications')
    async getNotifications() {
        return this.adminService.getNotifications();
    }

    // === FASE 4: KUOTA JURUSAN & SELEKSI OTOMATIS ===

    @Get('kuota')
    async getKuotaJurusan() {
        return this.adminService.getKuotaJurusan();
    }

    @Put('kuota/:id')
    async updateKuotaJurusan(
        @Param('id') id: string,
        @Body('kuotaMaksimal') kuotaMaksimal: number,
        @Request() req: any,
    ) {
        return this.adminService.updateKuotaJurusan(id, kuotaMaksimal, req.user);
    }

    @Post('seleksi-otomatis')
    async jalankanSeleksiOtomatis(@Request() req: any) {
        return this.adminService.jalankanSeleksiOtomatis(req.user);
    }

    // === FASE 4: BACKUP & RESTORE DATABASE ===

    @Get('db/backup')
    async backupDatabase(@Request() req: any, @Res() res: Response) {
        const backupData = await this.adminService.backupDatabase(req.user);
        const filename = `backup-spmb-muska-${new Date().toISOString().split('T')[0]}.json`;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(JSON.stringify(backupData, null, 2));
    }

    @Post('db/restore')
    async restoreDatabase(@Body() body: any, @Request() req: any) {
        return this.adminService.restoreDatabase(body, req.user);
    }
}

