import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiIntegrationService } from '../ai-integration/ai-integration.service';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DokumenService {
    constructor(
        private prisma: PrismaService,
        private aiIntegrationService: AiIntegrationService,
    ) { }

    private extractPotentialNik(text: string): string | null {
        // Cari urutan 16 digit angka
        const match = text.match(/\b\d{16}\b/);
        if (match) return match[0];

        // Cari pola NIK dengan normalisasi OCR (misal huruf O/I/L yang terbaca)
        let normalized = text.replace(/[\s\W_]+/g, '').toUpperCase();
        normalized = normalized
            .replace(/O/g, '0')
            .replace(/I/g, '1')
            .replace(/L/g, '1')
            .replace(/B/g, '8')
            .replace(/S/g, '5')
            .replace(/Z/g, '2')
            .replace(/G/g, '6')
            .replace(/A/g, '4');
        
        const normMatch = normalized.match(/\d{16}/);
        return normMatch ? normMatch[0] : null;
    }

    async scanPreview(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Berkas gambar tidak ditemukan');
        }

        let teksEkstraksi = '';
        try {
            const ocrResult = await this.aiIntegrationService.scanDocument(file);
            teksEkstraksi = ocrResult?.text || '';
        } catch (error) {
            console.warn('Layanan OCR Python offline atau gagal:', (error as any)?.message);
        }

        const detectedNik = this.extractPotentialNik(teksEkstraksi);

        return {
            filename: file.originalname,
            text: teksEkstraksi,
            detectedNik,
        };
    }

    async prosesUploadDokumen(
        file: Express.Multer.File,
        pendaftaranIdOrUserId: string,
        jenisDokumen: string,
        confirmedNik?: string,
        confirmedText?: string,
    ) {
        if (!file) {
            throw new BadRequestException('Berkas dokumen wajib diunggah');
        }

        // Cari data pendaftaran berdasarkan pendaftaranId atau userId
        let pendaftaran = await this.prisma.pendaftaran.findUnique({
            where: { id: pendaftaranIdOrUserId },
        });

        if (!pendaftaran) {
            pendaftaran = await this.prisma.pendaftaran.findUnique({
                where: { userId: pendaftaranIdOrUserId },
            });
        }

        if (!pendaftaran) {
            throw new NotFoundException('Data pendaftaran tidak ditemukan. Pastikan Anda telah melengkapi biodata pendaftaran.');
        }

        // Ekstraksi OCR jika confirmedText belum ada
        let teksEkstraksi = confirmedText || '';
        if (!teksEkstraksi) {
            try {
                const ocrResult = await this.aiIntegrationService.scanDocument(file);
                teksEkstraksi = ocrResult?.text || '';
            } catch (error) {
                console.warn('Layanan OCR Python offline atau gagal:', (error as any)?.message);
            }
        }

        // Validasi KTP / KK dengan NIK Pendaftar
        let statusValidasi: 'PENDING' | 'VALID' | 'INVALID' = 'PENDING';

        const nikPendaftar = pendaftaran.nik.replace(/[\s\W_]+/g, '');
        const nikToCompare = (confirmedNik || this.extractPotentialNik(teksEkstraksi) || '').replace(/[\s\W_]+/g, '');

        if (jenisDokumen.toUpperCase() === 'KTP' || jenisDokumen.toUpperCase() === 'KK') {
            let teksBersihOCR = teksEkstraksi.replace(/[\s\W_]+/g, '').toUpperCase();
            teksBersihOCR = teksBersihOCR
                .replace(/O/g, '0')
                .replace(/I/g, '1')
                .replace(/L/g, '1')
                .replace(/B/g, '8')
                .replace(/S/g, '5')
                .replace(/Z/g, '2')
                .replace(/G/g, '6')
                .replace(/A/g, '4');

            const isNikCocok = (nikToCompare && nikToCompare === nikPendaftar) || teksBersihOCR.includes(nikPendaftar);
            statusValidasi = isNikCocok ? 'VALID' : 'INVALID';
        } else {
            // Untuk Ijazah / SKL / Akta jika terisi teks kita anggap PENDING/VALID
            statusValidasi = teksEkstraksi.length > 10 ? 'VALID' : 'PENDING';
        }

        // Simpan file ke direktori uploads
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const safeFilename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadDir, safeFilename);
        fs.writeFileSync(filePath, file.buffer);

        // Simpan ke database
        const dokumen = await this.prisma.dokumen.create({
            data: {
                pendaftaranId: pendaftaran.id,
                jenisDokumen: jenisDokumen,
                fileUrl: `/uploads/${safeFilename}`,
                hasiltEkstraksi: teksEkstraksi,
                status: statusValidasi,
            },
        });

        // Jika dokumen ini VALID dan jenisnya KTP/KK, otomatis perbarui status Pendaftaran menjadi VALID jika disetujui
        if (statusValidasi === 'VALID') {
            await this.prisma.pendaftaran.update({
                where: { id: pendaftaran.id },
                data: {
                    status: 'VALID',
                    catatanVerifikasi: `Dokumen ${jenisDokumen} berhasil diverifikasi secara otomatis oleh sistem OCR. NIK cocok.`,
                },
            });
        }

        return {
            message: statusValidasi === 'VALID'
                ? `Dokumen ${jenisDokumen} valid. NIK cocok dengan biodata pendaftaran!`
                : `Dokumen ${jenisDokumen} berhasil disimpan, menunggu validasi panitia.`,
            status: statusValidasi,
            data: dokumen,
            teksEkstraksi,
        };
    }
}