import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LandingPageService {
    constructor(private prisma: PrismaService) { }

    /**
     * Public API: Mengambil seluruh data landing page sekolah
     * Auto-seed otomatis jika tabel masih kosong
     */
    async getPublicLandingData() {
        // Cek dan inisialisasi data bawaan sekolah jika belum ada
        await this.ensureInitialSeed();

        const [sliders, profil, wks, guru, programKeahlian, mitraIndustri, berita] = await Promise.all([
            this.prisma.heroSlider.findMany({
                where: { isActive: true },
                orderBy: { urutan: 'asc' },
            }),
            this.prisma.profilSekolah.findFirst(),
            this.prisma.profilWKS.findMany({
                orderBy: { urutan: 'asc' },
            }),
            this.prisma.guru.findMany({
                where: { isActive: true },
                orderBy: { urutan: 'asc' },
            }),
            this.prisma.programKeahlian.findMany({
                orderBy: { urutan: 'asc' },
            }),
            this.prisma.mitraIndustri.findMany({
                orderBy: { urutan: 'asc' },
            }),
            this.prisma.berita.findMany({
                orderBy: { tanggalPublish: 'desc' },
                take: 6,
            }),
        ]);

        return {
            sliders,
            profil,
            wks,
            guru,
            programKeahlian,
            mitraIndustri,
            berita,
        };
    }

    /**
     * Memastikan data awal landing page tersedia
     */
    async ensureInitialSeed() {
        const profilCount = await this.prisma.profilSekolah.count();
        if (profilCount === 0) {
            await this.prisma.profilSekolah.create({
                data: {
                    id: 'default',
                    namaKepsek: 'Drs. H. Hendra Jaya, M.Pd.',
                    sambutanKepsek:
                        'Assalamu’alaikum Warahmatullahi Wabarakatuh.\n\nSelamat datang di portal resmi SMK Muhammadiyah Sekampung. Sebagai lembaga pendidikan vokasi unggulan di Kabupaten Lampung Timur, kami berkomitmen mencetak generasi muda yang berakhlak mulia, kompeten, berjiwa wirausaha, dan siap bersaing di kancah global. Didukung oleh teknologi informasi terdepan, kurikulum berbasis industri, dan sertifikasi keahlian, SMK Muhammadiyah Sekampung senantiasa berikhtiar memberikan layanan pendidikan terbaik demi masa depan gemilang putra-putri bangsa.\n\nWassalamu’alaikum Warahmatullahi Wabarakatuh.',
                    fotoKepsek: '/kepsek.jpg',
                    motto: 'Sukses · Jaya · Bermanfaat · Inspiratif',
                    videoProfilUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    sejarahSingkat:
                        'SMK Muhammadiyah Sekampung didirikan pada tahun 1998 di bawah naungan Pimpinan Cabang Muhammadiyah Sekampung untuk menjawab kebutuhan tenaga kerja terampil dan berakhlak Islami di Lampung.',
                    visi: 'Menjadi Sekolah Menengah Kejuruan yang Unggul, Berkarakter Islami, dan Berdaya Saing Global.',
                    misi:
                        '1. Mengembangkan pendidikan vokasi berbasis teknologi dan standar industri modern.\n2. Menanamkan nilai-nilai Al-Islam dan Kemuhammadiyahan dalam setiap aspek pembelajaran.\n3. Menjalin kemitraan strategis dengan Dunia Usaha dan Dunia Industri (DUDI).\n4. Membekali lulusan dengan sertifikasi kompetensi nasional dan jiwa kewirausahaan.',
                    alamatLengkap: 'Jl. Raya Sekampung No. 45, Sekampung, Kabupaten Lampung Timur, Lampung 34382',
                    emailResmi: 'smkmuhsekampung@gmail.com',
                    teleponResmi: '(0725) 7851234',
                    whatsappResmi: '081234567890',
                    mapsEmbedUrl:
                        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.109012345678!2d105.4414!3d-5.1973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMTEnNTAuMyJTIDEwNcKwMjYnMjkuMCJF!5e0!3m2!1sid!2sid!4v1600000000000!5m2!1sid!2sid',
                },
            });
        }

        const sliderCount = await this.prisma.heroSlider.count();
        if (sliderCount === 0) {
            await this.prisma.heroSlider.createMany({
                data: [
                    {
                        title: 'Penerimaan Siswa Baru (SPMB) Tahun Ajaran 2026/2027',
                        subtitle: 'Daftar sekarang secara online dengan verifikasi AI OCR & Chatbot RAG terintegrasi.',
                        imageUrl: '/banner-spmb.jpg',
                        linkUrl: '/register',
                        isActive: true,
                        urutan: 1,
                    },
                    {
                        title: 'Pendidikan Vokasi Unggulan & Berstandar Industri',
                        subtitle: 'Kurikulum selaras dengan Dunia Usaha dan Dunia Industri serta sertifikasi kompetensi BNSP.',
                        imageUrl: '/banner-praktik.jpg',
                        linkUrl: '/login',
                        isActive: true,
                        urutan: 2,
                    },
                    {
                        title: 'Fasilitas Bengkel Modern & Laboratorium CBT',
                        subtitle: 'Laboratorium komputer multimedia canggih, bengkel otomotif standar APM, dan studio DKV.',
                        imageUrl: '/banner-lab.jpg',
                        linkUrl: '/register',
                        isActive: true,
                        urutan: 3,
                    },
                ],
            });
        }

        const wksCount = await this.prisma.profilWKS.count();
        if (wksCount === 0) {
            await this.prisma.profilWKS.createMany({
                data: [
                    {
                        nama: 'Drs. Ahmad Fauzi, M.Pd.',
                        jabatan: 'WKS 1 - Bidang Kurikulum & Pembelajaran',
                        fotoUrl: '/wks-kurikulum.jpg',
                        urutan: 1,
                    },
                    {
                        nama: 'Bambang Sudarmono, S.Kom.',
                        jabatan: 'WKS 2 - Bidang Kesiswaan & Kedisiplinan',
                        fotoUrl: '/wks-kesiswaan.jpg',
                        urutan: 2,
                    },
                    {
                        nama: 'Ir. Siti Rahmawati, M.T.',
                        jabatan: 'WKS 3 - Bidang Sarana Prasarana & Humas',
                        fotoUrl: '/wks-sarpras.jpg',
                        urutan: 3,
                    },
                    {
                        nama: "Ust. Muhammad Rifa'i, S.Pd.I.",
                        jabatan: 'WKS 4 - Bidang Al-Islam, Kemuhammadiyahan & SDM',
                        fotoUrl: '/wks-aik.jpg',
                        urutan: 4,
                    },
                ],
            });
        }

        const guruCount = await this.prisma.guru.count();
        if (guruCount === 0) {
            await this.prisma.guru.createMany({
                data: [
                    {
                        nama: 'H. Suwandi, S.T., M.Kom.',
                        nip: '19780512 200501 1 008',
                        mataPelajaran: 'Teknik Jaringan Komputer & Cloud Computing',
                        pendidikan: 'S2 Magister Komputer',
                        fotoUrl: '/guru/guru-tkj.jpg',
                        urutan: 1,
                        isActive: true,
                    },
                    {
                        nama: 'Dedi Kusuma, S.Pd., Gr.',
                        nip: '19820315 200801 1 012',
                        mataPelajaran: 'Teknik Sepeda Motor & Sistem Injeksi Otomotif',
                        pendidikan: 'S1 Pendidikan Teknik Mesin Otomotif',
                        fotoUrl: '/guru/guru-tsm.jpg',
                        urutan: 2,
                        isActive: true,
                    },
                    {
                        nama: 'Nurul Hidayati, S.Sn.',
                        nip: '19860822 201001 2 015',
                        mataPelajaran: 'Desain Komunikasi Visual & Motion Graphics',
                        pendidikan: 'S1 Seni Rupa & Desain',
                        fotoUrl: '/guru/guru-dkv.jpg',
                        urutan: 3,
                        isActive: true,
                    },
                    {
                        nama: 'Ahmad Rifai, S.E.',
                        nip: '19841109 200901 1 007',
                        mataPelajaran: 'Bisnis Digital, Digital Marketing & E-Commerce',
                        pendidikan: 'S1 Ekonomi Bisnis Digital',
                        fotoUrl: '/guru/guru-bdk.jpg',
                        urutan: 4,
                        isActive: true,
                    },
                    {
                        nama: 'Siti Aminah, S.Pd.',
                        nip: '19890117 201201 2 020',
                        mataPelajaran: 'Tata Boga, Kuliner Nusantara & Pastry',
                        pendidikan: 'S1 Pendidikan Tata Boga',
                        fotoUrl: '/guru/guru-kuliner.jpg',
                        urutan: 5,
                        isActive: true,
                    },
                    {
                        nama: 'Rina Anggraini, S.Pd.',
                        nip: '19910405 201501 2 018',
                        mataPelajaran: 'Tata Rias Pengantin & Estetika Kecantikan',
                        pendidikan: 'S1 Pendidikan Tata Rias & Kecantikan',
                        fotoUrl: '/guru/guru-kecantikan.jpg',
                        urutan: 6,
                        isActive: true,
                    },
                    {
                        nama: 'Budi Santoso, S.T.',
                        nip: '19810719 200601 1 011',
                        mataPelajaran: 'Teknik Pemesinan Bubut, Frais & Pemrograman CNC',
                        pendidikan: 'S1 Teknik Mesin Produksi',
                        fotoUrl: '/guru/guru-cnc.jpg',
                        urutan: 7,
                        isActive: true,
                    },
                    {
                        nama: 'Eko Prasetyo, S.T.',
                        nip: '19831204 200701 1 014',
                        mataPelajaran: 'Teknik Pengelasan SMAW, MIG/MAG & TIG Argon',
                        pendidikan: 'S1 Teknik Metalurgi & Material',
                        fotoUrl: '/guru/guru-las.jpg',
                        urutan: 8,
                        isActive: true,
                    },
                ],
            });
        }

        const programCount = await this.prisma.programKeahlian.count();
        if (programCount === 0) {
            await this.prisma.programKeahlian.createMany({
                data: [
                    {
                        nama: 'Teknik Jaringan Komputer dan Telekomunikasi',
                        singkatan: 'TJKT / TKJ',
                        deskripsi: 'Mempelajari administrasi server, fiber optic, cloud computing, cybersecurity, dan infrastruktur jaringan modern.',
                        iconUrl: 'Server',
                        kuota: 72,
                        urutan: 1,
                    },
                    {
                        nama: 'Teknik Otomotif (Teknik Sepeda Motor)',
                        singkatan: 'TBSM / TSM',
                        deskripsi: 'Penguasaan teknologi sistem injeksi EFI, transmisi otomatis, kelistrikan bodi, dan manajemen bengkel resmi modern.',
                        iconUrl: 'Wrench',
                        kuota: 72,
                        urutan: 2,
                    },
                    {
                        nama: 'Desain Komunikasi Visual',
                        singkatan: 'DKV',
                        deskripsi: 'Desain grafis periklanan, videografi & sinematografi, animasi 2D/3D, fotografi profesional, serta UI/UX interface.',
                        iconUrl: 'Palette',
                        kuota: 72,
                        urutan: 3,
                    },
                    {
                        nama: 'Bisnis Digital dan Kreatif',
                        singkatan: 'BDK',
                        deskripsi: 'Digital marketing, e-commerce marketplace, optimasi SEO/SEM, content creation, dan manajemen operasional bisnis online.',
                        iconUrl: 'TrendingUp',
                        kuota: 72,
                        urutan: 4,
                    },
                    {
                        nama: 'Kulineri (Tata Boga)',
                        singkatan: 'BOGA',
                        deskripsi: 'Pengolahan hidangan nusantara & kontinental, bakery pastry, tata hidang restoran bintang, dan food hygiene HACCP.',
                        iconUrl: 'Utensils',
                        kuota: 72,
                        urutan: 5,
                    },
                    {
                        nama: 'Kecantikan dan Tata Rias',
                        singkatan: 'TATA RIAS',
                        deskripsi: 'Perawatan kulit & rambut modern, tata rias pengantin adat/internasional, seni nail art, dan salon & spa management.',
                        iconUrl: 'Sparkles',
                        kuota: 72,
                        urutan: 6,
                    },
                    {
                        nama: 'Teknik Pemesinan (CNC)',
                        singkatan: 'CNC',
                        deskripsi: 'Pengoperasian mesin bubut presisi tinggi, frais CNC, desain CAD/CAM SolidWorks, dan fabrikasi komponen presisi.',
                        iconUrl: 'Cpu',
                        kuota: 72,
                        urutan: 7,
                    },
                    {
                        nama: 'Teknik Pengelasan (Welding)',
                        singkatan: 'LAS',
                        deskripsi: 'Teknik pengelasan SMAW, GMAW/MIG, GTAW/Argon, inspeksi NDT visual las, dan konstruksi baja bersertifikasi industri.',
                        iconUrl: 'Flame',
                        kuota: 72,
                        urutan: 8,
                    },
                ],
            });
        }

        const mitraCount = await this.prisma.mitraIndustri.count();
        if (mitraCount === 0) {
            await this.prisma.mitraIndustri.createMany({
                data: [
                    { namaPerusahaan: 'PT Astra Honda Motor (AHM)', logoUrl: '/mitra/honda.png', bidangKerjasama: 'Teknik Sepeda Motor', urutan: 1 },
                    { namaPerusahaan: 'Telkom Indonesia', logoUrl: '/mitra/telkom.png', bidangKerjasama: 'Jaringan Fiber Optik & Internet', urutan: 2 },
                    { namaPerusahaan: 'PT United Tractors Tbk', logoUrl: '/mitra/ut.png', bidangKerjasama: 'Alat Berat & Pemesinan', urutan: 3 },
                    { namaPerusahaan: 'Axioo Class Program', logoUrl: '/mitra/axioo.png', bidangKerjasama: 'Perakitan & Service Laptop/PC', urutan: 4 },
                    { namaPerusahaan: 'Hotel Horison Lampung', logoUrl: '/mitra/horison.png', bidangKerjasama: 'Kulineri & Perhotelan', urutan: 5 },
                    { namaPerusahaan: 'PT Komatsu Indonesia', logoUrl: '/mitra/komatsu.png', bidangKerjasama: 'Teknik Pengelasan & Fabrikasi', urutan: 6 },
                ],
            });
        }

        const beritaCount = await this.prisma.berita.count();
        if (beritaCount === 0) {
            await this.prisma.berita.createMany({
                data: [
                    {
                        judul: 'Pembukaan Pendaftaran SPMB SMK Muhammadiyah Sekampung Gelombang 1',
                        slug: 'pembukaan-spmb-gelombang-1-2026',
                        ringkasan: 'Pendaftaran peserta didik baru resmi dibuka dengan kemudahan upload berkas digital berteknologi OCR cerdas.',
                        konten: 'SMK Muhammadiyah Sekampung secara resmi membuka gelombang pertama penerimaan peserta didik baru (SPMB) untuk tahun ajaran 2026/2027. Pada periode ini, calon siswa mendapatkan fasilitas kemudahan pendaftaran online terintegrasi dengan kecerdasan buatan (AI) yang mempermudah proses verifikasi berkas secara instan.',
                        thumbnail: '/berita-spmb.jpg',
                        kategori: 'Umum',
                        tanggalPublish: new Date(),
                        penulis: 'Humas SMK MUSKA',
                    },
                    {
                        judul: 'Siswa Jurusan TKJ Raih Juara 1 LKS Tingkat Provinsi Lampung',
                        slug: 'siswa-tkj-juara-1-lks-lampung',
                        ringkasan: 'Prestasi gemilang kembali ditorehkan ananda Fikri Pratama pada cabang IT Network System Administration.',
                        konten: 'Prestasi membanggakan kembali diukir oleh peserta didik SMK Muhammadiyah Sekampung. Dalam gelaran Lomba Kompetensi Siswa (LKS) Tingkat Provinsi Lampung, perwakilan jurusan TJKT berhasil menyabet juara pertama dan melaju ke tingkat nasional.',
                        thumbnail: '/berita-lks.jpg',
                        kategori: 'Prestasi',
                        tanggalPublish: new Date(Date.now() - 86400000 * 3),
                        penulis: 'Tim Jurnalistik MUSKA',
                    },
                    {
                        judul: 'Kunjungan Industri & Penandatanganan MoU Kelas Khusus Otomotif',
                        slug: 'mou-kelas-industri-otomotif',
                        ringkasan: 'Perluasan kerja sama link and match kurikulum berbasis kebutuhan bengkel resmi nasional.',
                        konten: 'Guna memperkuat relevansi kompetensi lulusan dengan kebutuhan dunia kerja riil, SMK Muhammadiyah Sekampung menandatangani perjanjian kerja sama kelas industri bersama mitra ATPM terkemuka, menjamin peluang magang dan rekrutmen kerja langsung.',
                        thumbnail: '/berita-mou.jpg',
                        kategori: 'Jurusan',
                        tanggalPublish: new Date(Date.now() - 86400000 * 7),
                        penulis: 'WKS 3 Humas & Hubin',
                    },
                ],
            });
        }
    }

    // ==========================================
    // 1. ADMIN CRUD: HERO SLIDER
    // ==========================================

    async getSliders() {
        return this.prisma.heroSlider.findMany({ orderBy: { urutan: 'asc' } });
    }

    async createSlider(data: any, adminUser?: any) {
        if (!data.title || !data.imageUrl) {
            throw new BadRequestException('Judul dan URL gambar slider wajib diisi');
        }
        const created = await this.prisma.heroSlider.create({
            data: {
                title: data.title,
                subtitle: data.subtitle || null,
                imageUrl: data.imageUrl,
                linkUrl: data.linkUrl || null,
                badgeText: data.badgeText || null,
                ctaText: data.ctaText || null,
                isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
                urutan: Number(data.urutan) || 0,
            },
        });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'CREATE_HERO_SLIDER',
                    detail: `Menambahkan banner slider: "${created.title}"`,
                    targetUser: created.id,
                },
            });
        }
        return created;
    }

    async updateSlider(id: string, data: any, adminUser?: any) {
        const existing = await this.prisma.heroSlider.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Slider tidak ditemukan');

        const updated = await this.prisma.heroSlider.update({
            where: { id },
            data: {
                title: data.title ?? existing.title,
                subtitle: data.subtitle !== undefined ? data.subtitle : existing.subtitle,
                imageUrl: data.imageUrl ?? existing.imageUrl,
                linkUrl: data.linkUrl !== undefined ? data.linkUrl : existing.linkUrl,
                badgeText: data.badgeText !== undefined ? data.badgeText : (existing as any).badgeText,
                ctaText: data.ctaText !== undefined ? data.ctaText : (existing as any).ctaText,
                isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
                urutan: data.urutan !== undefined ? Number(data.urutan) : existing.urutan,
            },
        });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'UPDATE_HERO_SLIDER',
                    detail: `Memperbarui banner slider: "${updated.title}"`,
                    targetUser: id,
                },
            });
        }
        return updated;
    }

    async deleteSlider(id: string, adminUser?: any) {
        const existing = await this.prisma.heroSlider.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Slider tidak ditemukan');

        await this.prisma.heroSlider.delete({ where: { id } });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'DELETE_HERO_SLIDER',
                    detail: `Menghapus banner slider: "${existing.title}"`,
                    targetUser: id,
                },
            });
        }
        return { message: 'Slider berhasil dihapus' };
    }

    // ==========================================
    // 2. ADMIN CRUD: PROFIL SEKOLAH & SAMBUTAN
    // ==========================================

    async getProfil() {
        let profil = await this.prisma.profilSekolah.findFirst();
        if (!profil) {
            await this.ensureInitialSeed();
            profil = await this.prisma.profilSekolah.findFirst();
        }
        return profil;
    }

    async updateProfil(data: any, adminUser?: any) {
        let profil = await this.prisma.profilSekolah.findFirst();
        const id = profil?.id || 'default';

        const updated = await this.prisma.profilSekolah.upsert({
            where: { id },
            create: {
                id,
                namaKepsek: data.namaKepsek || 'Kepala Sekolah SMK Muhammadiyah Sekampung',
                sambutanKepsek: data.sambutanKepsek || '',
                fotoKepsek: data.fotoKepsek || '/kepsek.jpg',
                motto: data.motto || 'Sukses · Jaya · Bermanfaat · Inspiratif',
                videoProfilUrl: data.videoProfilUrl || null,
                sejarahSingkat: data.sejarahSingkat || null,
                visi: data.visi || null,
                misi: data.misi || null,
                alamatLengkap: data.alamatLengkap || null,
                emailResmi: data.emailResmi || null,
                teleponResmi: data.teleponResmi || null,
                whatsappResmi: data.whatsappResmi || null,
                mapsEmbedUrl: data.mapsEmbedUrl || null,
            },
            update: {
                namaKepsek: data.namaKepsek !== undefined ? data.namaKepsek : undefined,
                sambutanKepsek: data.sambutanKepsek !== undefined ? data.sambutanKepsek : undefined,
                fotoKepsek: data.fotoKepsek !== undefined ? data.fotoKepsek : undefined,
                motto: data.motto !== undefined ? data.motto : undefined,
                videoProfilUrl: data.videoProfilUrl !== undefined ? data.videoProfilUrl : undefined,
                sejarahSingkat: data.sejarahSingkat !== undefined ? data.sejarahSingkat : undefined,
                visi: data.visi !== undefined ? data.visi : undefined,
                misi: data.misi !== undefined ? data.misi : undefined,
                alamatLengkap: data.alamatLengkap !== undefined ? data.alamatLengkap : undefined,
                emailResmi: data.emailResmi !== undefined ? data.emailResmi : undefined,
                teleponResmi: data.teleponResmi !== undefined ? data.teleponResmi : undefined,
                whatsappResmi: data.whatsappResmi !== undefined ? data.whatsappResmi : undefined,
                mapsEmbedUrl: data.mapsEmbedUrl !== undefined ? data.mapsEmbedUrl : undefined,
            },
        });

        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'UPDATE_PROFIL_SEKOLAH',
                    detail: `Memperbarui data profil sekolah & sambutan kepala sekolah`,
                    targetUser: 'PROFIL_SEKOLAH',
                },
            });
        }
        return updated;
    }

    // ==========================================
    // 3. ADMIN CRUD: WAKIL KEPALA SEKOLAH (WKS)
    // ==========================================

    async getWKS() {
        return this.prisma.profilWKS.findMany({ orderBy: { urutan: 'asc' } });
    }

    async createWKS(data: any, adminUser?: any) {
        if (!data.nama || !data.jabatan) {
            throw new BadRequestException('Nama dan jabatan WKS wajib diisi');
        }
        const created = await this.prisma.profilWKS.create({
            data: {
                nama: data.nama,
                jabatan: data.jabatan,
                fotoUrl: data.fotoUrl || '/avatar.png',
                urutan: Number(data.urutan) || 0,
            },
        });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'CREATE_WKS',
                    detail: `Menambahkan WKS: ${created.nama} (${created.jabatan})`,
                    targetUser: created.id,
                },
            });
        }
        return created;
    }

    async updateWKS(id: string, data: any, adminUser?: any) {
        const existing = await this.prisma.profilWKS.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Data WKS tidak ditemukan');

        const updated = await this.prisma.profilWKS.update({
            where: { id },
            data: {
                nama: data.nama ?? existing.nama,
                jabatan: data.jabatan ?? existing.jabatan,
                fotoUrl: data.fotoUrl ?? existing.fotoUrl,
                urutan: data.urutan !== undefined ? Number(data.urutan) : existing.urutan,
            },
        });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'UPDATE_WKS',
                    detail: `Memperbarui WKS: ${updated.nama}`,
                    targetUser: id,
                },
            });
        }
        return updated;
    }

    async deleteWKS(id: string, adminUser?: any) {
        const existing = await this.prisma.profilWKS.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Data WKS tidak ditemukan');

        await this.prisma.profilWKS.delete({ where: { id } });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'DELETE_WKS',
                    detail: `Menghapus WKS: ${existing.nama}`,
                    targetUser: id,
                },
            });
        }
        return { message: 'Data WKS berhasil dihapus' };
    }

    // ==========================================
    // 3.5. ADMIN CRUD: DEWAN GURU & TENAGA PENDIDIK
    // ==========================================

    async getGuru() {
        return this.prisma.guru.findMany({ orderBy: { urutan: 'asc' } });
    }

    async createGuru(data: any, adminUser?: any) {
        if (!data.nama || !data.mataPelajaran) {
            throw new BadRequestException('Nama dan Mata Pelajaran guru wajib diisi');
        }
        const created = await this.prisma.guru.create({
            data: {
                nama: data.nama,
                nip: data.nip || null,
                mataPelajaran: data.mataPelajaran,
                pendidikan: data.pendidikan || null,
                fotoUrl: data.fotoUrl || '/avatar.png',
                urutan: Number(data.urutan) || 0,
                isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
            },
        });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'CREATE_GURU',
                    detail: `Menambahkan Guru: ${created.nama} (${created.mataPelajaran})`,
                    targetUser: created.id,
                },
            });
        }
        return created;
    }

    async updateGuru(id: string, data: any, adminUser?: any) {
        const existing = await this.prisma.guru.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Data Guru tidak ditemukan');

        const updated = await this.prisma.guru.update({
            where: { id },
            data: {
                nama: data.nama ?? existing.nama,
                nip: data.nip !== undefined ? data.nip : existing.nip,
                mataPelajaran: data.mataPelajaran ?? existing.mataPelajaran,
                pendidikan: data.pendidikan !== undefined ? data.pendidikan : existing.pendidikan,
                fotoUrl: data.fotoUrl ?? existing.fotoUrl,
                urutan: data.urutan !== undefined ? Number(data.urutan) : existing.urutan,
                isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
            },
        });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'UPDATE_GURU',
                    detail: `Memperbarui Data Guru: ${updated.nama}`,
                    targetUser: id,
                },
            });
        }
        return updated;
    }

    async deleteGuru(id: string, adminUser?: any) {
        const existing = await this.prisma.guru.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Data Guru tidak ditemukan');

        await this.prisma.guru.delete({ where: { id } });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'DELETE_GURU',
                    detail: `Menghapus Data Guru: ${existing.nama}`,
                    targetUser: id,
                },
            });
        }
        return { message: 'Data Guru berhasil dihapus' };
    }

    // ==========================================
    // 4. ADMIN CRUD: PROGRAM KEAHLIAN
    // ==========================================

    async getPrograms() {
        return this.prisma.programKeahlian.findMany({ orderBy: { urutan: 'asc' } });
    }

    async createProgram(data: any, adminUser?: any) {
        if (!data.nama || !data.singkatan) {
            throw new BadRequestException('Nama dan singkatan program keahlian wajib diisi');
        }
        const created = await this.prisma.programKeahlian.create({
            data: {
                nama: data.nama,
                singkatan: data.singkatan,
                deskripsi: data.deskripsi || '',
                iconUrl: data.iconUrl || null,
                kuota: Number(data.kuota) || 72,
                urutan: Number(data.urutan) || 0,
            },
        });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'CREATE_PROGRAM_KEAHLIAN',
                    detail: `Menambahkan program keahlian: ${created.nama}`,
                    targetUser: created.id,
                },
            });
        }
        return created;
    }

    async updateProgram(id: string, data: any, adminUser?: any) {
        const existing = await this.prisma.programKeahlian.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Program keahlian tidak ditemukan');

        const updated = await this.prisma.programKeahlian.update({
            where: { id },
            data: {
                nama: data.nama ?? existing.nama,
                singkatan: data.singkatan ?? existing.singkatan,
                deskripsi: data.deskripsi ?? existing.deskripsi,
                iconUrl: data.iconUrl !== undefined ? data.iconUrl : existing.iconUrl,
                kuota: data.kuota !== undefined ? Number(data.kuota) : existing.kuota,
                urutan: data.urutan !== undefined ? Number(data.urutan) : existing.urutan,
            },
        });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'UPDATE_PROGRAM_KEAHLIAN',
                    detail: `Memperbarui program keahlian: ${updated.nama}`,
                    targetUser: id,
                },
            });
        }
        return updated;
    }

    async deleteProgram(id: string, adminUser?: any) {
        const existing = await this.prisma.programKeahlian.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Program keahlian tidak ditemukan');

        await this.prisma.programKeahlian.delete({ where: { id } });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'DELETE_PROGRAM_KEAHLIAN',
                    detail: `Menghapus program keahlian: ${existing.nama}`,
                    targetUser: id,
                },
            });
        }
        return { message: 'Program keahlian berhasil dihapus' };
    }

    // ==========================================
    // 5. ADMIN CRUD: MITRA INDUSTRI (DUDI)
    // ==========================================

    async getMitra() {
        return this.prisma.mitraIndustri.findMany({ orderBy: { urutan: 'asc' } });
    }

    async createMitra(data: any, adminUser?: any) {
        if (!data.namaPerusahaan) {
            throw new BadRequestException('Nama perusahaan mitra wajib diisi');
        }
        const created = await this.prisma.mitraIndustri.create({
            data: {
                namaPerusahaan: data.namaPerusahaan,
                logoUrl: data.logoUrl || '/logo.png',
                bidangKerjasama: data.bidangKerjasama || null,
                urutan: Number(data.urutan) || 0,
            },
        });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'CREATE_MITRA_INDUSTRI',
                    detail: `Menambahkan mitra industri: ${created.namaPerusahaan}`,
                    targetUser: created.id,
                },
            });
        }
        return created;
    }

    async updateMitra(id: string, data: any, adminUser?: any) {
        const existing = await this.prisma.mitraIndustri.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Mitra industri tidak ditemukan');

        const updated = await this.prisma.mitraIndustri.update({
            where: { id },
            data: {
                namaPerusahaan: data.namaPerusahaan ?? existing.namaPerusahaan,
                logoUrl: data.logoUrl ?? existing.logoUrl,
                bidangKerjasama: data.bidangKerjasama !== undefined ? data.bidangKerjasama : existing.bidangKerjasama,
                urutan: data.urutan !== undefined ? Number(data.urutan) : existing.urutan,
            },
        });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'UPDATE_MITRA_INDUSTRI',
                    detail: `Memperbarui mitra industri: ${updated.namaPerusahaan}`,
                    targetUser: id,
                },
            });
        }
        return updated;
    }

    async deleteMitra(id: string, adminUser?: any) {
        const existing = await this.prisma.mitraIndustri.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Mitra industri tidak ditemukan');

        await this.prisma.mitraIndustri.delete({ where: { id } });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'DELETE_MITRA_INDUSTRI',
                    detail: `Menghapus mitra industri: ${existing.namaPerusahaan}`,
                    targetUser: id,
                },
            });
        }
        return { message: 'Mitra industri berhasil dihapus' };
    }

    // ==========================================
    // 6. ADMIN CRUD: BERITA & PENGUMUMAN
    // ==========================================

    async getBerita() {
        return this.prisma.berita.findMany({ orderBy: { tanggalPublish: 'desc' } });
    }

    async createBerita(data: any, adminUser?: any) {
        if (!data.judul || !data.konten) {
            throw new BadRequestException('Judul dan konten berita wajib diisi');
        }

        const baseSlug = data.judul
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

        const created = await this.prisma.berita.create({
            data: {
                judul: data.judul,
                slug: data.slug || slug,
                ringkasan: data.ringkasan || data.konten.slice(0, 160) + '...',
                konten: data.konten,
                thumbnail: data.thumbnail || '/banner-spmb.jpg',
                kategori: data.kategori || 'Umum',
                tanggalPublish: data.tanggalPublish ? new Date(data.tanggalPublish) : new Date(),
                penulis: data.penulis || 'Humas SMK MUSKA',
            },
        });

        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'CREATE_BERITA',
                    detail: `Menulis berita: "${created.judul}"`,
                    targetUser: created.id,
                },
            });
        }
        return created;
    }

    async updateBerita(id: string, data: any, adminUser?: any) {
        const existing = await this.prisma.berita.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Berita tidak ditemukan');

        const updated = await this.prisma.berita.update({
            where: { id },
            data: {
                judul: data.judul ?? existing.judul,
                ringkasan: data.ringkasan !== undefined ? data.ringkasan : existing.ringkasan,
                konten: data.konten ?? existing.konten,
                thumbnail: data.thumbnail ?? existing.thumbnail,
                kategori: data.kategori ?? existing.kategori,
                tanggalPublish: data.tanggalPublish ? new Date(data.tanggalPublish) : existing.tanggalPublish,
                penulis: data.penulis ?? existing.penulis,
            },
        });

        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'UPDATE_BERITA',
                    detail: `Memperbarui berita: "${updated.judul}"`,
                    targetUser: id,
                },
            });
        }
        return updated;
    }

    async deleteBerita(id: string, adminUser?: any) {
        const existing = await this.prisma.berita.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Berita tidak ditemukan');

        await this.prisma.berita.delete({ where: { id } });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'DELETE_BERITA',
                    detail: `Menghapus berita: "${existing.judul}"`,
                    targetUser: id,
                },
            });
        }
        return { message: 'Berita berhasil dihapus' };
    }
}
