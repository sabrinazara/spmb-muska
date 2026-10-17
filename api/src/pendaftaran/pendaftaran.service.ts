import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LengkapiDataDto } from './dto/lengkapi-data.dto';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

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
        const jadwalUjian = pendaftaran?.jadwalUjian || 'Senin, 18 Mei 2026 (08.00 - 10.00 WIB)';
        const ruangUjian = pendaftaran?.ruangUjian || 'Ruang CBT Kampus 1 SMK Muhammadiyah Sekampung';

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
        const nama = pendaftaran.namaLengkap || pendaftaran.user.nama || 'Calon Siswa';
        const qrText = `SPMB MUSKA 2026 | No: ${nomorPendaftaran} | NISN: ${pendaftaran.nisn} | Nama: ${nama} | Status: VALID`;
        const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: 140 });
        const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 40,
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve({
                    buffer: pdfBuffer,
                    filename: `Kartu-Ujian-PPDB-${pendaftaran.nisn}.pdf`,
                });
            });
            doc.on('error', reject);

            // === HEADER KOP SURAT ===
            doc.rect(40, 40, 515, 6).fill('#047857'); // Garis hijau emerald atas
            doc.rect(40, 47, 515, 2).fill('#d97706'); // Garis kuning emas

            doc.moveDown(1.5);
            doc.fillColor('#065f46')
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('MAJELIS PENDIDIKAN DASAR DAN MENENGAH MUHAMMADIYAH', { align: 'center' });
            
            doc.fontSize(14)
                .fillColor('#047857')
                .text('SMK MUHAMMADIYAH SEKAMPUNG', { align: 'center' });

            doc.fontSize(8)
                .font('Helvetica')
                .fillColor('#4b5563')
                .text('Jl. Raya Sekampung No. 01, Kab. Lampung Timur | Telp/WA: 0812-3456-7890 | Website: muska.sch.id', { align: 'center' });

            doc.moveDown(0.5);
            doc.strokeColor('#047857').lineWidth(1.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
            doc.strokeColor('#d97706').lineWidth(0.5).moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();

            // === JUDUL KARTU ===
            doc.moveDown(1.5);
            doc.rect(40, doc.y, 515, 28).fill('#047857');
            doc.fillColor('#ffffff')
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('KARTU TANDA PESERTA UJIAN SELEKSI PPDB TA 2026/2027', 40, doc.y - 20, { align: 'center' });

            doc.moveDown(2);

            // === KOTAK STATUS RESMI ===
            const statusY = doc.y;
            doc.roundedRect(40, statusY, 515, 34, 6).fillAndStroke('#ecfdf5', '#059669');
            doc.fillColor('#065f46')
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('STATUS: RESMI TERVERIFIKASI (LULUS SELEKSI BERKAS)', 55, statusY + 11);
            doc.fontSize(9)
                .font('Helvetica')
                .fillColor('#047857')
                .text(`Nomor Registrasi: ${nomorPendaftaran}`, 330, statusY + 11);

            doc.moveDown(2.5);

            // === DATA SISWA & UJIAN (GRID 2 KOLOM) ===
            const startDataY = doc.y;
            const leftX = 45;
            const labelWidth = 135;
            const valueX = leftX + labelWidth;

            const rows = [
                ['Nomor Pendaftaran', nomorPendaftaran],
                ['Nama Lengkap', nama],
                ['NISN / NIK', `${pendaftaran.nisn} / ${pendaftaran.nik}`],
                ['Jenis Kelamin', pendaftaran.jenisKelamin || '-'],
                ['Asal Sekolah', pendaftaran.sekolahAsal || '-'],
                ['Program Keahlian', pendaftaran.jurusan || '-'],
                ['Jadwal Ujian Seleksi', pendaftaran.jadwalUjian || 'Senin, 18 Mei 2026 | 08.00 WIB'],
                ['Ruang Ujian', pendaftaran.ruangUjian || 'Lab Komputer CBT 1'],
            ];

            doc.font('Helvetica').fontSize(9.5);
            let currentY = startDataY;

            rows.forEach(([label, val]) => {
                doc.fillColor('#6b7280').font('Helvetica-Bold').text(label, leftX, currentY);
                doc.fillColor('#111827').font('Helvetica').text(`:  ${val}`, valueX, currentY);
                currentY += 20;
            });

            // === KOLOM KANAN: FOTO & QR CODE ===
            const rightBoxX = 420;
            // Kotak Pas Foto 3x4
            doc.roundedRect(rightBoxX, startDataY, 95, 120, 4).strokeColor('#9ca3af').lineWidth(1).stroke();
            doc.fillColor('#9ca3af')
                .fontSize(8)
                .font('Helvetica')
                .text('TEMPEL FOTO\n3 x 4\n(Latar Merah/Biru)', rightBoxX, startDataY + 45, { align: 'center', width: 95 });

            // QR Code
            doc.image(qrBuffer, rightBoxX - 5, startDataY + 130, { width: 105 });
            doc.fontSize(7).fillColor('#6b7280').text('Scan untuk validasi keaslian', rightBoxX - 5, startDataY + 235, { align: 'center', width: 105 });

            // === TATA TERTIB UJIAN ===
            doc.y = currentY + 70;
            doc.roundedRect(40, doc.y, 515, 95, 6).fillAndStroke('#f9fafb', '#e5e7eb');
            const rulesY = doc.y + 10;
            doc.fillColor('#1f2937').fontSize(9).font('Helvetica-Bold').text('TATA TERTIB UJIAN SELEKSI OFFLINE:', 55, rulesY);
            doc.font('Helvetica').fontSize(8).fillColor('#4b5563');
            const rules = [
                '1. Peserta wajib hadir 15 menit sebelum ujian dimulai dengan mengenakan seragam sekolah asal rapi.',
                '2. Membawa Kartu Tanda Peserta Ujian ini yang sudah dicetak dan ditempel pas foto 3x4.',
                '3. Membawa alat tulis (pensil 2B, pulpen hitam, penghapus) dan kartu identitas diri.',
                '4. Tidak diperkenankan membawa alat komunikasi atau gadget ke dalam ruang ujian selama tes berlangsung.',
            ];
            let ruleStepY = rulesY + 16;
            rules.forEach(rule => {
                doc.text(rule, 55, ruleStepY, { width: 485 });
                ruleStepY += 14;
            });

            // === TANDA TANGAN PANITIA ===
            doc.moveDown(7.5);
            const signY = doc.y;
            doc.fillColor('#374151').fontSize(8.5).font('Helvetica');
            doc.text('Sekampung, .................................... 2026', 360, signY);
            doc.text('Ketua Panitia SPMB,', 360, signY + 15);
            doc.moveDown(3);
            doc.font('Helvetica-Bold').text('( Panitia SPMB SMK Muhammadiyah )', 360, signY + 65);
            doc.font('Helvetica').fontSize(7.5).text('NBM. 1092 8472 9182', 360, signY + 78);

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

        const nomorPendaftaran = pendaftaran.nomorPendaftaran || `MUSKA-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const nama = pendaftaran.namaLengkap || pendaftaran.user.nama || 'Calon Siswa';
        const qrText = `SPMB MUSKA 2026 | FORMULIR PENDAFTARAN | No: ${nomorPendaftaran} | NISN: ${pendaftaran.nisn} | Nama: ${nama}`;
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
                .text('LEMBAR RINGKASAN FORMULIR PENDAFTARAN PESERTA DIDIK BARU', 36, doc.y - 16, { align: 'center' });

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
}