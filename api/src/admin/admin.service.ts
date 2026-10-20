import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    /**
     * Mengambil statistik ringkasan dan data grafik analitik
     */
    async getStats() {
        const totalPendaftar = await this.prisma.pendaftaran.count();

        // Status Verifikasi
        const berkasValid = await this.prisma.pendaftaran.count({ where: { status: 'VALID' } });
        const berkasPending = await this.prisma.pendaftaran.count({ where: { status: 'PENDING' } });
        const berkasInvalid = await this.prisma.pendaftaran.count({ where: { status: 'INVALID' } });

        // Status Pembayaran
        const bayarLunas = await this.prisma.pendaftaran.count({ where: { statusPembayaran: 'TERVERIFIKASI' } });
        const bayarMenunggu = await this.prisma.pendaftaran.count({ where: { statusPembayaran: 'MENUNGGU_VERIFIKASI' } });
        const bayarBelum = await this.prisma.pendaftaran.count({ where: { statusPembayaran: 'BELUM_BAYAR' } });

        // Status Kelulusan
        const lulus = await this.prisma.pendaftaran.count({ where: { statusKelulusan: 'LULUS' } });
        const tidakLulus = await this.prisma.pendaftaran.count({ where: { statusKelulusan: 'TIDAK_LULUS' } });
        const menungguUjian = await this.prisma.pendaftaran.count({ where: { statusKelulusan: 'MENUNGGU' } });

        // Distribusi Pendaftar per 8 Jurusan Resmi
        const listJurusan = [
            { nama: 'Teknik Jaringan Komputer dan Telekomunikasi', singkatan: 'TJKT', keywords: ['Jaringan', 'TKJ', 'Telekomunikasi'] },
            { nama: 'Teknik Otomotif (Teknik Sepeda Motor)', singkatan: 'TSM', keywords: ['Otomotif', 'Sepeda Motor', 'TBSM', 'TSM'] },
            { nama: 'Desain Komunikasi Visual', singkatan: 'DKV', keywords: ['Desain', 'DKV'] },
            { nama: 'Bisnis Digital dan Kreatif', singkatan: 'BDK', keywords: ['Bisnis Digital', 'BDK'] },
            { nama: 'Kulineri (Tata Boga)', singkatan: 'BOGA', keywords: ['Kuliner', 'Kulineri', 'Boga'] },
            { nama: 'Kecantikan dan Tata Rias', singkatan: 'TATA RIAS', keywords: ['Kecantikan', 'Rias'] },
            { nama: 'Teknik Pemesinan (CNC)', singkatan: 'CNC', keywords: ['Pemesinan', 'CNC'] },
            { nama: 'Teknik Pengelasan (Welding)', singkatan: 'LAS', keywords: ['Pengelasan', 'Welding', 'Las'] },
        ];

        const jurusanStats = await Promise.all(
            listJurusan.map(async (item) => {
                const count = await this.prisma.pendaftaran.count({
                    where: {
                        OR: item.keywords.map((kw) => ({
                            jurusan: { contains: kw, mode: 'insensitive' as const }
                        }))
                    }
                });
                return {
                    jurusan: item.nama,
                    singkatan: item.singkatan,
                    count,
                };
            })
        );

        // Tren Pendaftaran 7 Hari Terakhir
        const dailyTrends: { tanggal: string; label: string; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
            const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

            const count = await this.prisma.pendaftaran.count({
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    }
                }
            });

            dailyTrends.push({
                tanggal: startOfDay.toISOString().split('T')[0],
                label: startOfDay.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                count,
            });
        }

        // 5 Pendaftar Terbaru
        const pendaftarTerbaru = await this.prisma.pendaftaran.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { email: true, nama: true } },
            }
        });

        return {
            summary: {
                totalPendaftar,
                berkasValid,
                berkasPending,
                berkasInvalid,
                bayarLunas,
                bayarMenunggu,
                bayarBelum,
                lulus,
                tidakLulus,
                menungguUjian,
            },
            jurusanStats,
            dailyTrends,
            pendaftarTerbaru,
        };
    }

    /**
     * Mengambil daftar pendaftar dengan filter dan pencarian
     */
    async getPendaftarList(params: {
        search?: string;
        jurusan?: string;
        status?: string;
        statusPembayaran?: string;
        statusKelulusan?: string;
        tahunAjaran?: string;
        page?: number;
        limit?: number;
    }) {
        const page = Math.max(1, Number(params.page) || 1);
        const limit = Math.max(1, Number(params.limit) || 15);
        const skip = (page - 1) * limit;

        const where: any = {};
        const andConditions: any[] = [];

        if (params.search && params.search.trim() !== '') {
            const query = params.search.trim();
            andConditions.push({
                OR: [
                    { namaLengkap: { contains: query, mode: 'insensitive' } },
                    { nisn: { contains: query, mode: 'insensitive' } },
                    { nik: { contains: query, mode: 'insensitive' } },
                    { sekolahAsal: { contains: query, mode: 'insensitive' } },
                    { nomorPendaftaran: { contains: query, mode: 'insensitive' } },
                    { user: { email: { contains: query, mode: 'insensitive' } } },
                ]
            });
        }

        if (params.jurusan && params.jurusan !== 'ALL') {
            const listJurusan = [
                { nama: 'Teknik Jaringan Komputer dan Telekomunikasi', keywords: ['Jaringan', 'TKJ', 'Telekomunikasi'] },
                { nama: 'Teknik Otomotif', keywords: ['Otomotif', 'Sepeda Motor', 'TBSM', 'TSM'] },
                { nama: 'Desain Komunikasi Visual', keywords: ['Desain', 'DKV'] },
                { nama: 'Bisnis Digital dan Kreatif', keywords: ['Bisnis Digital', 'BDK'] },
                { nama: 'Kulineri', keywords: ['Kuliner', 'Kulineri', 'Boga'] },
                { nama: 'Kecantikan dan Tata Rias', keywords: ['Kecantikan', 'Rias'] },
                { nama: 'Teknik Pemesinan', keywords: ['Pemesinan', 'CNC'] },
                { nama: 'Teknik Pengelasan', keywords: ['Pengelasan', 'Welding', 'Las'] },
            ];

            const matched = listJurusan.find(
                (j) =>
                    j.nama.toLowerCase().includes(params.jurusan!.toLowerCase()) ||
                    params.jurusan!.toLowerCase().includes(j.nama.toLowerCase())
            );

            if (matched) {
                andConditions.push({
                    OR: matched.keywords.map((kw) => ({
                        jurusan: { contains: kw, mode: 'insensitive' as const },
                    }))
                });
            } else {
                where.jurusan = { contains: params.jurusan, mode: 'insensitive' };
            }
        }

        if (andConditions.length > 0) {
            where.AND = andConditions;
        }

        if (params.status && params.status !== 'ALL') {
            const validStatus = ['PENDING', 'VALID', 'INVALID'];
            const upper = params.status.toUpperCase();
            if (validStatus.includes(upper)) {
                where.status = upper;
            }
        }

        if (params.statusPembayaran && params.statusPembayaran !== 'ALL') {
            where.statusPembayaran = params.statusPembayaran;
        }

        if (params.statusKelulusan && params.statusKelulusan !== 'ALL') {
            where.statusKelulusan = params.statusKelulusan;
        }

        if (params.tahunAjaran && params.tahunAjaran !== 'ALL') {
            const parts = params.tahunAjaran.split('/');
            const startYear = parseInt(parts[0], 10);
            if (!isNaN(startYear)) {
                const start = new Date(startYear, 0, 1);
                const end = new Date(startYear + 1, 6, 31, 23, 59, 59);
                where.createdAt = {
                    gte: start,
                    lte: end,
                };
            }
        }

        const [total, items] = await Promise.all([
            this.prisma.pendaftaran.count({ where }),
            this.prisma.pendaftaran.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, email: true, nama: true } },
                    dokumen: true,
                }
            })
        ]);

        return {
            items,
            arsipTahun: ['2026/2027', '2025/2026', '2024/2025'],
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    /**
     * Mengambil detail lengkap satu pendaftar termasuk dokumen & hasil OCR
     */
    async getPendaftarDetail(id: string) {
        const pendaftaran = await this.prisma.pendaftaran.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, email: true, nama: true, createdAt: true } },
                dokumen: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!pendaftaran) {
            throw new NotFoundException(`Data pendaftar dengan ID ${id} tidak ditemukan`);
        }

        return pendaftaran;
    }

    /**
     * Memverifikasi dokumen siswa & menyimpan catatan verifikasi
     */
    async verifikasiDokumen(
        id: string,
        status: 'VALID' | 'INVALID' | 'PENDING',
        catatanVerifikasi: string,
        adminUser: { sub: string; email: string }
    ) {
        const pendaftaran = await this.prisma.pendaftaran.findUnique({
            where: { id },
            include: { user: true, dokumen: true }
        });

        if (!pendaftaran) {
            throw new NotFoundException('Data pendaftaran tidak ditemukan');
        }

        // Update dokumen berstatus sama jika status valid
        if (pendaftaran.dokumen.length > 0) {
            await this.prisma.dokumen.updateMany({
                where: { pendaftaranId: id },
                data: { status }
            });
        }

        const updated = await this.prisma.pendaftaran.update({
            where: { id },
            data: {
                status,
                catatanVerifikasi: catatanVerifikasi || null,
            },
            include: {
                dokumen: true,
                user: true,
            }
        });

        // Audit Trail
        await this.prisma.auditLog.create({
            data: {
                adminId: adminUser.sub,
                adminNama: adminUser.email,
                aksi: 'VERIFIKASI_BERKAS',
                detail: `Status berkas diubah menjadi [${status}]. Catatan: ${catatanVerifikasi || '-'}`,
                targetUser: pendaftaran.user?.email || pendaftaran.nisn,
            }
        });

        return {
            message: `Status verifikasi berkas berhasil diperbarui ke ${status}`,
            pendaftaran: updated,
        };
    }

    /**
     * Memverifikasi pembayaran pendaftaran (biaya formulir / seleksi)
     */
    async verifikasiPembayaran(
        id: string,
        statusPembayaran: 'TERVERIFIKASI' | 'DITOLAK' | 'MENUNGGU_VERIFIKASI',
        adminUser: { sub: string; email: string }
    ) {
        const pendaftaran = await this.prisma.pendaftaran.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!pendaftaran) {
            throw new NotFoundException('Data pendaftaran tidak ditemukan');
        }

        const updated = await this.prisma.pendaftaran.update({
            where: { id },
            data: {
                statusPembayaran,
            }
        });

        // Audit Trail
        await this.prisma.auditLog.create({
            data: {
                adminId: adminUser.sub,
                adminNama: adminUser.email,
                aksi: 'VERIFIKASI_PEMBAYARAN',
                detail: `Status pembayaran diubah menjadi [${statusPembayaran}]`,
                targetUser: pendaftaran.user?.email || pendaftaran.nisn,
            }
        });

        return {
            message: `Status pembayaran berhasil diubah menjadi ${statusPembayaran}`,
            pendaftaran: updated,
        };
    }

    /**
     * Memasukkan nilai ujian offline dan memperbarui status kelulusan
     */
    async inputNilaiDanKelulusan(
        id: string,
        data: {
            nilaiUjian?: number;
            statusKelulusan?: 'LULUS' | 'TIDAK_LULUS' | 'MENUNGGU';
            ruangUjian?: string;
            jadwalUjian?: string;
        },
        adminUser: { sub: string; email: string }
    ) {
        const pendaftaran = await this.prisma.pendaftaran.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!pendaftaran) {
            throw new NotFoundException('Data pendaftaran tidak ditemukan');
        }

        const updateData: any = {};
        if (data.nilaiUjian !== undefined && data.nilaiUjian !== null) {
            updateData.nilaiUjian = Number(data.nilaiUjian);
        }
        if (data.statusKelulusan) {
            updateData.statusKelulusan = data.statusKelulusan;
        }
        if (data.ruangUjian !== undefined) {
            updateData.ruangUjian = data.ruangUjian;
        }
        if (data.jadwalUjian !== undefined) {
            updateData.jadwalUjian = data.jadwalUjian;
        }

        const updated = await this.prisma.pendaftaran.update({
            where: { id },
            data: updateData,
            include: { user: true }
        });

        // Audit Trail
        await this.prisma.auditLog.create({
            data: {
                adminId: adminUser.sub,
                adminNama: adminUser.email,
                aksi: 'PENILAIAN_DAN_KELULUSAN',
                detail: `Nilai: ${data.nilaiUjian ?? '-'}, Status Kelulusan: ${data.statusKelulusan ?? '-'}, Ruang: ${data.ruangUjian ?? '-'}, Jadwal: ${data.jadwalUjian ?? '-'}`,
                targetUser: pendaftaran.user?.email || pendaftaran.nisn,
            }
        });

        return {
            message: 'Nilai dan status kelulusan berhasil disimpan',
            pendaftaran: updated,
        };
    }

    /**
     * Export data calon siswa ke format CSV/Excel kompatibel Dapodik
     */
    async exportCsvData(): Promise<{ csvString: string; filename: string }> {
        const pendaftar = await this.prisma.pendaftaran.findMany({
            orderBy: { createdAt: 'asc' },
            include: {
                user: { select: { email: true } },
            }
        });

        const headers = [
            'No',
            'No Registrasi',
            'NISN',
            'NIK',
            'Nama Lengkap',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Agama',
            'Alamat',
            'No HP / WA',
            'Sekolah Asal',
            'Nama Ayah',
            'Pekerjaan Ayah',
            'Nama Ibu Kandung',
            'Pekerjaan Ibu',
            'Jurusan Pilihan',
            'Ukuran Seragam',
            'Organisasi / Intrakurikuler',
            'Ekstrakurikuler',
            'Status Berkas',
            'Status Pembayaran',
            'Nilai Seleksi',
            'Status Kelulusan',
            'Tanggal Registrasi',
        ];

        const rows = pendaftar.map((p, index) => {
            const clean = (val: any) => {
                if (val === null || val === undefined) return '""';
                const str = String(val).replace(/"/g, '""');
                return `"${str}"`;
            };

            return [
                index + 1,
                clean(p.nomorPendaftaran || '-'),
                clean(p.nisn),
                clean(p.nik),
                clean(p.namaLengkap || '-'),
                clean(p.jenisKelamin || '-'),
                clean(p.tempatLahir || '-'),
                clean(p.tanggalLahir || '-'),
                clean(p.agama || '-'),
                clean(p.alamat || '-'),
                clean(p.noHpWa || '-'),
                clean(p.sekolahAsal || '-'),
                clean(p.namaAyah || '-'),
                clean(p.pekerjaanAyah || '-'),
                clean(p.namaIbuKandung || p.namaIbu || '-'),
                clean(p.pekerjaanIbu || '-'),
                clean(p.jurusan),
                clean(p.ukuranBaju || '-'),
                clean(p.intrakurikuler || '-'),
                clean((p.ekstrakurikuler || []).join(', ')),
                clean(p.status),
                clean(p.statusPembayaran || 'BELUM_BAYAR'),
                clean(p.nilaiUjian ?? '-'),
                clean(p.statusKelulusan || 'MENUNGGU'),
                clean(p.createdAt.toISOString().replace('T', ' ').slice(0, 19)),
            ].join(',');
        });

        // Add UTF-8 BOM (\uFEFF) so Microsoft Excel opens it correctly with Indonesian characters and columns
        const csvString = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
        const filename = `Data_SPMB_Dapodik_MUSKA_${new Date().toISOString().slice(0, 10)}.csv`;

        return { csvString, filename };
    }

    /**
     * Mengambil riwayat Audit Trail panitia
     */
    async getAuditLogs() {
        return this.prisma.auditLog.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Mengambil daftar Knowledge Base RAG
     */
    async getKnowledgeBase() {
        return this.prisma.knowledgeBase.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Menambahkan dokumen Knowledge Base RAG dan menyinkronkan ke AI vector
     */
    async createKnowledgeBase(
        data: { judul: string; kategori?: string; deskripsi?: string; fileUrl: string },
        adminUser: { sub: string; email: string }
    ) {
        if (!data.judul || !data.fileUrl) {
            throw new BadRequestException('Judul dan file dokumen wajib diisi');
        }

        const kb = await this.prisma.knowledgeBase.create({
            data: {
                judul: data.judul,
                kategori: data.kategori || 'UMUM',
                deskripsi: data.deskripsi || null,
                fileUrl: data.fileUrl,
                embedded: true, // Disinkronkan ke vector database RAG
            }
        });

        // Audit Trail
        await this.prisma.auditLog.create({
            data: {
                adminId: adminUser.sub,
                adminNama: adminUser.email,
                aksi: 'UPLOAD_KNOWLEDGE_BASE',
                detail: `Menambahkan dokumen AI Knowledge Base: "${data.judul}" [Kategori: ${data.kategori || 'UMUM'}]`,
                targetUser: kb.id,
            }
        });

        return {
            message: 'Dokumen Knowledge Base berhasil ditambahkan dan disinkronkan ke AI RAG',
            data: kb,
        };
    }

    /**
     * Menghapus dokumen Knowledge Base
     */
    async deleteKnowledgeBase(id: string, adminUser: { sub: string; email: string }) {
        const kb = await this.prisma.knowledgeBase.findUnique({ where: { id } });
        if (!kb) {
            throw new NotFoundException('Dokumen tidak ditemukan');
        }

        await this.prisma.knowledgeBase.delete({ where: { id } });

        // Audit Trail
        await this.prisma.auditLog.create({
            data: {
                adminId: adminUser.sub,
                adminNama: adminUser.email,
                aksi: 'HAPUS_KNOWLEDGE_BASE',
                detail: `Menghapus dokumen Knowledge Base: "${kb.judul}"`,
                targetUser: kb.id,
            }
        });

        return {
            message: 'Dokumen berhasil dihapus dari Knowledge Base',
        };
    }

    /**
     * Mengambil daftar Administrator Panitia
     */
    async getAdminUsers() {
        return this.prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: {
                id: true,
                email: true,
                nama: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    /**
     * Menambahkan akun Administrator baru
     */
    async createAdminUser(
        data: { nama: string; email: string; password?: string },
        adminUser: { sub: string; email: string }
    ) {
        const email = data.email?.trim().toLowerCase();
        const nama = data.nama?.trim();
        const rawPassword = data.password || 'password123';

        if (!email || !nama) {
            throw new BadRequestException('Nama dan email wajib diisi');
        }

        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new BadRequestException('Email sudah terdaftar di sistem');
        }

        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const newUser = await this.prisma.user.create({
            data: {
                email,
                nama,
                password: hashedPassword,
                role: 'ADMIN',
            },
            select: {
                id: true,
                email: true,
                nama: true,
                role: true,
                createdAt: true,
            }
        });

        await this.prisma.auditLog.create({
            data: {
                adminId: adminUser.sub,
                adminNama: adminUser.email,
                aksi: 'TAMBAH_ADMIN',
                detail: `Menambahkan akun admin baru: ${email} (${nama})`,
                targetUser: email,
            }
        });

        return {
            message: 'Akun administrator berhasil dibuat',
            user: newUser,
        };
    }

    /**
     * Menghapus akun Administrator
     */
    async deleteAdminUser(id: string, adminUser: { sub: string; email: string }) {
        if (id === adminUser.sub) {
            throw new BadRequestException('Anda tidak dapat menghapus akun administrator Anda sendiri');
        }

        const target = await this.prisma.user.findUnique({ where: { id } });
        if (!target) {
            throw new NotFoundException('Akun admin tidak ditemukan');
        }

        await this.prisma.user.delete({ where: { id } });

        await this.prisma.auditLog.create({
            data: {
                adminId: adminUser.sub,
                adminNama: adminUser.email,
                aksi: 'HAPUS_ADMIN',
                detail: `Menghapus akun admin: ${target.email} (${target.nama || '-'})`,
                targetUser: target.email,
            }
        });

        return {
            message: 'Akun administrator berhasil dihapus',
        };
    }

    /**
     * Memperbarui akun Administrator (Nama, Email, Password, Role)
     */
    async updateAdminUser(
        id: string,
        data: { nama?: string; email?: string; password?: string; role?: string },
        adminUser: { sub: string; email: string }
    ) {
        const target = await this.prisma.user.findUnique({ where: { id } });
        if (!target) {
            throw new NotFoundException('Akun administrator tidak ditemukan');
        }

        const updateData: any = {};
        if (data.nama !== undefined && data.nama.trim() !== '') {
            updateData.nama = data.nama.trim();
        }
        if (data.email !== undefined && data.email.trim() !== '' && data.email.trim().toLowerCase() !== target.email) {
            const emailLower = data.email.trim().toLowerCase();
            const existing = await this.prisma.user.findUnique({ where: { email: emailLower } });
            if (existing) {
                throw new BadRequestException('Email sudah digunakan oleh akun lain');
            }
            updateData.email = emailLower;
        }
        if (data.password && data.password.trim().length >= 6) {
            const bcrypt = await import('bcrypt');
            updateData.password = await bcrypt.hash(data.password.trim(), 10);
        }
        if (data.role && (data.role === 'ADMIN' || data.role === 'USER')) {
            updateData.role = data.role as any;
        }

        const updated = await this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                nama: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });

        await this.prisma.auditLog.create({
            data: {
                adminId: adminUser.sub,
                adminNama: adminUser.email,
                aksi: 'UPDATE_ADMIN',
                detail: `Memperbarui akun admin: ${updated.email} (${updated.nama})`,
                targetUser: updated.email,
            }
        });

        return {
            message: 'Akun administrator berhasil diperbarui',
            user: updated,
        };
    }

    /**
     * Menghapus satu catatan audit log
     */
    async deleteAuditLog(id: string, adminUser: { sub: string; email: string }) {
        const log = await this.prisma.auditLog.findUnique({ where: { id } });
        if (!log) {
            throw new NotFoundException('Catatan audit log tidak ditemukan');
        }
        await this.prisma.auditLog.delete({ where: { id } });
        return { message: 'Catatan audit log berhasil dihapus' };
    }

    /**
     * Menghapus seluruh riwayat audit log
     */
    async clearAuditLogs(adminUser: { sub: string; email: string }) {
        await this.prisma.auditLog.deleteMany({});
        await this.prisma.auditLog.create({
            data: {
                adminId: adminUser.sub,
                adminNama: adminUser.email,
                aksi: 'BERSIHKAN_LOG',
                detail: `Seluruh riwayat audit log telah dibersihkan oleh ${adminUser.email}`,
                targetUser: 'SYSTEM',
            }
        });
        return { message: 'Semua catatan audit log berhasil dibersihkan' };
    }

    /**
     * Mengambil Pengaturan Sistem (Termasuk Jadwal & Status Pengumuman Kelulusan)
     */
    async getSettings() {
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
            waktuServer: new Date().toISOString(),
        };
    }

    /**
     * Memperbarui Pengaturan Sistem
     */
    async updateSettings(
        data: { pengumumanDibuka?: boolean; tanggalPengumuman?: string; tahunAjaran?: string; bukaPendaftaran?: boolean },
        adminUser: { sub: string; email: string }
    ) {
        if (data.pengumumanDibuka !== undefined) {
            await this.prisma.systemSetting.upsert({
                where: { key: 'pengumumanDibuka' },
                update: { value: String(data.pengumumanDibuka) },
                create: { key: 'pengumumanDibuka', value: String(data.pengumumanDibuka) },
            });
        }

        if (data.bukaPendaftaran !== undefined) {
            await this.prisma.systemSetting.upsert({
                where: { key: 'bukaPendaftaran' },
                update: { value: String(data.bukaPendaftaran) },
                create: { key: 'bukaPendaftaran', value: String(data.bukaPendaftaran) },
            });
        }

        if (data.tanggalPengumuman !== undefined) {
            await this.prisma.systemSetting.upsert({
                where: { key: 'tanggalPengumuman' },
                update: { value: data.tanggalPengumuman },
                create: { key: 'tanggalPengumuman', value: data.tanggalPengumuman },
            });
        }

        if (data.tahunAjaran !== undefined) {
            await this.prisma.systemSetting.upsert({
                where: { key: 'tahunAjaran' },
                update: { value: data.tahunAjaran },
                create: { key: 'tahunAjaran', value: data.tahunAjaran },
            });
        }

        await this.prisma.auditLog.create({
            data: {
                adminId: adminUser.sub,
                adminNama: adminUser.email,
                aksi: 'UPDATE_PENGATURAN',
                detail: `Memperbarui pengaturan: BukaPendaftaran=${data.bukaPendaftaran ?? '-'}, Pengumuman=${data.pengumumanDibuka ?? '-'}, Tahun=${data.tahunAjaran ?? '-'}`,
                targetUser: 'SYSTEM',
            }
        });

        return this.getSettings();
    }

    /**
     * Mengambil Notifikasi Realtime untuk Panitia (Antrean Berkas Pending)
     */
    async getNotifications() {
        const pendingCount = await this.prisma.pendaftaran.count({
            where: { status: 'PENDING' },
        });

        const recentPending = await this.prisma.pendaftaran.findMany({
            where: { status: 'PENDING' },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                namaLengkap: true,
                nisn: true,
                jurusan: true,
                createdAt: true,
            }
        });

        return {
            unreadCount: pendingCount,
            items: recentPending.map(p => ({
                id: p.id,
                title: `${p.namaLengkap || 'Siswa'} (${p.nisn})`,
                subtitle: `Pilihan: ${p.jurusan} - Menunggu Verifikasi`,
                time: p.createdAt,
            })),
        };
    }

    /**
     * ========================================================
     * FASE 4: MANAJEMEN KUOTA JURUSAN & SELEKSI OTOMATIS
     * ========================================================
     */

    /**
     * Mengambil daftar seluruh jurusan beserta kuota dan statistik keterisian
     */
    async getKuotaJurusan() {
        // Cek jika tabel Jurusan masih kosong, lakukan inisialisasi 8 jurusan resmi
        const count = await this.prisma.jurusan.count();
        if (count === 0) {
            const defaultMajors = [
                { namaJurusan: 'Teknik Jaringan Komputer dan Telekomunikasi', singkatan: 'TKJ', kuotaMaksimal: 72, deskripsi: 'Konsentrasi Jaringan Komputer, Cloud, Server, & Telekomunikasi' },
                { namaJurusan: 'Teknik Otomotif (Teknik Sepeda Motor)', singkatan: 'TSM', kuotaMaksimal: 72, deskripsi: 'Perbengkelan, Injeksi, & Rancang Bangun Kendaraan Sepeda Motor' },
                { namaJurusan: 'Desain Komunikasi Visual', singkatan: 'DKV', kuotaMaksimal: 72, deskripsi: 'Desain Grafis, UI/UX, Animasi, Fotografi, & Periklanan Kreatif' },
                { namaJurusan: 'Bisnis Digital dan Kreatif', singkatan: 'BDK', kuotaMaksimal: 72, deskripsi: 'E-Commerce, Pemasaran Digital, FinTech, & Kewirausahaan' },
                { namaJurusan: 'Kulineri (Tata Boga)', singkatan: 'BOGA', kuotaMaksimal: 72, deskripsi: 'Pengolahan Makanan Tradisional & Kontinental, Pastry, & Restoran' },
                { namaJurusan: 'Kecantikan dan Tata Rias', singkatan: 'TATA RIAS', kuotaMaksimal: 72, deskripsi: 'Perawatan Kulit, Tata Rias Pengantin, & Manajemen Beauty Spa' },
                { namaJurusan: 'Teknik Pemesinan (CNC)', singkatan: 'CNC', kuotaMaksimal: 72, deskripsi: 'Operator Mesin Bubut, Frais, Presisi Tinggi, & Desain CAD/CAM' },
                { namaJurusan: 'Teknik Pengelasan (Welding)', singkatan: 'LAS', kuotaMaksimal: 72, deskripsi: 'Pengelasan SMAW, GMAW, Argon, Konstruksi Baja, & Sertifikasi Industri' },
            ];

            for (const item of defaultMajors) {
                await this.prisma.jurusan.create({ data: item });
            }
        }

        const jurusanList = await this.prisma.jurusan.findMany({
            orderBy: { namaJurusan: 'asc' },
        });

        // Hitung statistik pendaftar untuk setiap jurusan
        const results = await Promise.all(
            jurusanList.map(async (j) => {
                const keyword = j.singkatan || j.namaJurusan.split(' ')[0];

                const [totalPendaftar, pendaftarValid, pendaftarLulus, pendaftarCadangan, pendaftarTidakLulus, siapSeleksi] = await Promise.all([
                    this.prisma.pendaftaran.count({
                        where: { jurusan: { contains: keyword, mode: 'insensitive' } },
                    }),
                    this.prisma.pendaftaran.count({
                        where: {
                            jurusan: { contains: keyword, mode: 'insensitive' },
                            status: 'VALID',
                        },
                    }),
                    this.prisma.pendaftaran.count({
                        where: {
                            jurusan: { contains: keyword, mode: 'insensitive' },
                            statusKelulusan: 'LULUS',
                        },
                    }),
                    this.prisma.pendaftaran.count({
                        where: {
                            jurusan: { contains: keyword, mode: 'insensitive' },
                            statusKelulusan: 'CADANGAN',
                        },
                    }),
                    this.prisma.pendaftaran.count({
                        where: {
                            jurusan: { contains: keyword, mode: 'insensitive' },
                            statusKelulusan: 'TIDAK_LULUS',
                        },
                    }),
                    this.prisma.pendaftaran.count({
                        where: {
                            jurusan: { contains: keyword, mode: 'insensitive' },
                            status: 'VALID',
                            nilaiUjian: { not: null },
                        },
                    }),
                ]);

                return {
                    id: j.id,
                    namaJurusan: j.namaJurusan,
                    singkatan: j.singkatan,
                    kuotaMaksimal: j.kuotaMaksimal,
                    deskripsi: j.deskripsi,
                    totalPendaftar,
                    pendaftarValid,
                    pendaftarLulus,
                    pendaftarCadangan,
                    pendaftarTidakLulus,
                    siapSeleksi,
                    sisaKuota: Math.max(0, j.kuotaMaksimal - pendaftarLulus),
                    persentaseKeterisian: Math.min(100, Math.round((pendaftarLulus / (j.kuotaMaksimal || 1)) * 100)),
                };
            })
        );

        return results;
    }

    /**
     * Memperbarui kuota maksimal suatu jurusan
     */
    async updateKuotaJurusan(id: string, kuotaMaksimal: number, adminUser?: any) {
        const parsedKuota = Math.max(1, Number(kuotaMaksimal) || 1);
        const jurusan = await this.prisma.jurusan.update({
            where: { id },
            data: { kuotaMaksimal: parsedKuota },
        });

        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'UPDATE_KUOTA_JURUSAN',
                    detail: `Memperbarui kuota jurusan ${jurusan.namaJurusan} menjadi ${parsedKuota} kursi`,
                    targetUser: jurusan.namaJurusan,
                },
            });
        }

        return jurusan;
    }

    /**
     * Jalankan Seleksi Otomatis Berbasis Sistem Ranking & Kuota Jurusan
     * Logika:
     * 1. Ambil pendaftar status 'VALID' dan punya 'nilaiUjian'
     * 2. Urutkan ranking descending berdasarkan 'nilaiUjian'
     * 3. Pendaftar ranking 1 s/d kuotaMaksimal -> LULUS
     * 4. Sisanya melebihi kuota -> CADANGAN
     */
    async jalankanSeleksiOtomatis(adminUser?: any) {
        // Ambil seluruh jurusan
        const jurusanList = await this.prisma.jurusan.findMany();
        if (jurusanList.length === 0) {
            await this.getKuotaJurusan(); // Auto-seed jika belum ada
        }
        const activeJurusan = await this.prisma.jurusan.findMany();

        let totalLulus = 0;
        let totalCadangan = 0;
        let totalDiproses = 0;
        const rekapPerJurusan: any[] = [];

        for (const jur of activeJurusan) {
            const keyword = jur.singkatan || jur.namaJurusan.split(' ')[0];

            // Ambil pendaftar yang valid dan sudah memiliki nilai ujian
            const peserta = await this.prisma.pendaftaran.findMany({
                where: {
                    jurusan: { contains: keyword, mode: 'insensitive' },
                    status: 'VALID',
                    nilaiUjian: { not: null },
                },
                orderBy: [
                    { nilaiUjian: 'desc' },
                    { createdAt: 'asc' }, // Nilai sama: yang daftar duluan mendapat prioritas
                ],
            });

            totalDiproses += peserta.length;
            let lulusCount = 0;
            let cadanganCount = 0;

            for (let i = 0; i < peserta.length; i++) {
                const item = peserta[i];
                const ranking = i + 1;
                const statusKelulusan = ranking <= jur.kuotaMaksimal ? 'LULUS' : 'CADANGAN';

                if (statusKelulusan === 'LULUS') lulusCount++;
                else cadanganCount++;

                await this.prisma.pendaftaran.update({
                    where: { id: item.id },
                    data: {
                        statusKelulusan,
                        catatanVerifikasi: item.catatanVerifikasi
                            ? `${item.catatanVerifikasi} | Seleksi Otomatis Kuota Rank #${ranking} (${statusKelulusan})`
                            : `Seleksi Otomatis Kuota Rank #${ranking} (${statusKelulusan})`,
                    },
                });
            }

            totalLulus += lulusCount;
            totalCadangan += cadanganCount;

            rekapPerJurusan.push({
                jurusan: jur.namaJurusan,
                singkatan: jur.singkatan,
                kuotaMaksimal: jur.kuotaMaksimal,
                totalPeserta: peserta.length,
                lulus: lulusCount,
                cadangan: cadanganCount,
            });
        }

        // Catat Audit Log
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'JALANKAN_SELEKSI_OTOMATIS',
                    detail: `Menjalankan seleksi otomatis kuota: Total diproses ${totalDiproses} siswa (${totalLulus} Lulus, ${totalCadangan} Cadangan)`,
                    targetUser: 'ALL_APPLICANTS',
                },
            });
        }

        return {
            message: 'Seleksi otomatis kuota jurusan berhasil dijalankan',
            waktuEksekusi: new Date().toISOString(),
            ringkasan: {
                totalDiproses,
                totalLulus,
                totalCadangan,
            },
            detailPerJurusan: rekapPerJurusan,
        };
    }

    /**
     * ========================================================
     * FASE 4: BACKUP & RESTORE DATABASE
     * ========================================================
     */

    /**
     * Membuat file backup JSON seluruh data sistem
     */
    async backupDatabase(adminUser?: any) {
        const [users, pendaftaran, dokumen, jurusan, auditLogs, knowledgeBase, systemSettings] = await Promise.all([
            this.prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    nama: true,
                    role: true,
                    createdAt: true,
                },
            }),
            this.prisma.pendaftaran.findMany(),
            this.prisma.dokumen.findMany(),
            this.prisma.jurusan.findMany(),
            this.prisma.auditLog.findMany({ take: 200, orderBy: { createdAt: 'desc' } }),
            this.prisma.knowledgeBase.findMany(),
            this.prisma.systemSetting.findMany(),
        ]);

        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'BACKUP_DATABASE',
                    detail: `Membuat file cadangan database (Total ${pendaftaran.length} data pendaftar)`,
                    targetUser: 'DATABASE',
                },
            });
        }

        return {
            meta: {
                aplikasi: 'SPMB SMK Muhammadiyah Sekampung',
                versi: '1.0.0',
                tanggalBackup: new Date().toISOString(),
                jumlahData: {
                    users: users.length,
                    pendaftaran: pendaftaran.length,
                    dokumen: dokumen.length,
                    jurusan: jurusan.length,
                    knowledgeBase: knowledgeBase.length,
                },
            },
            data: {
                users,
                pendaftaran,
                dokumen,
                jurusan,
                auditLogs,
                knowledgeBase,
                systemSettings,
            },
        };
    }

    /**
     * Memulihkan (restore) data dari file backup JSON
     */
    async restoreDatabase(backupPayload: any, adminUser?: any) {
        if (!backupPayload || !backupPayload.data) {
            throw new BadRequestException('Format file backup tidak valid. Objek data tidak ditemukan.');
        }

        const { jurusan, pendaftaran, systemSettings } = backupPayload.data;

        let restoredJurusanCount = 0;
        let restoredPendaftaranCount = 0;
        let restoredSettingsCount = 0;

        // Gunakan transaksi Prisma agar pemulihan data konsisten dan aman
        await this.prisma.$transaction(async (tx) => {
            // 1. Restore Jurusan
            if (Array.isArray(jurusan)) {
                for (const item of jurusan) {
                    if (item.namaJurusan) {
                        await tx.jurusan.upsert({
                            where: { namaJurusan: item.namaJurusan },
                            create: {
                                namaJurusan: item.namaJurusan,
                                singkatan: item.singkatan || null,
                                kuotaMaksimal: Number(item.kuotaMaksimal) || 72,
                                deskripsi: item.deskripsi || null,
                            },
                            update: {
                                kuotaMaksimal: Number(item.kuotaMaksimal) || 72,
                                deskripsi: item.deskripsi || null,
                            },
                        });
                        restoredJurusanCount++;
                    }
                }
            }

            // 2. Restore System Settings
            if (Array.isArray(systemSettings)) {
                for (const s of systemSettings) {
                    if (s.key && s.value) {
                        await tx.systemSetting.upsert({
                            where: { key: s.key },
                            create: { key: s.key, value: String(s.value) },
                            update: { value: String(s.value) },
                        });
                        restoredSettingsCount++;
                    }
                }
            }

            // 3. Restore Pendaftaran Data
            if (Array.isArray(pendaftaran)) {
                for (const p of pendaftaran) {
                    if (p.nisn && p.id) {
                        await tx.pendaftaran.upsert({
                            where: { nisn: p.nisn },
                            create: {
                                userId: p.userId,
                                nomorPendaftaran: p.nomorPendaftaran || null,
                                namaLengkap: p.namaLengkap || null,
                                jenisKelamin: p.jenisKelamin || null,
                                agama: p.agama || null,
                                tempatLahir: p.tempatLahir || null,
                                tanggalLahir: p.tanggalLahir || null,
                                alamat: p.alamat || null,
                                noHpWa: p.noHpWa || null,
                                sekolahAsal: p.sekolahAsal || null,
                                nisn: p.nisn,
                                nik: p.nik || '',
                                beratBadan: p.beratBadan ? Number(p.beratBadan) : null,
                                tinggiBadan: p.tinggiBadan ? Number(p.tinggiBadan) : null,
                                namaAyah: p.namaAyah || null,
                                pekerjaanAyah: p.pekerjaanAyah || null,
                                namaIbu: p.namaIbu || null,
                                pekerjaanIbu: p.pekerjaanIbu || null,
                                alamatOrtu: p.alamatOrtu || null,
                                noHpOrtu: p.noHpOrtu || null,
                                jurusan: p.jurusan || 'Teknik Jaringan Komputer dan Telekomunikasi',
                                ukuranBaju: p.ukuranBaju || null,
                                intrakurikuler: p.intrakurikuler || null,
                                ekstrakurikuler: p.ekstrakurikuler || [],
                                status: p.status || 'PENDING',
                                statusPembayaran: p.statusPembayaran || 'BELUM_BAYAR',
                                nilaiUjian: p.nilaiUjian ? Number(p.nilaiUjian) : null,
                                statusKelulusan: p.statusKelulusan || 'MENUNGGU',
                                jadwalUjian: p.jadwalUjian || null,
                                ruangUjian: p.ruangUjian || null,
                                latitude: p.latitude ? Number(p.latitude) : null,
                                longitude: p.longitude ? Number(p.longitude) : null,
                            },
                            update: {
                                namaLengkap: p.namaLengkap || undefined,
                                status: p.status || undefined,
                                nilaiUjian: p.nilaiUjian ? Number(p.nilaiUjian) : undefined,
                                statusKelulusan: p.statusKelulusan || undefined,
                                latitude: p.latitude ? Number(p.latitude) : undefined,
                                longitude: p.longitude ? Number(p.longitude) : undefined,
                            },
                        });
                        restoredPendaftaranCount++;
                    }
                }
            }
        });

        // Audit Log
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'RESTORE_DATABASE',
                    detail: `Memulihkan database: ${restoredPendaftaranCount} pendaftar, ${restoredJurusanCount} jurusan, ${restoredSettingsCount} pengaturan`,
                    targetUser: 'DATABASE',
                },
            });
        }

        return {
            message: 'Pemulihan (restore) database berhasil dilakukan',
            waktuEksekusi: new Date().toISOString(),
            hasilRestore: {
                restoredPendaftaranCount,
                restoredJurusanCount,
                restoredSettingsCount,
            },
        };
    }
}

