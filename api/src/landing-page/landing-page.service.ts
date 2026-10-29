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

        const [sliders, profil, wks, guru, programKeahlian, mitraIndustri, berita, agenda, prestasi, galeri, systemSettings] = await Promise.all([
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
            this.prisma.agendaSekolah.findMany({
                where: { isActive: true },
                orderBy: { tanggal: 'asc' },
                take: 8,
            }),
            this.prisma.prestasiSiswa.findMany({
                orderBy: [{ urutan: 'asc' }, { tanggal: 'desc' }],
                take: 12,
            }),
            this.prisma.galeriSekolah.findMany({
                orderBy: [{ urutan: 'asc' }, { tanggal: 'desc' }],
                take: 12,
            }),
            this.prisma.systemSetting.findMany(),
        ]);

        const settingsMap: Record<string, string> = {};
        systemSettings.forEach((s) => {
            settingsMap[s.key] = s.value;
        });

        const settings = {
            tahunAjaran: settingsMap['tahunAjaran'] || '2026/2027',
            bukaPendaftaran: settingsMap['bukaPendaftaran'] !== 'false',
            pengumumanDibuka: settingsMap['pengumumanDibuka'] === 'true',
            tanggalPengumuman: settingsMap['tanggalPengumuman'] || '2026-06-01T10:00:00',
        };

        return {
            sliders,
            profil,
            wks,
            guru,
            programKeahlian,
            mitraIndustri,
            berita,
            agenda,
            prestasi,
            galeri,
            settings,
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

        const agendaCount = await this.prisma.agendaSekolah.count();
        if (agendaCount === 0) {
            await this.prisma.agendaSekolah.createMany({
                data: [
                    {
                        judul: 'Sosialisasi & Pendaftaran Jalur Prestasi SPMB TA 2026/2027',
                        tanggal: new Date(Date.now() + 86400000 * 5),
                        waktu: '08:00 - 11:30 WIB',
                        lokasi: 'Aula Utama KH. Ahmad Dahlan SMK MUSKA',
                        kategori: 'SPMB',
                        deskripsi: 'Pemberian informasi teknis pendaftaran online, kuota beasiswa prestasi, serta demo sistem AI OCR berkas pendaftaran bagi calon wali murid.',
                        isActive: true,
                        urutan: 1,
                    },
                    {
                        judul: 'Uji Kompetensi Keahlian (UKK) & Sertifikasi LSP-P1 Siswa Kelas XII',
                        tanggal: new Date(Date.now() + 86400000 * 12),
                        waktu: '07:30 - 15:30 WIB',
                        lokasi: 'Bengkel Teknik & Laboratorium Komputer Terpadu',
                        kategori: 'Akademik',
                        deskripsi: 'Pelaksanaan asesmen kompetensi kerja riil berstandar BNSP yang diuji langsung oleh instruktur industri mitra terpercaya.',
                        isActive: true,
                        urutan: 2,
                    },
                    {
                        judul: 'Peringatan Milad Muhammadiyah & Pagelaran Seni Budaya Pelajar',
                        tanggal: new Date(Date.now() + 86400000 * 20),
                        waktu: '08:00 - 16:00 WIB',
                        lokasi: 'Lapangan Kampus SMK Muhammadiyah Sekampung',
                        kategori: 'Kesiswaan',
                        deskripsi: 'Ajang kreasi bakat siswa, pawai taaruf, atraksi Tapak Suci Putera Muhammadiyah, serta pameran karya vokasi kewirausahaan.',
                        isActive: true,
                        urutan: 3,
                    },
                    {
                        judul: 'Kunjungan Industri & Kuliah Umum Bersama PT Astra Honda Motor',
                        tanggal: new Date(Date.now() + 86400000 * 28),
                        waktu: '09:00 - 13:00 WIB',
                        lokasi: 'Studio Audio Visual & Bengkel TBSM',
                        kategori: 'Umum',
                        deskripsi: 'Bedah kurikulum teknologi sepeda motor injeksi terkini dan peluang karier langsung pasca lulus bagi siswa SMK MUSKA.',
                        isActive: true,
                        urutan: 4,
                    },
                ],
            });
        }

        const prestasiCount = await this.prisma.prestasiSiswa.count();
        if (prestasiCount === 0) {
            await this.prisma.prestasiSiswa.createMany({
                data: [
                    {
                        judul: 'E-Sport Mobile Legends Pelajar Se-Sumbagsel',
                        kategoriJuara: 'JUARA',
                        namaPeserta: 'GPS E-SPORT · Kelas 10 TJKT, 11 TJKT, 12 PPLG',
                        namaLomba: 'OlympicAD 2026 Cabang E-Sport',
                        tingkat: 'Regional',
                        fotoUrl: '/banner-spmb.jpg',
                        deskripsi: 'Meraih Juara 1 Turnamen E-Sport kategori pelajar tingkat Sumatera Bagian Selatan.',
                        urutan: 1,
                    },
                    {
                        judul: 'Lomba Cerdas Tangkas Kepanduan Hizbul Wathan',
                        kategoriJuara: 'JUARA',
                        namaPeserta: 'Kafilah Qobilah HW SMK MUSKA',
                        namaLomba: 'Kemah Cerdas Tangkas Kepanduan Kedu & Sumbagsel',
                        tingkat: 'Provinsi',
                        fotoUrl: '/berita-lks.jpg',
                        deskripsi: 'Meraih Juara Umum dalam rangkaian lomba navigasi darat, sandi morse, dan kepemimpinan Islam.',
                        urutan: 2,
                    },
                    {
                        judul: 'Lomba Film Pendek & Sinematografi "Cahaya Hati"',
                        kategoriJuara: 'JUARA',
                        namaPeserta: 'Tim Sinema DKV · Kelas 10 PPLG & 11 DKV',
                        namaLomba: 'Festival Film Jumbara PMI & Kominfo Kabupaten',
                        tingkat: 'Kabupaten',
                        fotoUrl: '/berita-mou.jpg',
                        deskripsi: 'Karya audio visual bertema solidaritas kemanusiaan dan kepedulian sosial di masa digital.',
                        urutan: 3,
                    },
                    {
                        judul: 'Lomba Seni Kaligrafi Islam OlympicAD Tingkat Nasional',
                        kategoriJuara: 'JUARA',
                        namaPeserta: 'Thalita Nur Azizah · Kelas 11 Pemasaran',
                        namaLomba: 'OlympicAD Nasional Perguruan Muhammadiyah',
                        tingkat: 'Nasional',
                        fotoUrl: '/kepsek.jpg',
                        deskripsi: 'Menyabet medali emas cabang kaligrafi kontemporer tingkat pelajar nasional.',
                        urutan: 4,
                    },
                ],
            });
        }

        const galeriCount = await this.prisma.galeriSekolah.count();
        if (galeriCount === 0) {
            await this.prisma.galeriSekolah.createMany({
                data: [
                    {
                        judul: 'Gelar Karya Vokasi & Expo Jurusan SMK MUSKA',
                        slug: 'gelar-karya-vokasi-expo-jurusan-smk-muska',
                        kategori: 'Kegiatan',
                        deskripsi: 'Dokumentasi semarak pameran hasil inovasi dan teknologi karya siswa dari 8 program keahlian SMK Muhammadiyah Sekampung.',
                        thumbnail: '/banner-spmb.jpg',
                        fotoUrls: ['/banner-spmb.jpg', '/berita-lks.jpg', '/berita-mou.jpg', '/kepsek.jpg'],
                        urutan: 1,
                    },
                    {
                        judul: 'Praktik Industri Bengkel Otomotif & Lab Komputer Modern',
                        slug: 'praktik-industri-bengkel-otomotif-lab-komputer',
                        kategori: 'Pembelajaran',
                        deskripsi: 'Suasana pembelajaran vokasi berbasis praktik nyata pada laboratorium komputer terpadu dan bengkel standar ATPM.',
                        thumbnail: '/berita-lks.jpg',
                        fotoUrls: ['/berita-lks.jpg', '/banner-spmb.jpg', '/berita-mou.jpg'],
                        urutan: 2,
                    },
                    {
                        judul: 'Peringatan Milad Muhammadiyah & Bakti Sosial Pelajar',
                        slug: 'peringatan-milad-muhammadiyah-bakti-sosial',
                        kategori: 'Kesiswaan',
                        deskripsi: 'Aksi nyata pengabdian masyarakat, donor darah, santunan, dan unjuk kreativitas siswa-siswi IPM dan HW.',
                        thumbnail: '/berita-mou.jpg',
                        fotoUrls: ['/berita-mou.jpg', '/banner-spmb.jpg', '/berita-lks.jpg'],
                        urutan: 3,
                    },
                ],
            });
        }
    }

    async getPublicBerita() {
        await this.ensureInitialSeed();
        return this.prisma.berita.findMany({
            orderBy: { tanggalPublish: 'desc' },
        });
    }

    async getPublicBeritaBySlugOrId(slugOrId: string) {
        await this.ensureInitialSeed();
        const berita = await this.prisma.berita.findFirst({
            where: {
                OR: [
                    { slug: slugOrId },
                    { id: slugOrId },
                ],
            },
        });
        if (!berita) {
            throw new NotFoundException(`Berita dengan slug atau id "${slugOrId}" tidak ditemukan`);
        }
        return berita;
    }

    async getPublicPrograms() {
        await this.ensureInitialSeed();
        return this.prisma.programKeahlian.findMany({
            orderBy: { urutan: 'asc' },
        });
    }

    async getPublicProgramByIdOrSlug(idOrSlug: string) {
        await this.ensureInitialSeed();
        // Coba cari langsung by ID
        let program = await this.prisma.programKeahlian.findUnique({
            where: { id: idOrSlug },
        }).catch(() => null);

        // Jika tidak ketemu by UUID, cari by singkatan atau slug nama
        if (!program) {
            const all = await this.prisma.programKeahlian.findMany();
            const cleanTarget = idOrSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
            program = all.find((p) => {
                const cleanSingkatan = p.singkatan.toLowerCase().replace(/[^a-z0-9]/g, '');
                const cleanNama = p.nama.toLowerCase().replace(/[^a-z0-9]/g, '');
                return p.id === idOrSlug || cleanSingkatan === cleanTarget || cleanNama === cleanTarget;
            }) || null;
        }

        if (!program) {
            throw new NotFoundException(`Program Keahlian "${idOrSlug}" tidak ditemukan`);
        }
        return program;
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
                logoUrl: data.logoUrl || '/logo.png',
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
                logoUrl: data.logoUrl !== undefined ? data.logoUrl : undefined,
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
                fotoUrls: Array.isArray(data.fotoUrls) ? data.fotoUrls.slice(0, 5) : [],
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
                fotoUrls: Array.isArray(data.fotoUrls) ? data.fotoUrls.slice(0, 5) : existing.fotoUrls,
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

    // ==========================================
    // 7. AGENDA SEKOLAH
    // ==========================================

    async getAgenda() {
        await this.ensureInitialSeed();
        return this.prisma.agendaSekolah.findMany({
            orderBy: [{ tanggal: 'asc' }, { urutan: 'asc' }],
        });
    }

    async getAgendaById(id: string) {
        await this.ensureInitialSeed();
        const agenda = await this.prisma.agendaSekolah.findUnique({ where: { id } });
        if (!agenda) throw new NotFoundException('Agenda tidak ditemukan');
        return agenda;
    }

    async createAgenda(data: any, adminUser?: any) {
        if (!data.judul || !data.tanggal) {
            throw new BadRequestException('Judul dan tanggal agenda wajib diisi');
        }

        const created = await this.prisma.agendaSekolah.create({
            data: {
                judul: data.judul,
                tanggal: new Date(data.tanggal),
                waktu: data.waktu || null,
                lokasi: data.lokasi || null,
                kategori: data.kategori || 'Umum',
                deskripsi: data.deskripsi || null,
                isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
                urutan: data.urutan ? Number(data.urutan) : 0,
            },
        });

        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'CREATE_AGENDA',
                    detail: `Membuat agenda sekolah: "${created.judul}"`,
                    targetUser: created.id,
                },
            });
        }
        return created;
    }

    async updateAgenda(id: string, data: any, adminUser?: any) {
        const existing = await this.prisma.agendaSekolah.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Agenda tidak ditemukan');

        const updated = await this.prisma.agendaSekolah.update({
            where: { id },
            data: {
                judul: data.judul ?? existing.judul,
                tanggal: data.tanggal ? new Date(data.tanggal) : existing.tanggal,
                waktu: data.waktu !== undefined ? data.waktu : existing.waktu,
                lokasi: data.lokasi !== undefined ? data.lokasi : existing.lokasi,
                kategori: data.kategori ?? existing.kategori,
                deskripsi: data.deskripsi !== undefined ? data.deskripsi : existing.deskripsi,
                isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
                urutan: data.urutan !== undefined ? Number(data.urutan) : existing.urutan,
            },
        });

        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'UPDATE_AGENDA',
                    detail: `Memperbarui agenda: "${updated.judul}"`,
                    targetUser: id,
                },
            });
        }
        return updated;
    }

    async deleteAgenda(id: string, adminUser?: any) {
        const existing = await this.prisma.agendaSekolah.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Agenda tidak ditemukan');

        await this.prisma.agendaSekolah.delete({ where: { id } });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'DELETE_AGENDA',
                    detail: `Menghapus agenda: "${existing.judul}"`,
                    targetUser: id,
                },
            });
        }
        return { message: 'Agenda berhasil dihapus' };
    }

    // ==========================================
    // 8. PRESTASI SISWA
    // ==========================================

    async getPrestasi() {
        await this.ensureInitialSeed();
        return this.prisma.prestasiSiswa.findMany({
            orderBy: [{ urutan: 'asc' }, { tanggal: 'desc' }],
        });
    }

    async getPrestasiById(id: string) {
        await this.ensureInitialSeed();
        const prestasi = await this.prisma.prestasiSiswa.findUnique({ where: { id } });
        if (!prestasi) throw new NotFoundException('Prestasi tidak ditemukan');
        return prestasi;
    }

    async createPrestasi(data: any, adminUser?: any) {
        if (!data.judul || !data.namaPeserta || !data.fotoUrl) {
            throw new BadRequestException('Judul, nama peserta, dan foto dokumentasi wajib diisi');
        }

        const created = await this.prisma.prestasiSiswa.create({
            data: {
                judul: data.judul,
                kategoriJuara: data.kategoriJuara || 'JUARA',
                namaPeserta: data.namaPeserta,
                namaLomba: data.namaLomba || null,
                tingkat: data.tingkat || 'Kabupaten',
                fotoUrl: data.fotoUrl,
                deskripsi: data.deskripsi || null,
                tanggal: data.tanggal ? new Date(data.tanggal) : new Date(),
                urutan: data.urutan ? Number(data.urutan) : 0,
            },
        });

        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'CREATE_PRESTASI',
                    detail: `Menambahkan prestasi siswa: "${created.judul}"`,
                    targetUser: created.id,
                },
            });
        }
        return created;
    }

    async updatePrestasi(id: string, data: any, adminUser?: any) {
        const existing = await this.prisma.prestasiSiswa.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Prestasi siswa tidak ditemukan');

        const updated = await this.prisma.prestasiSiswa.update({
            where: { id },
            data: {
                judul: data.judul ?? existing.judul,
                kategoriJuara: data.kategoriJuara ?? existing.kategoriJuara,
                namaPeserta: data.namaPeserta ?? existing.namaPeserta,
                namaLomba: data.namaLomba !== undefined ? data.namaLomba : existing.namaLomba,
                tingkat: data.tingkat ?? existing.tingkat,
                fotoUrl: data.fotoUrl ?? existing.fotoUrl,
                deskripsi: data.deskripsi !== undefined ? data.deskripsi : existing.deskripsi,
                tanggal: data.tanggal ? new Date(data.tanggal) : existing.tanggal,
                urutan: data.urutan !== undefined ? Number(data.urutan) : existing.urutan,
            },
        });

        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'UPDATE_PRESTASI',
                    detail: `Memperbarui prestasi siswa: "${updated.judul}"`,
                    targetUser: id,
                },
            });
        }
        return updated;
    }

    async deletePrestasi(id: string, adminUser?: any) {
        const existing = await this.prisma.prestasiSiswa.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Prestasi siswa tidak ditemukan');

        await this.prisma.prestasiSiswa.delete({ where: { id } });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'DELETE_PRESTASI',
                    detail: `Menghapus prestasi siswa: "${existing.judul}"`,
                    targetUser: id,
                },
            });
        }
        return { message: 'Prestasi berhasil dihapus' };
    }

    // ==========================================
    // 9. GALERI SEKOLAH
    // ==========================================

    async getGaleri() {
        await this.ensureInitialSeed();
        return this.prisma.galeriSekolah.findMany({
            orderBy: [{ urutan: 'asc' }, { tanggal: 'desc' }],
        });
    }

    async getPublicGaleri() {
        return this.getGaleri();
    }

    async getPublicGaleriBySlugOrId(slugOrId: string) {
        await this.ensureInitialSeed();
        const galeri = await this.prisma.galeriSekolah.findFirst({
            where: {
                OR: [{ slug: slugOrId }, { id: slugOrId }],
            },
        });
        if (!galeri) {
            throw new NotFoundException(`Galeri "${slugOrId}" tidak ditemukan`);
        }
        return galeri;
    }

    async createGaleri(data: any, adminUser?: any) {
        if (!data.judul || !data.thumbnail) {
            throw new BadRequestException('Judul dan thumbnail sampul album wajib diisi');
        }

        let baseSlug = (data.slug || data.judul)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        if (!baseSlug) baseSlug = 'galeri-' + Date.now();

        let finalSlug = baseSlug;
        let counter = 1;
        while (await this.prisma.galeriSekolah.findUnique({ where: { slug: finalSlug } })) {
            finalSlug = `${baseSlug}-${counter}`;
            counter++;
        }

        const created = await this.prisma.galeriSekolah.create({
            data: {
                judul: data.judul,
                slug: finalSlug,
                kategori: data.kategori || 'Kegiatan',
                deskripsi: data.deskripsi || null,
                thumbnail: data.thumbnail,
                fotoUrls: Array.isArray(data.fotoUrls) ? data.fotoUrls : [],
                tanggal: data.tanggal ? new Date(data.tanggal) : new Date(),
                urutan: data.urutan ? Number(data.urutan) : 0,
            },
        });

        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'CREATE_GALERI',
                    detail: `Membuat album galeri foto: "${created.judul}"`,
                    targetUser: created.id,
                },
            });
        }
        return created;
    }

    async updateGaleri(id: string, data: any, adminUser?: any) {
        const existing = await this.prisma.galeriSekolah.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Album galeri tidak ditemukan');

        let finalSlug = existing.slug;
        if (data.slug && data.slug !== existing.slug) {
            const cleanSlug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const check = await this.prisma.galeriSekolah.findUnique({ where: { slug: cleanSlug } });
            if (check && check.id !== id) {
                finalSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
            } else {
                finalSlug = cleanSlug;
            }
        }

        const updated = await this.prisma.galeriSekolah.update({
            where: { id },
            data: {
                judul: data.judul ?? existing.judul,
                slug: finalSlug,
                kategori: data.kategori ?? existing.kategori,
                deskripsi: data.deskripsi !== undefined ? data.deskripsi : existing.deskripsi,
                thumbnail: data.thumbnail ?? existing.thumbnail,
                fotoUrls: Array.isArray(data.fotoUrls) ? data.fotoUrls : existing.fotoUrls,
                tanggal: data.tanggal ? new Date(data.tanggal) : existing.tanggal,
                urutan: data.urutan !== undefined ? Number(data.urutan) : existing.urutan,
            },
        });

        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'UPDATE_GALERI',
                    detail: `Memperbarui album galeri: "${updated.judul}"`,
                    targetUser: id,
                },
            });
        }
        return updated;
    }

    async deleteGaleri(id: string, adminUser?: any) {
        const existing = await this.prisma.galeriSekolah.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Album galeri tidak ditemukan');

        await this.prisma.galeriSekolah.delete({ where: { id } });
        if (adminUser) {
            await this.prisma.auditLog.create({
                data: {
                    adminId: adminUser.sub,
                    adminNama: adminUser.email,
                    aksi: 'DELETE_GALERI',
                    detail: `Menghapus album galeri: "${existing.judul}"`,
                    targetUser: id,
                },
            });
        }
        return { message: 'Album galeri berhasil dihapus' };
    }
}
