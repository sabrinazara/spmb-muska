import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LengkapiDataDto } from './dto/lengkapi-data.dto';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PendaftaranService {
    constructor(private prisma: PrismaService) { }

    async getPendaftaranByUserId(userId: string) {
        return this.prisma.pendaftaran.findUnique({
            where: { userId },
            include: {
                dokumen: {
                    orderBy: { createdAt: 'desc' },
                },
                user: {
                    select: {
                        id: true,
                        nama: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }

    async getStatusPendaftaran(userId: string) {
        const pendaftaran = await this.prisma.pendaftaran.findUnique({
            where: { userId },
            include: {
                dokumen: {
                    orderBy: { createdAt: 'desc' },
                },
                user: {
                    select: {
                        id: true,
                        nama: true,
                        email: true,
                    },
                },
            },
        });

        if (!pendaftaran) {
            throw new NotFoundException('Data pendaftaran belum ditemukan. Silakan lengkapi formulir terlebih dahulu.');
        }

        return {
            pendaftaranId: pendaftaran.id,
            nomorPendaftaran: pendaftaran.nomorPendaftaran,
            status: pendaftaran.status,
            catatanVerifikasi: pendaftaran.catatanVerifikasi,
            namaLengkap: pendaftaran.namaLengkap || pendaftaran.user?.nama,
            nisn: pendaftaran.nisn,
            nik: pendaftaran.nik,
            jurusan: pendaftaran.jurusan,
            jadwalUjian: pendaftaran.jadwalUjian,
            ruangUjian: pendaftaran.ruangUjian,
            dokumenCount: pendaftaran.dokumen.length,
            dokumen: pendaftaran.dokumen,
            updatedAt: pendaftaran.updatedAt,
        };
    }

    async buatPendaftaran(userId: string, nisn: string, nik: string, jurusan: string) {
        if (!userId) {
            throw new ConflictException('User ID tidak valid atau belum login');
        }
        if (!nisn || !nik || !jurusan) {
            throw new ConflictException('NISN, NIK, dan Jurusan wajib diisi');
        }

        const existingPendaftaran = await this.prisma.pendaftaran.findUnique({
            where: { userId },
        });
        if (existingPendaftaran) {
            throw new ConflictException('Akun ini sudah memiliki data pendaftaran');
        }

        const existingNisn = await this.prisma.pendaftaran.findUnique({
            where: { nisn },
        });
        if (existingNisn) {
            throw new ConflictException('NISN ini sudah terdaftar di sistem');
        }

        const nomorPendaftaran = `MUSKA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const pendaftaran = await this.prisma.pendaftaran.create({
            data: {
                userId,
                nomorPendaftaran,
                nisn: nisn.trim(),
                nik: nik.trim(),
                jurusan,
                status: 'PENDING',
                jadwalUjian: 'Senin, 18 Mei 2026 (08.00 - 10.00 WIB)',
                ruangUjian: 'Ruang CBT Kampus 1 SMK Muhammadiyah Sekampung',
            },
            include: {
                dokumen: true,
            },
        });

        return {
            message: 'Biodata pendaftaran berhasil disimpan',
            pendaftaranId: pendaftaran.id,
            pendaftaran,
        };
    }

    async simpanLengkapiData(userId: string, dto: LengkapiDataDto) {
        if (!userId) {
            throw new BadRequestException('User belum terautentikasi');
        }

        let pendaftaran = await this.prisma.pendaftaran.findUnique({
            where: { userId },
        });

        const nomorPendaftaran = pendaftaran?.nomorPendaftaran || `MUSKA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const jadwalUjian = pendaftaran?.jadwalUjian || null;
        const ruangUjian = pendaftaran?.ruangUjian || null;

        if (pendaftaran) {
            // Update existing pendaftaran
            pendaftaran = await this.prisma.pendaftaran.update({
                where: { userId },
                data: {
                    nomorPendaftaran,
                    namaLengkap: dto.namaLengkap,
                    jenisKelamin: dto.jenisKelamin,
                    agama: dto.agama,
                    tempatLahir: dto.tempatLahir,
                    tanggalLahir: dto.tanggalLahir,
                    alamat: dto.alamat,
                    noHpWa: dto.noHpWa,
                    sekolahAsal: dto.sekolahAsal,
                    ...(dto.nisn ? { nisn: dto.nisn.trim() } : {}),
                    ...(dto.nik ? { nik: dto.nik.trim() } : {}),
                    beratBadan: dto.beratBadan ? Number(dto.beratBadan) : undefined,
                    tinggiBadan: dto.tinggiBadan ? Number(dto.tinggiBadan) : undefined,
                    namaAyah: dto.namaAyah,
                    pekerjaanAyah: dto.pekerjaanAyah,
                    namaIbu: dto.namaIbu || dto.namaIbuKandung,
                    namaIbuKandung: dto.namaIbuKandung || dto.namaIbu,
                    pekerjaanIbu: dto.pekerjaanIbu,
                    alamatOrtu: dto.alamatOrtu,
                    noHpOrtu: dto.noHpOrtu,
                    namaWali: dto.namaWali,
                    alamatWali: dto.alamatWali,
                    noHpWali: dto.noHpWali,
                    ...(dto.jurusan ? { jurusan: dto.jurusan } : {}),
                    ukuranBaju: dto.ukuranBaju,
                    ukuranBajuLainnya: dto.ukuranBajuLainnya,
                    intrakurikuler: dto.intrakurikuler,
                    ekstrakurikuler: dto.ekstrakurikuler || [],
                    latitude: dto.latitude !== undefined && dto.latitude !== null ? Number(dto.latitude) : undefined,
                    longitude: dto.longitude !== undefined && dto.longitude !== null ? Number(dto.longitude) : undefined,
                    jadwalUjian,
                    ruangUjian,
                },
                include: {
                    dokumen: true,
                },
            });
        } else {
            // Create new pendaftaran
            if (!dto.nisn || !dto.nik || !dto.jurusan) {
                throw new BadRequestException('NISN, NIK, dan Pilihan Jurusan wajib diisi');
            }

            pendaftaran = await this.prisma.pendaftaran.create({
                data: {
                    userId,
                    nomorPendaftaran,
                    namaLengkap: dto.namaLengkap,
                    jenisKelamin: dto.jenisKelamin,
                    agama: dto.agama,
                    tempatLahir: dto.tempatLahir,
                    tanggalLahir: dto.tanggalLahir,
                    alamat: dto.alamat,
                    noHpWa: dto.noHpWa,
                    sekolahAsal: dto.sekolahAsal,
                    nisn: dto.nisn.trim(),
                    nik: dto.nik.trim(),
                    beratBadan: dto.beratBadan ? Number(dto.beratBadan) : undefined,
                    tinggiBadan: dto.tinggiBadan ? Number(dto.tinggiBadan) : undefined,
                    namaAyah: dto.namaAyah,
                    pekerjaanAyah: dto.pekerjaanAyah,
                    namaIbu: dto.namaIbu || dto.namaIbuKandung,
                    namaIbuKandung: dto.namaIbuKandung || dto.namaIbu,
                    pekerjaanIbu: dto.pekerjaanIbu,
                    alamatOrtu: dto.alamatOrtu,
                    noHpOrtu: dto.noHpOrtu,
                    namaWali: dto.namaWali,
                    alamatWali: dto.alamatWali,
                    noHpWali: dto.noHpWali,
                    jurusan: dto.jurusan,
                    ukuranBaju: dto.ukuranBaju,
                    ukuranBajuLainnya: dto.ukuranBajuLainnya,
                    intrakurikuler: dto.intrakurikuler,
                    ekstrakurikuler: dto.ekstrakurikuler || [],
                    latitude: dto.latitude !== undefined && dto.latitude !== null ? Number(dto.latitude) : undefined,
                    longitude: dto.longitude !== undefined && dto.longitude !== null ? Number(dto.longitude) : undefined,
                    status: 'PENDING',
                    jadwalUjian,
                    ruangUjian,
                },
                include: {
                    dokumen: true,
                },
            });
        }

        // Sinkronisasi nama user
        if (dto.namaLengkap) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { nama: dto.namaLengkap },
            });
        }

        return {
            message: 'Kelengkapan formulir pendaftaran berhasil disimpan',
            pendaftaran,
        };
    }

    async generateKartuUjianPdf(userId: string): Promise<{ buffer: Buffer; filename: string }> {
        const pendaftaran = await this.prisma.pendaftaran.findUnique({
            where: { userId },
            include: {
                user: true,
            },
        });

        if (!pendaftaran) {
            throw new NotFoundException('Data pendaftaran tidak ditemukan');
        }

        if (pendaftaran.status !== 'VALID') {
            throw new BadRequestException('Status pendaftaran belum Terverifikasi. Selesaikan verifikasi dokumen terlebih dahulu.');
        }

        const nomorPendaftaran = pendaftaran.nomorPendaftaran || `MUSKA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const nama = pendaftaran.namaLengkap || pendaftaran.user?.nama || 'Calon Siswa';
        const settings = await this.getPengumumanStatus();
        const tahunAjaran = settings.tahunAjaran || '2026/2027';

        const qrText = `SPMB MUSKA ${tahunAjaran} | No: ${nomorPendaftaran} | NISN: ${pendaftaran.nisn} | Nama: ${nama} | Status: RESMI TERVERIFIKASI`;
        const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: 120 });
        const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 35,
                autoFirstPage: true,
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve({
                    buffer: pdfBuffer,
                    filename: `Kartu-Ujian-SPMB-${pendaftaran.nisn}.pdf`,
                });
            });
            doc.on('error', reject);

            // === 1. DEKORASI KOP SURAT (HERO STRIPES) ===
            doc.rect(35, 30, 525, 4).fill('#065f46'); // Hijau Tua
            doc.rect(35, 35, 525, 2).fill('#d97706'); // Kuning Emas

            // === 2. TEKS KOP SURAT & LOGO ===
            const logoPath = path.join(process.cwd(), 'uploads', 'logo.png');
            const hasLogo = fs.existsSync(logoPath);
            if (hasLogo) {
                try {
                    doc.image(logoPath, 42, 42, { width: 48 });
                } catch (e) {
                    console.error('Failed to embed logo in PDF:', e);
                }
            }

            const kopTextX = hasLogo ? 92 : 35;
            const kopTextW = hasLogo ? 468 : 525;

            doc.fillColor('#065f46')
                .fontSize(9)
                .font('Helvetica-Bold')
                .text('MAJELIS PENDIDIKAN DASAR DAN MENENGAH MUHAMMADIYAH', kopTextX, 45, { align: 'center', width: kopTextW });
            
            doc.fontSize(14)
                .fillColor('#047857')
                .text('SMK MUHAMMADIYAH SEKAMPUNG', kopTextX, 58, { align: 'center', width: kopTextW });

            doc.fontSize(7.5)
                .font('Helvetica')
                .fillColor('#4b5563')
                .text('NPSN: 10806085 | Terakreditasi B | Bidang Keahlian: Teknologi Rekayasa, TIK, Bisnis Manajemen', kopTextX, 75, { align: 'center', width: kopTextW });
            doc.text('Alamat: Jl. Raya Sekampung No. 01, Kec. Sekampung, Kab. Lampung Timur 34382 | Website: muska.sch.id', kopTextX, 85, { align: 'center', width: kopTextW });

            // Garis Pembatas Kop
            doc.strokeColor('#047857').lineWidth(1.2).moveTo(35, 98).lineTo(560, 98).stroke();
            doc.strokeColor('#d97706').lineWidth(0.5).moveTo(35, 101).lineTo(560, 101).stroke();

            // === 3. BANNER JUDUL KARTU ===
            doc.rect(35, 108, 525, 24).fill('#047857');
            doc.fillColor('#ffffff')
                .fontSize(10.5)
                .font('Helvetica-Bold')
                .text(`KARTU TANDA PESERTA UJIAN SELEKSI SPMB TA ${tahunAjaran}`, 35, 114, { align: 'center', width: 525 });

            // === 4. BADGE STATUS VALIDASI RESMI ===
            doc.roundedRect(35, 138, 525, 26, 4).fillAndStroke('#ecfdf5', '#10b981');
            doc.fillColor('#065f46')
                .fontSize(8.5)
                .font('Helvetica-Bold')
                .text('STATUS: RESMI TERVERIFIKASI PANITIA SPMB', 48, 146);
            doc.fontSize(8)
                .font('Helvetica-Bold')
                .fillColor('#047857')
                .text(`NO. REG: ${nomorPendaftaran}`, 380, 146, { align: 'right', width: 165 });

            // === 5. GRID BIODATA (KOLOM KIRI) & FOTO/QR (KOLOM KANAN) ===
            const gridTopY = 172;
            const leftColX = 35;
            const leftColWidth = 380;
            const labelW = 125;
            const valueX = leftColX + labelW;

            // Box kontainer biodata kiri
            doc.roundedRect(leftColX, gridTopY, leftColWidth, 195, 4).fillAndStroke('#ffffff', '#e2e8f0');

            const studentData = [
                ['Nomor Registrasi', nomorPendaftaran],
                ['Nama Lengkap Siswa', nama],
                ['NISN', pendaftaran.nisn],
                ['NIK (Kartu Keluarga)', pendaftaran.nik],
                ['Jenis Kelamin', pendaftaran.jenisKelamin || '-'],
                ['Asal Sekolah (SMP/MTs)', pendaftaran.sekolahAsal || '-'],
                ['Pilihan Program Keahlian', pendaftaran.jurusan || '-'],
                ['Jadwal Pelaksanaan Ujian', pendaftaran.jadwalUjian || 'Senin, 18 Mei 2026 (08.00 WIB)'],
                ['Ruang / Laboratorium Ujian', pendaftaran.ruangUjian || 'Ruang CBT 1 Kampus SMK Muska'],
            ];

            let rowY = gridTopY + 10;
            doc.fontSize(8.5);
            studentData.forEach(([label, val], idx) => {
                if (idx % 2 === 0) {
                    doc.rect(leftColX + 2, rowY - 2, leftColWidth - 4, 18).fill('#f8fafc');
                }
                doc.fillColor('#475569').font('Helvetica-Bold').text(label, leftColX + 8, rowY);
                doc.fillColor('#0f172a').font('Helvetica').text(`:  ${val}`, valueX, rowY, { width: leftColWidth - labelW - 12 });
                rowY += 20;
            });

            // Box Pas Foto & QR Code Kanan
            const rightColX = 425;
            const rightColW = 135;
            doc.roundedRect(rightColX, gridTopY, rightColW, 195, 4).fillAndStroke('#f8fafc', '#e2e8f0');

            // Kotak Pas Foto 3x4
            const photoW = 75;
            const photoH = 95;
            const photoX = rightColX + (rightColW - photoW) / 2;
            doc.roundedRect(photoX, gridTopY + 10, photoW, photoH, 3).strokeColor('#cbd5e1').lineWidth(1).stroke();
            doc.fillColor('#94a3b8')
                .fontSize(7)
                .font('Helvetica')
                .text('PAS FOTO\n3 x 4 cm\n(Warna/Hitam Putih)', photoX, gridTopY + 45, { align: 'center', width: photoW });

            // QR Code Keaslian
            const qrSize = 65;
            const qrX = rightColX + (rightColW - qrSize) / 2;
            doc.image(qrBuffer, qrX, gridTopY + 112, { width: qrSize, height: qrSize });
            doc.fontSize(6.5)
                .fillColor('#059669')
                .font('Helvetica-Bold')
                .text('QR VERIFIED - PANITIA', rightColX, gridTopY + 180, { align: 'center', width: rightColW });

            // === 6. TATA TERTIB UJIAN SELEKSI ===
            const rulesBoxY = 376;
            doc.roundedRect(35, rulesBoxY, 525, 82, 4).fillAndStroke('#f8fafc', '#cbd5e1');
            doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text('TATA TERTIB PESERTA UJIAN SELEKSI SPMB:', 45, rulesBoxY + 8);
            
            const examRules = [
                '1. Peserta wajib hadir di lokasi ujian 15 menit sebelum waktu ujian dimulai dan mengenakan seragam SMP/MTs rapi.',
                '2. Membawa Kartu Tanda Peserta Ujian resmi ini yang telah dicetak dan ditempel pas foto 3x4.',
                '3. Membawa alat tulis lengkap (pensil 2B, pulpen hitam, dan penghapus) serta kartu identitas (Kartu Pelajar / KK).',
                '4. Tidak diperkenankan membawa gawai/ponsel, contekan, atau buku ke dalam ruang ujian selama tes berlangsung.',
            ];

            let ruleY = rulesBoxY + 22;
            doc.font('Helvetica').fontSize(7.5).fillColor('#334155');
            examRules.forEach((rule) => {
                doc.text(rule, 45, ruleY, { width: 505 });
                ruleY += 13;
            });

            // === 7. AREA PENGESAHAN & TANDA TANGAN (DUAL SIGNATURE) ===
            const signY = 468;
            // Tanda Tangan Peserta (Kiri)
            doc.fillColor('#334155').fontSize(8).font('Helvetica');
            doc.text('Calon Siswa Peserta,', 65, signY);
            doc.font('Helvetica-Bold').text(`( ${nama.slice(0, 26)} )`, 45, signY + 55, { align: 'left' });

            // Tanda Tangan Panitia (Kanan)
            doc.font('Helvetica').text('Sekampung, .................................... 2026', 360, signY);
            doc.text('Ketua Panitia SPMB SMK Muska,', 360, signY + 12);
            doc.font('Helvetica-Bold').text('( Panitia SPMB SMK Muhammadiyah )', 360, signY + 55);
            doc.font('Helvetica').fontSize(7).text('NBM / NIP: 1092 8472 9182', 360, signY + 67);

            // Garis potong kecil bawah
            doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(35, 555).lineTo(560, 555).stroke();
            doc.fontSize(6.5).fillColor('#94a3b8').text('Dicetak otomatis oleh Sistem Informasi SPMB SMK Muhammadiyah Sekampung pada ' + new Date().toLocaleString('id-ID'), 35, 560, { align: 'center', width: 525 });

            doc.end();
        });
    }

    async generateRingkasanFormulirPdf(userId: string): Promise<{ buffer: Buffer; filename: string }> {
        const pendaftaran = await this.prisma.pendaftaran.findUnique({
            where: { userId },
            include: {
                user: true,
                dokumen: true,
            },
        });

        if (!pendaftaran) {
            throw new NotFoundException('Data pendaftaran tidak ditemukan');
        }

        const nomorPendaftaran = pendaftaran.nomorPendaftaran || `MUSKA-${Math.floor(10000 + Math.random() * 90000)}`;
        const nama = pendaftaran.namaLengkap || pendaftaran.user.nama || 'Calon Siswa';
        const settings = await this.getPengumumanStatus();
        const tahunAjaran = settings.tahunAjaran || '2026/2027';
        const qrText = `SPMB MUSKA ${tahunAjaran} | FORMULIR PENDAFTARAN | No: ${nomorPendaftaran} | NISN: ${pendaftaran.nisn} | Nama: ${nama}`;
        const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: 120 });
        const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 36,
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve({
                    buffer: pdfBuffer,
                    filename: `Formulir-Pendaftaran-${pendaftaran.nisn}.pdf`,
                });
            });
            doc.on('error', reject);

            // KOP SURAT
            doc.rect(36, 36, 523, 5).fill('#047857');
            doc.rect(36, 42, 523, 2).fill('#d97706');

            doc.moveDown(1);
            doc.fillColor('#065f46')
                .fontSize(9.5)
                .font('Helvetica-Bold')
                .text('MAJELIS PENDIDIKAN DASAR DAN MENENGAH PIMPINAN DAERAH MUHAMMADIYAH', { align: 'center' });
            
            doc.fontSize(13)
                .fillColor('#047857')
                .text('SMK MUHAMMADIYAH SEKAMPUNG', { align: 'center' });

            doc.fontSize(8)
                .font('Helvetica')
                .fillColor('#4b5563')
                .text('TERAKREDITASI A | NSS: 322120404018 | NPSN: 10806089\nJl. Raya Sekampung No. 01, Sekampung, Kab. Lampung Timur | info@smkmuhsekampung.sch.id', { align: 'center' });

            doc.strokeColor('#047857').lineWidth(1.2).moveTo(36, doc.y + 4).lineTo(559, doc.y + 4).stroke();
            doc.strokeColor('#d97706').lineWidth(0.5).moveTo(36, doc.y + 6).lineTo(559, doc.y + 6).stroke();

            doc.moveDown(1.5);
            doc.rect(36, doc.y, 523, 22).fill('#047857');
            doc.fillColor('#ffffff')
                .fontSize(10.5)
                .font('Helvetica-Bold')
                .text(`LEMBAR RINGKASAN FORMULIR PENDAFTARAN PESERTA DIDIK BARU TA ${tahunAjaran}`, 36, doc.y - 16, { align: 'center' });

            doc.moveDown(1.5);

            // DATA TABEL HELPER
            const renderSection = (title: string, dataRows: [string, string][]) => {
                doc.fillColor('#047857').fontSize(9.5).font('Helvetica-Bold').text(title);
                doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(36, doc.y + 2).lineTo(559, doc.y + 2).stroke();
                doc.moveDown(0.4);

                doc.font('Helvetica').fontSize(8.5).fillColor('#1f2937');
                dataRows.forEach(([label, value]) => {
                    const rowY = doc.y;
                    doc.font('Helvetica-Bold').fillColor('#374151').text(label, 42, rowY, { width: 150 });
                    doc.font('Helvetica').fillColor('#111827').text(`:  ${value || '-'}`, 195, rowY, { width: 350 });
                    doc.moveDown(0.35);
                });
                doc.moveDown(0.6);
            };

            renderSection('A. DATA PENDAFTARAN & JURUSAN', [
                ['Nomor Pendaftaran', nomorPendaftaran],
                ['Tahun Ajaran / Periode', tahunAjaran],
                ['Pilihan Program Keahlian', pendaftaran.jurusan],
                ['Status Verifikasi', pendaftaran.status === 'VALID' ? 'TERVERIFIKASI (LULUS BERKAS)' : pendaftaran.status],
                ['Tanggal Registrasi', new Date(pendaftaran.createdAt).toLocaleDateString('id-ID', { dateStyle: 'full' })],
            ]);

            renderSection('B. DATA DIRI CALON SISWA', [
                ['Nama Lengkap', nama],
                ['NISN / NIK', `${pendaftaran.nisn} / ${pendaftaran.nik}`],
                ['Jenis Kelamin', pendaftaran.jenisKelamin || '-'],
                ['Agama', pendaftaran.agama || '-'],
                ['Tempat, Tanggal Lahir', `${pendaftaran.tempatLahir || '-'}, ${pendaftaran.tanggalLahir || '-'}`],
                ['Alamat Tempat Tinggal', pendaftaran.alamat || '-'],
                ['Nomor HP / WhatsApp', pendaftaran.noHpWa || '-'],
                ['Sekolah Asal', pendaftaran.sekolahAsal || '-'],
                ['Tinggi / Berat Badan', `${pendaftaran.tinggiBadan || '-'} cm / ${pendaftaran.beratBadan || '-'} kg`],
                ['Ukuran Seragam', `${pendaftaran.ukuranBaju || '-'} ${pendaftaran.ukuranBajuLainnya ? `(${pendaftaran.ukuranBajuLainnya})` : ''}`],
            ]);

            renderSection('C. DATA ORANG TUA & WALI', [
                ['Nama Ayah / Pekerjaan', `${pendaftaran.namaAyah || '-'} / ${pendaftaran.pekerjaanAyah || '-'}`],
                ['Nama Ibu Kandung / Pekerjaan', `${pendaftaran.namaIbu || pendaftaran.namaIbuKandung || '-'} / ${pendaftaran.pekerjaanIbu || '-'}`],
                ['Alamat Orang Tua / HP', `${pendaftaran.alamatOrtu || '-'} / ${pendaftaran.noHpOrtu || '-'}`],
                ['Nama Wali / HP', `${pendaftaran.namaWali || '-'} / ${pendaftaran.noHpWali || '-'}`],
            ]);

            renderSection('D. MINAT & PENGEMBANGAN DIRI', [
                ['Pilihan Organisasi Intra', pendaftaran.intrakurikuler || '-'],
                ['Pilihan Ekstrakurikuler', pendaftaran.ekstrakurikuler?.join(', ') || '-'],
            ]);

            // FOOTER & TTD
            const signY = doc.y + 10;
            doc.image(qrBuffer, 50, signY, { width: 75 });
            doc.fontSize(7).fillColor('#6b7280').text('Validasi Data Digital PPDB Muska', 42, signY + 80, { width: 95, align: 'center' });

            doc.fillColor('#374151').fontSize(8).font('Helvetica');
            doc.text('Sekampung, .................................... 2026', 360, signY);
            doc.text('Tanda Tangan Calon Siswa,', 360, signY + 12);
            doc.font('Helvetica-Bold').text(`( ${nama} )`, 360, signY + 60);

            doc.end();
        });
    }

    async getPengumumanStatus() {
        const settings = await this.prisma.systemSetting.findMany();
        const map: Record<string, string> = {};
        settings.forEach((s) => {
            map[s.key] = s.value;
        });

        return {
            pengumumanDibuka: map['pengumumanDibuka'] === 'true',
            tanggalPengumuman: map['tanggalPengumuman'] || '2026-06-01T10:00:00',
            tahunAjaran: map['tahunAjaran'] || '2026/2027',
            bukaPendaftaran: map['bukaPendaftaran'] !== 'false',
            judulPengumuman: map['judulPengumuman'] || 'Pengumuman Hasil Seleksi PPDB SMK Muhammadiyah Sekampung',
            pesanLulus: map['pesanLulus'] || 'Selamat! Anda dinyatakan LULUS dalam seleksi Penerimaan Peserta Didik Baru (PPDB) SMK Muhammadiyah Sekampung. Silakan segera lakukan daftar ulang.',
            pesanTidakLulus: map['pesanTidakLulus'] || 'Mohon maaf, Anda belum dinyatakan lulus pada kompetensi keahlian pilihan utama. Anda dapat berkonsultasi dengan panitia mengenai pilihan kompetensi keahlian lainnya.',
            waktuServer: new Date().toISOString(),
        };
    }

    /**
     * Cek Kelulusan Siswa Secara Publik (by NISN atau Nomor Pendaftaran/Ujian)
     */
    async cekKelulusanPublic(keyword: string) {
        const clean = (keyword || '').trim();
        if (!clean) {
            throw new BadRequestException('Silakan masukkan NISN atau Nomor Pendaftaran Anda');
        }

        const settings = await this.getPengumumanStatus();
        const serverTime = new Date().getTime();
        const targetTime = settings.tanggalPengumuman ? new Date(settings.tanggalPengumuman).getTime() : 0;
        const isTimePassed = targetTime > 0 && serverTime >= targetTime;
        const isOpened = settings.pengumumanDibuka || isTimePassed;

        if (!isOpened) {
            return {
                dibuka: false,
                ditemukan: false,
                message: 'Pengumuman hasil kelulusan belum dibuka resmi oleh panitia SPMB.',
                tanggalPengumuman: settings.tanggalPengumuman,
                tahunAjaran: settings.tahunAjaran,
            };
        }

        const pendaftaran = await this.prisma.pendaftaran.findFirst({
            where: {
                OR: [
                    { nisn: { equals: clean, mode: 'insensitive' } },
                    { nomorPendaftaran: { equals: clean, mode: 'insensitive' } },
                ],
            },
            include: {
                user: { select: { nama: true, email: true } },
            },
        });

        if (!pendaftaran) {
            return {
                dibuka: true,
                ditemukan: false,
                message: `Data calon siswa dengan nomor "${clean}" tidak ditemukan. Pastikan NISN atau Nomor Pendaftaran yang Anda masukkan sudah benar.`,
            };
        }

        // Masking NIK untuk privasi
        const maskedNik = pendaftaran.nik
            ? `${pendaftaran.nik.slice(0, 6)}******${pendaftaran.nik.slice(-2)}`
            : '-';

        return {
            dibuka: true,
            ditemukan: true,
            data: {
                id: pendaftaran.id,
                nomorPendaftaran: pendaftaran.nomorPendaftaran || 'MUSKA-' + pendaftaran.nisn.slice(-4),
                namaLengkap: pendaftaran.namaLengkap || pendaftaran.user?.nama || 'Calon Siswa',
                nisn: pendaftaran.nisn,
                nik: maskedNik,
                sekolahAsal: pendaftaran.sekolahAsal || '-',
                jurusan: pendaftaran.jurusan,
                statusKelulusan: pendaftaran.statusKelulusan || 'MENUNGGU',
                statusVerifikasi: pendaftaran.status,
                nilaiUjian: pendaftaran.nilaiUjian ?? null,
                jadwalUjian: pendaftaran.jadwalUjian || '-',
                ruangUjian: pendaftaran.ruangUjian || '-',
                catatanVerifikasi: pendaftaran.catatanVerifikasi || null,
                tanggalPengumuman: settings.tanggalPengumuman,
                tahunAjaran: settings.tahunAjaran,
                judulPengumuman: settings.judulPengumuman,
                pesanLulus: settings.pesanLulus,
                pesanTidakLulus: settings.pesanTidakLulus,
            },
        };
    }

    /**
     * Unduh Surat Keterangan Lulus (SKL) Resmi PDF
     */
    async generateSuratKelulusanPdf(keyword: string): Promise<{ buffer: Buffer; filename: string }> {
        const clean = (keyword || '').trim();
        if (!clean) {
            throw new BadRequestException('NISN atau Nomor Pendaftaran wajib diisi');
        }

        const settings = await this.getPengumumanStatus();
        const pendaftaran = await this.prisma.pendaftaran.findFirst({
            where: {
                OR: [
                    { nisn: { equals: clean, mode: 'insensitive' } },
                    { nomorPendaftaran: { equals: clean, mode: 'insensitive' } },
                ],
            },
            include: { user: true },
        });

        if (!pendaftaran) {
            throw new NotFoundException('Data pendaftaran tidak ditemukan');
        }

        if (pendaftaran.statusKelulusan !== 'LULUS') {
            throw new BadRequestException('Surat Keterangan Lulus hanya dapat diunduh oleh calon siswa yang dinyatakan LULUS');
        }

        const nomorPendaftaran = pendaftaran.nomorPendaftaran || 'MUSKA-' + pendaftaran.nisn.slice(-4);
        const nama = pendaftaran.namaLengkap || pendaftaran.user?.nama || 'Calon Siswa';
        const tahunAjaran = settings.tahunAjaran || '2026/2027';

        const qrText = `SURAT KETERANGAN LULUS RESMI | SPMB SMK Muhammadiyah Sekampung ${tahunAjaran} | No: ${nomorPendaftaran} | NISN: ${pendaftaran.nisn} | Nama: ${nama} | Jurusan: ${pendaftaran.jurusan} | STATUS: RESMI DITERIMA`;
        const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: 110 });
        const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 40,
                autoFirstPage: true,
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve({
                    buffer: pdfBuffer,
                    filename: `SKL-SPMB-${pendaftaran.nisn}.pdf`,
                });
            });
            doc.on('error', reject);

            // KOP SURAT
            doc.rect(40, 35, 515, 4).fill('#047857');
            doc.rect(40, 41, 515, 2).fill('#d97706');

            const logoPath = path.join(process.cwd(), 'uploads', 'logo.png');
            if (fs.existsSync(logoPath)) {
                try {
                    doc.image(logoPath, 48, 48, { width: 50 });
                } catch (e) {}
            }

            doc.fillColor('#065f46')
                .fontSize(9)
                .font('Helvetica-Bold')
                .text('MAJELIS PENDIDIKAN DASAR DAN MENENGAH MUHAMMADIYAH', 105, 50, { align: 'center', width: 440 });
            doc.fontSize(13)
                .text('SMK MUHAMMADIYAH SEKAMPUNG', 105, 63, { align: 'center', width: 440 });
            doc.fillColor('#475569')
                .fontSize(7.5)
                .font('Helvetica')
                .text('Jl. Raya Sekampung No. 23, Sekampung, Lampung Timur | Telp: (0725) 7851234 | Web: smkmuhsekampung.sch.id', 105, 80, { align: 'center', width: 440 });

            doc.rect(40, 95, 515, 1).fill('#cbd5e1');

            // JUDUL SURAT
            doc.fillColor('#0f172a')
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('SURAT KETERANGAN KELULUSAN SELEKSI SPMB', 40, 112, { align: 'center' });
            doc.fontSize(9)
                .font('Helvetica')
                .text(`Nomor: 421.5/SKL-SPMB/${pendaftaran.nisn.slice(-4)}/SMK-M/2026`, 40, 128, { align: 'center' });

            // ISI SURAT
            doc.fontSize(9.5)
                .font('Helvetica')
                .text('Kepala SMK Muhammadiyah Sekampung dengan ini menerangkan bahwa:', 45, 155);

            // TABEL BIODATA
            const startY = 175;
            const rowH = 20;
            const items = [
                ['Nama Lengkap', `:  ${nama.toUpperCase()}`],
                ['Nomor Pendaftaran / Ujian', `:  ${nomorPendaftaran}`],
                ['NISN', `:  ${pendaftaran.nisn}`],
                ['Asal Sekolah', `:  ${pendaftaran.sekolahAsal || '-'}`],
                ['Program / Kompetensi Keahlian', `:  ${pendaftaran.jurusan}`],
                ['Nilai Hasil Ujian CBT', `:  ${pendaftaran.nilaiUjian !== null && pendaftaran.nilaiUjian !== undefined ? pendaftaran.nilaiUjian : '85.0'} / 100`],
            ];

            items.forEach(([lbl, val], idx) => {
                const y = startY + (idx * rowH);
                doc.font('Helvetica-Bold').fillColor('#334155').text(lbl, 60, y, { width: 170 });
                doc.font('Helvetica').fillColor('#0f172a').text(val, 230, y, { width: 300 });
            });

            // STATUS KOTAK KELULUSAN
            const boxY = startY + (items.length * rowH) + 15;
            doc.roundedRect(60, boxY, 475, 45, 8).fillAndStroke('#ecfdf5', '#059669');
            doc.fillColor('#065f46')
                .font('Helvetica-Bold')
                .fontSize(10)
                .text('DINYATAKAN :', 60, boxY + 8, { align: 'center', width: 475 });
            doc.fontSize(16)
                .fillColor('#047857')
                .text('L U L U S', 60, boxY + 22, { align: 'center', width: 475 });

            // KETERANGAN
            const textY = boxY + 60;
            doc.fontSize(8.5)
                .font('Helvetica')
                .fillColor('#334155')
                .text(
                    `Berdasarkan hasil verifikasi berkas dan ujian seleksi masuk SMK Muhammadiyah Sekampung Tahun Ajaran ${tahunAjaran}, siswa yang bersangkutan dinyatakan DITERIMA sebagai Calon Siswa Baru. Harap segera melengkapi administrasi daftar ulang sesuai jadwal yang telah ditentukan.`,
                    60,
                    textY,
                    { width: 475, align: 'justify', lineGap: 3 }
                );

            // TANDA TANGAN & QR CODE
            const signY = textY + 65;
            doc.image(qrBuffer, 65, signY + 5, { width: 75 });
            doc.fontSize(7)
                .fillColor('#64748b')
                .text('Pindai untuk verifikasi keaslian surat', 65, signY + 85, { width: 75, align: 'center' });

            const signDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            doc.fontSize(8.5)
                .fillColor('#0f172a')
                .font('Helvetica')
                .text(`Sekampung, ${signDate}`, 360, signY);
            doc.text('Kepala Sekolah,', 360, signY + 14);
            doc.font('Helvetica-Bold')
                .text('Drs. H. Hendra Jaya, M.Pd.', 360, signY + 70);
            doc.font('Helvetica')
                .fontSize(7.5)
                .fillColor('#475569')
                .text('NIP. 19680512 199403 1 004', 360, signY + 82);

            doc.end();
        });
    }
}