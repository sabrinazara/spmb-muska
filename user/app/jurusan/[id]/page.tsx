'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Award,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Users,
  Briefcase,
  GraduationCap,
  Building2,
  Image as ImageIcon,
  HelpCircle,
  Phone,
} from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ChatbotRAG from '@/components/ChatbotRAG';
import { API_ENDPOINTS } from '@/lib/api';

interface ProgramDetail {
  id: string;
  nama: string;
  singkatan: string;
  deskripsi: string;
  iconUrl?: string | null;
  fotoUrls?: string[];
  kuota: number;
  urutan?: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const getProspectList = (singkatan: string) => {
  const s = (singkatan || '').toUpperCase();
  if (s.includes('TJKT') || s.includes('TKJ')) {
    return [
      'Network Administrator & Engineer',
      'Fiber Optic Technician',
      'Cloud & Server Administrator',
      'IT Support & Cybersecurity Specialist',
    ];
  }
  if (s.includes('TBSM') || s.includes('TSM') || s.includes('OTOMOTIF')) {
    return [
      'Teknisi Bengkel Resmi Sepeda Motor',
      'Service Advisor & Quality Control',
      'Wirausaha Bengkel Motor & Modifikasi',
      'Operator Industri Manufaktur Otomotif',
    ];
  }
  if (s.includes('DKV')) {
    return [
      'Graphic Designer & Illustrator',
      'UI/UX & Web Interface Designer',
      'Video Editor & Motion Graphic Artist',
      'Creative Content Creator & Photographer',
    ];
  }
  if (s.includes('BDK') || s.includes('BISNIS')) {
    return [
      'Digital Marketing Strategist',
      'Social Media & E-Commerce Specialist',
      'Content Marketing & Copywriter',
      'Wirausaha Digital & Retail Manager',
    ];
  }
  if (s.includes('BOGA') || s.includes('KULINERI')) {
    return [
      'Chef / Cook di Restoran & Hotel',
      'Pastry & Bakery Specialist',
      'Food Stylist & Barista Professional',
      'Wirausaha Kuliner & Catering Service',
    ];
  }
  if (s.includes('RIAS') || s.includes('KECANTIKAN')) {
    return [
      'Professional Make-up Artist (MUA)',
      'Beauty Therapist & Skincare Consultant',
      'Hairstylist & Bridal Specialist',
      'Wirausaha Salon & Studio Kecantikan',
    ];
  }
  if (s.includes('CNC') || s.includes('MESIN')) {
    return [
      'Operator & Programmer Mesin CNC',
      'Drafter CAD/CAM Manufaktur',
      'Teknisi Pemeliharaan Mesin Industri',
      'Quality Control Komponen Presisi',
    ];
  }
  if (s.includes('LAS') || s.includes('WELDING')) {
    return [
      'Welder Bersertifikat SMAW/GMAW/GTAW',
      'Inspector Fabrikasi Konstruksi Baja',
      'Teknisi Pengelasan Industri Perkapalan & Alat Berat',
      'Wirausaha Bengkel Fabrikasi Logam',
    ];
  }
  return [
    'Tenaga Ahli Profesional Bidang Keahlian',
    'Teknisi Bersertifikat Standar Industri',
    'Wirausaha Mandiri Berdaya Saing',
    'Melanjutkan ke Perguruan Tinggi Vokasi',
  ];
};

export default function JurusanDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const idOrSlug = resolvedParams.id;

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [allPrograms, setAllPrograms] = useState<ProgramDetail[]>([]);
  const [profil, setProfil] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const getFullUrl = (url: string | null | undefined, fallback: string = '/banner-spmb.jpg') => {
    if (!url) return fallback;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
    if (url.startsWith('/uploads/')) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      return `${apiBase}${url}`;
    }
    return url;
  };

  useEffect(() => {
    const fetchJurusanData = async () => {
      try {
        setLoading(true);

        // 1. Ambil data publik landing page untuk seluruh jurusan & profil footer
        let matchedProgram: ProgramDetail | null = null;
        try {
          const resLanding = await fetch(API_ENDPOINTS.LANDING_PAGE);
          if (resLanding.ok) {
            const landingData = await resLanding.json();
            setProfil(landingData.profil || {});
            const programs: ProgramDetail[] = landingData.programKeahlian || [];
            setAllPrograms(programs);

            // Cari program yang cocok berdasarkan id, singkatan, atau nama
            const cleanTarget = decodeURIComponent(idOrSlug).toLowerCase().replace(/[^a-z0-9]/g, '');
            matchedProgram =
              programs.find((p) => {
                const cleanId = p.id.toLowerCase();
                const cleanSingkatan = (p.singkatan || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                const cleanNama = (p.nama || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                return p.id === idOrSlug || cleanId === cleanTarget || cleanSingkatan === cleanTarget || cleanNama === cleanTarget;
              }) || null;
          }
        } catch (err) {
          console.error('Gagal mengambil data dari landing page:', err);
        }

        // 2. Jika belum ditemukan, coba ambil langsung via endpoint detail jurusan
        if (!matchedProgram) {
          try {
            const resDetail = await fetch(API_ENDPOINTS.JURUSAN.DETAIL(idOrSlug));
            if (resDetail.ok) {
              matchedProgram = await resDetail.json();
            }
          } catch {
            // fallback
          }
        }

        setProgram(matchedProgram);
        setActivePhotoIdx(0);
      } catch (err) {
        console.error('Gagal memuat detail program keahlian:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJurusanData();
  }, [idOrSlug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const photos: string[] = program && Array.isArray(program.fotoUrls) ? program.fotoUrls.filter(Boolean) : [];
  const otherPrograms = allPrograms.filter((p) => p.id !== program?.id);
  const prospectItems = program ? getProspectList(program.singkatan) : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* HEADER */}
        <LandingHeader activeMenu="jurusan" isHome={false} />

        {/* HERO TITLE & BREADCRUMB */}
        <div id="jurusan-hero" className="py-8 sm:py-12 bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-4">
            <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/jurusan" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Program Keahlian
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-xs sm:max-w-md">
                {program?.nama || idOrSlug}
              </span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {/* <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    {program?.singkatan || 'SMK PK'}
                  </span> */}
                  {/* <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Daya Tampung: {program?.kuota || 72} Siswa</span>
                  </span> */}
                  {/* {photos.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{photos.length} Foto Dokumentasi</span>
                    </span>
                  )} */}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {program ? program.nama : 'Memuat Profil Jurusan...'}
                </h1>
              </div>

              {/* Share & Register Fast Action */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold flex items-center gap-1.5 transition text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-2xs cursor-pointer"
                  title="Salin Tautan Halaman"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Tersalin' : 'Bagikan'}</span>
                </button>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition"
                >
                  <span>Daftar Jurusan Ini</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT & SIDEBAR */}
        <div id="jurusan-content" className="py-10 max-w-7xl mx-auto px-4 sm:px-8">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Memuat rincian kejuruan...</p>
            </div>
          ) : !program ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 max-w-lg mx-auto">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Program Keahlian Tidak Ditemukan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Jurusan yang Anda cari mungkin belum diinput atau tautan telah kedaluwarsa.
              </p>
              <Link
                href="/jurusan"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Jurusan</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* KOLOM UTAMA (COL-SPAN-8) */}
              <div className="lg:col-span-8 space-y-8">
                {/* 1. GALERI FOTO KEGIATAN & FASILITAS JURUSAN (MAKSIMAL 5 FOTO) */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          Dokumentasi Kegiatan {program.singkatan}
                        </h2>
                        <p className="text-xs text-slate-400">
                          {photos.length > 0
                            ? `Dokumentasi fasilitas dan praktikum kejuruan (${photos.length} Foto)`
                            : 'Fasilitas dan praktikum berstandar industri'}
                        </p>
                      </div>
                    </div>
                    {/* {photos.length > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        Foto {activePhotoIdx + 1} dari {photos.length}
                      </span>
                    )} */}
                  </div>

                  {photos.length > 0 ? (
                    <div className="space-y-3">
                      {/* TAMPILAN FOTO UTAMA */}
                      <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group shadow-inner">
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={photos[activePhotoIdx] || activePhotoIdx}
                            src={getFullUrl(photos[activePhotoIdx])}
                            alt={`${program.nama} - Foto ${activePhotoIdx + 1}`}
                            initial={{ opacity: 0, scale: 1.03 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/banner-spmb.jpg';
                            }}
                          />
                        </AnimatePresence>

                        {/* Chevrons navigasi */}
                        {photos.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center transition cursor-pointer border border-white/20 shadow-lg"
                              title="Foto Sebelumnya"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center transition cursor-pointer border border-white/20 shadow-lg"
                              title="Foto Selanjutnya"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* THUMBNAIL STRIP */}
                      {photos.length > 1 && (
                        <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                          {photos.map((foto, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActivePhotoIdx(idx)}
                              className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${activePhotoIdx === idx
                                ? 'border-emerald-500 ring-2 ring-emerald-500/40 scale-105 shadow-md'
                                : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                                }`}
                            >
                              <img
                                src={getFullUrl(foto)}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Default Fallback Banner jika belum ada upload foto */
                    <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-800 to-slate-900 flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 flex items-center justify-center">
                        <GraduationCap className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div className="max-w-md">
                        <h3 className="font-bold text-base sm:text-lg">{program.nama}</h3>
                        <p className="text-xs text-emerald-200/80 mt-1">
                          Kurikulum berbasis Teaching Factory & Link and Match Dunia Industri
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. DESKRIPSI & PROFIL PROGRAM */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Tentang Program Keahlian
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                      Profil & Kompetensi {program.nama}
                    </h2>
                  </div>

                  <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-100 dark:border-slate-800 pt-4">
                    {program.deskripsi}
                  </div>

                  {/* Highlights Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-xs text-slate-400">Jenjang Pendidikan</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">SMK (3 Tahun)</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-xs text-slate-400">Daya Tampung Kursi</div>
                      <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                        {program.kuota} Siswa Baru
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-xs text-slate-400">Model Pembelajaran</div>
                      <div className="font-bold text-sm text-amber-600 dark:text-amber-400">
                        Teaching Factory (TEFA)
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. PROSPEK KARIER & PELUANG KERJA LULUSAN */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        Peluang Kerja & Prospek Karier Lulusan
                      </h3>
                      <p className="text-xs text-slate-500">
                        Lulusan siap bekerja di industri terkemuka, berwirausaha mandiri, atau melanjutkan kuliah
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {prospectItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. BANNER AJAKAN PENDAFTARAN */}
                <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-600/30">
                  <div className="space-y-2 text-center sm:text-left">
                    {/* <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md">
                      Penerimaan Siswa Baru
                    </span> */}
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                      Siap Bergabung dengan {program.singkatan}?
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100/90 max-w-lg leading-relaxed">
                      Kuota terbatas {program.kuota} kursi. Manfaatkan kemudahan pendaftaran online dari sistem kami.
                    </p>
                  </div>
                  <Link
                    href="/register"
                    className="px-6 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition shrink-0"
                  >
                    Daftar Sekarang
                  </Link>
                </div>
              </div>

              {/* KOLOM SIDEBAR (COL-SPAN-4) */}
              <div className="lg:col-span-4 space-y-6">
                {/* 1. DAFTAR PROGRAM KEAHLIAN LAINNYA */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Jurusan Lainnya
                    </h3>
                    <Link
                      href="/jurusan"
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Lihat Semua
                    </Link>
                  </div>

                  <div className="space-y-2.5">
                    {otherPrograms.map((op) => (
                      <Link
                        key={op.id}
                        href={`/jurusan/${op.id}`}
                        className="group flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center shrink-0 group-hover:border-emerald-500 transition">
                            <img
                              src={getFullUrl(
                                op.iconUrl ||
                                `/jurusan/${(op.singkatan || '').toLowerCase().replace(/[^a-z]/g, '')}.svg`,
                                '/logo.png'
                              )}
                              alt={op.singkatan}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = '/logo.png';
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                              {op.singkatan}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                              {op.nama}
                            </h4>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 3. BANTUAN & KONSULTASI JURUSAN */}
                <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Butuh Konsultasi Jurusan?</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Masih ragu memilih kejuruan yang tepat? Anda dapat bertanya langsung melalui asisten cerdas AI kami atau menghubungi panitia SPMB.
                  </p>
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Hubungi admin SPMB (+62)813 7765 3555</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <LandingFooter profil={profil} />

      {/* CHATBOT AI WIDGET */}
      <ChatbotRAG />
    </div>
  );
}
