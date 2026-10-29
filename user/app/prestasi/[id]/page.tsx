'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Trophy,
  Award,
  Calendar,
  Share2,
  Check,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  User,
  Medal,
} from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ChatbotRAG from '@/components/ChatbotRAG';
import { API_ENDPOINTS } from '@/lib/api';

interface PrestasiDetail {
  id: string;
  judul: string;
  namaPeserta: string;
  namaLomba?: string | null;
  tingkat?: string | null;
  kategoriJuara?: string | null;
  fotoUrl?: string | null;
  deskripsi?: string | null;
  tanggal: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function PrestasiDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [prestasi, setPrestasi] = useState<PrestasiDetail | null>(null);
  const [otherPrestasi, setOtherPrestasi] = useState<PrestasiDetail[]>([]);
  const [profil, setProfil] = useState<any>({});
  const [loading, setLoading] = useState(true);
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
    const fetchPrestasiData = async () => {
      try {
        setLoading(true);

        // 1. Ambil detail via endpoint spesifik prestasi jika ada
        let currentItem: PrestasiDetail | null = null;
        try {
          const resDetail = await fetch(API_ENDPOINTS.PRESTASI.DETAIL(id));
          if (resDetail.ok) {
            currentItem = await resDetail.json();
          }
        } catch {
          // fallback
        }

        // 2. Ambil data landing page
        const resLanding = await fetch(API_ENDPOINTS.LANDING_PAGE);
        if (resLanding.ok) {
          const landingData = await resLanding.json();
          setProfil(landingData.profil || {});
          const allPrestasi: PrestasiDetail[] = landingData.prestasi || [];

          if (!currentItem && allPrestasi.length > 0) {
            currentItem = allPrestasi.find((p) => p.id === id) || null;
          }

          const others = allPrestasi.filter((p) => p.id !== id);
          setOtherPrestasi(others.slice(0, 3));
        }

        setPrestasi(currentItem);
      } catch (err) {
        console.error('Gagal mengambil data prestasi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestasiData();
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = window.location.href;
      const shareText = `Prestasi Siswa SMK MUSKA: ${prestasi?.judul} - ${prestasi?.namaPeserta} (${prestasi?.kategoriJuara || 'JUARA'})\n${shareUrl}`;

      if (navigator.share) {
        navigator.share({
          title: prestasi?.judul || 'Prestasi SMK MUSKA',
          text: shareText,
          url: shareUrl,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const dateStr = prestasi?.tanggal
    ? new Date(prestasi.tanggal).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased flex flex-col justify-between">
      <div>
        {/* HEADER */}
        <LandingHeader activeMenu="prestasi" isHome={false} profil={profil} />

        <main className="pt-28 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-emerald-600 transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/prestasi" className="hover:text-emerald-600 transition-colors">
                Prestasi Siswa
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[180px] sm:max-w-xs">
                {prestasi?.judul || 'Detail Prestasi'}
              </span>
            </nav>

            {loading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4"></div>
                <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
                <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
              </div>
            ) : !prestasi ? (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Data Prestasi Tidak Ditemukan</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Data prestasi yang Anda cari mungkin telah diperbarui atau dipindahkan oleh pihak sekolah.
                </p>
                <Link
                  href="/prestasi"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Daftar Prestasi</span>
                </Link>
              </div>
            ) : (
              <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-8">
                {/* HERO CARD DETAIL PRESTASI */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                  {/* Top Header: Badge & Share Button */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                        <Trophy className="w-4 h-4 fill-current" />
                        <span>{prestasi.kategoriJuara || 'JUARA'}</span>
                      </span>
                      {prestasi.tingkat && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Tingkat {prestasi.tingkat}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition shadow-2xs cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Tautan Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Bagikan Prestasi</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {prestasi.judul}
                  </h1>

                  {/* Foto Prestasi */}
                  <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
                    <img
                      src={getFullUrl(prestasi.fotoUrl, '/banner-spmb.jpg')}
                      alt={prestasi.judul}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/banner-spmb.jpg';
                      }}
                    />
                  </div>

                  {/* Meta Key Info Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Peserta / Juara
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {prestasi.namaPeserta}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Medal className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Event / Perlombaan
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {prestasi.namaLomba || 'Kompetisi Sekolah / Umum'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Tanggal Capaian
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {dateStr}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Full Description */}
                  {prestasi.deskripsi && (
                    <div className="space-y-3 pt-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        Keterangan & Catatan Prestasi
                      </h3>
                      <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                        {prestasi.deskripsi}
                      </div>
                    </div>
                  )}
                </div>

                {/* PRESTASI LAINNYA */}
                {otherPrestasi.length > 0 && (
                  <div className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Prestasi Membanggakan Lainnya
                      </h3>
                      <Link
                        href="/prestasi"
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <span>Lihat Semua Prestasi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {otherPrestasi.map((other) => (
                        <Link
                          key={other.id}
                          href={`/prestasi/${other.id}`}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-3xl overflow-hidden shadow-xs transition group flex flex-col justify-between"
                        >
                          <div className="relative h-40 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                            <img
                              src={getFullUrl(other.fotoUrl, '/banner-spmb.jpg')}
                              alt={other.judul}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-500 text-white flex items-center gap-1">
                              <Trophy className="w-3 h-3 fill-current" />
                              {other.kategoriJuara || 'JUARA'}
                            </span>
                          </div>
                          <div className="p-4 space-y-1.5">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 transition-colors">
                              {other.judul}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {other.namaPeserta} {other.tingkat ? `(${other.tingkat})` : ''}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <ChatbotRAG />
      <LandingFooter profil={profil} />
    </div>
  );
}
