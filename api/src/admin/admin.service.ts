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

        // Distribusi Pendaftar per Jurusan
        const listJurusan = [
            'Teknik Kendaraan Ringan (TKR)',
            'Teknik dan Bisnis Sepeda Motor (TBSM)',
            'Teknik Komputer dan Jaringan (TKJ)',
            'Rekayasa Perangkat Lunak (RPL)',
            'Akuntansi dan Keuangan Lembaga (AKL)',
            'Otomatisasi dan Tata Kelola Perkantoran (OTKP)',
            'Bisnis Daring dan Pemasaran (BDP)',
            'Desain Pemodelan dan Informasi Bangunan (DPIB)',
        ];

        const jurusanStats = await Promise.all(
            listJurusan.map(async (jur) => {
                const count = await this.prisma.pendaftaran.count({
                    where: { jurusan: { contains: jur.split(' ')[0] } }
                });
                return {
                    jurusan: jur,
                    singkatan: jur.match(/\((.*?)\)/)?.[1] || jur,
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
        page?: number;
        limit?: number;
    }) {
        const page = Math.max(1, Number(params.page) || 1);
        const limit = Math.max(1, Number(params.limit) || 15);
        const skip = (page - 1) * limit;

        const where: any = {};

        if (params.search && params.search.trim() !== '') {
            const query = params.search.trim();
            where.OR = [
                { namaLengkap: { contains: query, mode: 'insensitive' } },
                { nisn: { contains: query, mode: 'insensitive' } },
                { nik: { contains: query, mode: 'insensitive' } },
                { sekolahAsal: { contains: query, mode: 'insensitive' } },
                { nomorPendaftaran: { contains: query, mode: 'insensitive' } },
                { user: { email: { contains: query, mode: 'insensitive' } } },
            ];
        }

        if (params.jurusan && params.jurusan !== 'ALL') {
            where.jurusan = { contains: params.jurusan, mode: 'insensitive' };
        }

        if (params.status && params.status !== 'ALL') {
            where.status = params.status;
        }

        if (params.statusPembayaran && params.statusPembayaran !== 'ALL') {
            where.statusPembayaran = params.statusPembayaran;
        }

        if (params.statusKelulusan && params.statusKelulusan !== 'ALL') {
            where.statusKelulusan = params.statusKelulusan;
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
            waktuServer: new Date().toISOString(),
        };
    }

    /**
     * Memperbarui Pengaturan Sistem
     */
    async updateSettings(
        data: { pengumumanDibuka?: boolean; tanggalPengumuman?: string; tahunAjaran?: string },
        adminUser: { sub: string; email: string }
    ) {
        if (data.pengumumanDibuka !== undefined) {
            await this.prisma.systemSetting.upsert({
                where: { key: 'pengumumanDibuka' },
                update: { value: String(data.pengumumanDibuka) },
                create: { key: 'pengumumanDibuka', value: String(data.pengumumanDibuka) },
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
                detail: `Memperbarui pengaturan: Status Pengumuman=${data.pengumumanDibuka ?? '-'}, Tgl Pengumuman=${data.tanggalPengumuman ?? '-'}`,
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
}
