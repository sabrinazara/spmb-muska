'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Calendar,
  User,
  Tag,
  Eye,
  Share2,
  Check,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Building2,
  Clock,
  Sparkles,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ChatbotRAG from '@/components/ChatbotRAG';
import { API_ENDPOINTS } from '@/lib/api';

interface BeritaDetail {
  id: string;
  judul: string;
  slug: string;
  ringkasan?: string | null;
  konten: string;
  thumbnail: string;
  kategori: string;
  tanggalPublish: string;
  penulis: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function BeritaDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [berita, setBerita] = useState<BeritaDetail | null>(null);
  const [recentBerita, setRecentBerita] = useState<BeritaDetail[]>([]);
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
    const fetchArticleData = async () => {
      try {
        setLoading(true);

        // 1. Ambil data berita berdasarkan slug atau id
        let currentArticle: BeritaDetail | null = null;
        try {
          const resDetail = await fetch(API_ENDPOINTS.BERITA.DETAIL(slug));
          if (resDetail.ok) {
            currentArticle = await resDetail.json();
          }
        } catch {
          // fallback
        }

        // 2. Ambil data landing page (untuk recent berita & profil footer)
        const resLanding = await fetch(API_ENDPOINTS.LANDING_PAGE);
        if (resLanding.ok) {
          const landingData = await resLanding.json();
          setProfil(landingData.profil || {});
          const allBerita: BeritaDetail[] = landingData.berita || [];

          // Jika detail via API_ENDPOINTS.BERITA.DETAIL belum ketemu, cari di landingData.berita
          if (!currentArticle && allBerita.length > 0) {
            currentArticle =
              allBerita.find((b) => b.slug === slug || b.id === slug) || null;
          }

          // Filter recent berita (selain yang sedang dibaca)
          const others = allBerita.filter(
            (b) => b.slug !== slug && b.id !== slug
          );
          setRecentBerita(others.slice(0, 4));
        }

        setBerita(currentArticle);
      } catch (err) {
        console.error('Gagal mengambil data detail berita:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
  }, [slug]);

  // Handle Share Copy Link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = berita ? encodeURIComponent(berita.judul) : '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* HEADER */}
        <LandingHeader activeMenu="berita" isHome={false} />

        {/* ========================================================
            PAGE TITLE & BREADCRUMB HERO (MIRIP SMKN 3 METRO)
        ======================================================== */}
        <div id="news-title" className="py-8 sm:py-12 bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-3">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {berita ? berita.judul : 'Memuat Artikel Berita...'}
            </h1>
            <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/berita" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Berita
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-xs sm:max-w-md">
                {berita?.judul || slug}
              </span>
            </nav>
          </div>
        </div>

        {/* ========================================================
            NEWS CONTENT & SIDEBAR (LAYOUT DUA KOLOM MIRIP SMKN 3 METRO)
        ======================================================== */}
        <div id="news-content" className="py-10 max-w-7xl mx-auto px-4 sm:px-8">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Memuat isi berita...</p>
            </div>
          ) : !berita ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 max-w-lg mx-auto">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Berita Tidak Ditemukan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Artikel berita yang Anda cari mungkin telah dipindahkan atau dihapus.
              </p>
              <Link
                href="/berita"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Berita</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* ========================================================
                  KOLOM UTAMA: ARTIKEL LENGKAP (COL-MD-8)
              ======================================================== */}
              <div className="lg:col-span-8 space-y-6">
                {/* Gambar Utama / Featured Image */}
                <div className="relative rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-900 aspect-16/9 shadow-md border border-slate-200 dark:border-slate-800">
                  <img
                    src={getFullUrl(berita.thumbnail, '/banner-spmb.jpg')}
                    alt={berita.judul}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/banner-spmb.jpg';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                      {berita.kategori}
                    </span>
                  </div>
                </div>

                {/* Meta Information Bar (Date, Author, Category, Views) */}
                <div className="p-4 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300 shadow-2xs">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        {new Date(berita.tanggalPublish).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-medium">{berita.penulis || 'Humas SMK MUSKA'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{berita.kategori}</span>
                    </div>
                  </div>
                  {/* <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Dilihat Ratusan Pembaca</span>
                  </div> */}
                </div>

                {/* Konten Artikel Utama (News Content Data) */}
                <article className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
                  {berita.ringkasan && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border-l-4 border-emerald-600 text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200 italic leading-relaxed">
                      &ldquo;{berita.ringkasan}&rdquo;
                    </div>
                  )}

                  <div className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line space-y-4">
                    {berita.konten}
                  </div>
                </article>

                {/* Social Share & Copy Link */}
                <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>Bagikan Artikel Ini:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${shareTitle}%20${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>WhatsApp</span>
                    </a>

                    {/* Facebook */}
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>Facebook</span>
                    </a>

                    {/* Twitter/X */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>Twitter / X</span>
                    </a>

                    {/* Copy Link Button */}
                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin!</span>
                        </>
                      ) : (
                        <span>Salin Tautan</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Back Link to News List */}
                <div className="pt-2">
                  <Link
                    href="/berita"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Lihat Seluruh Berita Lainnya</span>
                  </Link>
                </div>
              </div>

              {/* ========================================================
                  KOLOM SAMPING: SIDEBAR WIDGETS (COL-MD-4)
              ======================================================== */}
              <div className="lg:col-span-4 space-y-8">
                {/* WIDGET 1: BERITA TERBARU (ACCENT BORDER HIJAU) */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
                  <h3 className="border-l-4 border-emerald-600 pl-3 font-extrabold text-base text-slate-900 dark:text-white">
                    Berita Terbaru
                  </h3>

                  {recentBerita.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada berita lainnya.</p>
                  ) : (
                    <div className="space-y-4">
                      {recentBerita.map((item) => (
                        <Link
                          key={item.id}
                          href={`/berita/${item.slug || item.id}`}
                          className="block group rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 transition-colors p-3 bg-slate-50/50 dark:bg-slate-900/40"
                        >
                          <div className="space-y-2">
                            <div className="relative h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-900">
                              <img
                                src={getFullUrl(item.thumbnail, '/banner-spmb.jpg')}
                                alt={item.judul}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = '/banner-spmb.jpg';
                                }}
                              />
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600 text-white">
                                {item.kategori}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                              {item.judul}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <Calendar className="w-3 h-3 text-emerald-500" />
                              <span>
                                {new Date(item.tanggalPublish).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    href="/berita"
                    className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Lihat Semua Berita</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* WIDGET 2: PENGUMUMAN & PENDAFTARAN SPMB (ACCENT BORDER EMAS/HIJAU) */}
                {/* <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-800/60 rounded-3xl p-6 text-white shadow-md space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-amber-400 fill-current" />
                    <span>SPMB TA 2026/2027</span>
                  </div>

                  <h3 className="text-lg font-extrabold leading-snug">
                    Penerimaan Siswa Baru Dibuka!
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Daftar sekarang secara online. Nikmati fasilitas verifikasi dokumen otomatis berbasis AI OCR dan konsultasi chatbot 24/7.
                  </p>

                  <div className="space-y-2 pt-2">
                    <Link
                      href="/register"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <span>Daftar SPMB Online</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/login"
                      className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Login Akun Siswa</span>
                    </Link>
                  </div>
                </div> */}

                {/* WIDGET 3: HOTLINE & LAYANAN PENGADUAN */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
                  <h3 className="border-l-4 border-amber-500 pl-3 font-extrabold text-base text-slate-900 dark:text-white">
                    Layanan Kontak & Aduan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Butuh bantuan atau informasi lebih lanjut terkait berita dan pendaftaran?
                  </p>
                  <a
                    href="https://wa.me/6281377653555"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Hubungi via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING AI ASSISTANT CHATBOT */}
      <ChatbotRAG />

      {/* FOOTER */}
      <LandingFooter profil={profil} />
    </div>
  );
}
