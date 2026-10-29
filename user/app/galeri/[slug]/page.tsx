'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Calendar,
  Image as ImageIcon,
  Share2,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  X,
  Sparkles,
} from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ChatbotRAG from '@/components/ChatbotRAG';
import { API_ENDPOINTS } from '@/lib/api';

interface GaleriDetail {
  id: string;
  judul: string;
  slug: string;
  kategori?: string | null;
  deskripsi?: string | null;
  thumbnail: string;
  fotoUrls: string[];
  tanggal: string;
  urutan?: number;
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

export default function GaleriDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [galeri, setGaleri] = useState<GaleriDetail | null>(null);
  const [otherGaleri, setOtherGaleri] = useState<GaleriDetail[]>([]);
  const [profil, setProfil] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
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
    const fetchGalleryData = async () => {
      try {
        setLoading(true);

        // 1. Ambil detail via endpoint spesifik galeri jika ada
        let currentItem: GaleriDetail | null = null;
        try {
          const resDetail = await fetch(API_ENDPOINTS.GALERI.DETAIL(slug));
          if (resDetail.ok) {
            currentItem = await resDetail.json();
          }
        } catch {
          // ignore error and fallback to landing data
        }

        // 2. Ambil data landing page
        const resLanding = await fetch(API_ENDPOINTS.LANDING_PAGE);
        if (resLanding.ok) {
          const landingData = await resLanding.json();
          setProfil(landingData.profil || {});
          const allGaleri: GaleriDetail[] = landingData.galeri || [];

          if (!currentItem && allGaleri.length > 0) {
            currentItem =
              allGaleri.find((g) => g.slug === slug || g.id === slug) || null;
          }

          const others = allGaleri.filter(
            (g) => g.slug !== slug && g.id !== slug
          );
          setOtherGaleri(others.slice(0, 3));
        }

        setGaleri(currentItem);
      } catch (err) {
        console.error('Gagal mengambil data galeri:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const allPhotos: string[] = galeri
    ? [galeri.thumbnail, ...(Array.isArray(galeri.fotoUrls) ? galeri.fotoUrls : [])].filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased">
      {/* HEADER */}
      <LandingHeader activeMenu="beranda" isHome={false} profil={profil} />

      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10">
          {/* BREADCRUMB */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/galeri" className="hover:text-emerald-600 transition-colors">
              Galeri Sekolah
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px] sm:max-w-xs">
              {galeri?.judul || 'Detail Galeri'}
            </span>
          </nav>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4"></div>
              <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                ))}
              </div>
            </div>
          ) : !galeri ? (
            <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <ImageIcon className="w-16 h-16 text-slate-400 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Album Galeri Tidak Ditemukan</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Album yang Anda cari mungkin telah diperbarui atau dipindahkan oleh admin sekolah.
              </p>
              <Link
                href="/galeri"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Galeri</span>
              </Link>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-8">
              {/* HEADER INFO */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                      {galeri.kategori || 'Galeri Dokumentasi'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{allPhotos.length} Foto Dokumentasi</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition shadow-2xs cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Tautan Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Bagikan Album</span>
                      </>
                    )}
                  </button>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {galeri.judul}
                </h1>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>
                      {new Date(galeri.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {galeri.deskripsi && (
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {galeri.deskripsi}
                  </p>
                )}
              </div>

              {/* MAIN ACTIVE PHOTO VIEWER */}
              <div className="relative aspect-16/10 rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={allPhotos[activePhotoIdx]}
                    src={getFullUrl(allPhotos[activePhotoIdx], '/banner-spmb.jpg')}
                    alt={`${galeri.judul} - Foto ${activePhotoIdx + 1}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => setLightboxOpen(true)}
                  />
                </AnimatePresence>

                {/* Counter & Fullscreen Controls */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                    Foto {activePhotoIdx + 1} / {allPhotos.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 transition cursor-pointer"
                    title="Perbesar Layar Penuh"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Arrows */}
                {allPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1))
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center transition cursor-pointer border border-white/20 hover:scale-110 active:scale-95"
                      title="Foto Sebelumnya"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIdx((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0))
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center transition cursor-pointer border border-white/20 hover:scale-110 active:scale-95"
                      title="Foto Selanjutnya"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* GRID OF ALL PHOTOS IN ALBUM (Hanya Menampilkan Gambar Lainnya) */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Seluruh Foto Dalam Dokumentasi Ini ({allPhotos.length})</span>
                  </h3>
                  <span className="text-xs text-slate-400">Klik foto untuk membuka tampilan detail</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {allPhotos.map((photo, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative aspect-4/3 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shadow-xs ${
                        activePhotoIdx === idx
                          ? 'border-emerald-600 ring-4 ring-emerald-600/30'
                          : 'border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={getFullUrl(photo, '/banner-spmb.jpg')}
                        alt={`Foto Dokumentasi ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                        #{idx + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* ALBUM GALERI LAINNYA */}
              {otherGaleri.length > 0 && (
                <div className="space-y-6 pt-12 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Album Dokumentasi Lainnya
                    </h3>
                    <Link
                      href="/galeri"
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <span>Lihat Semua Album</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {otherGaleri.map((other) => (
                      <Link
                        key={other.id}
                        href={`/galeri/${other.slug || other.id}`}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col justify-between"
                      >
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={getFullUrl(other.thumbnail, '/banner-spmb.jpg')}
                            alt={other.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                            {other.kategori || 'Galeri'}
                          </span>
                        </div>
                        <div className="p-4 space-y-1">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 transition-colors">
                            {other.judul}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {new Date(other.tanggal).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
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

      {/* LIGHTBOX FULLSCREEN */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4"
          >
            <div className="flex items-center justify-between text-white p-2">
              <span className="text-sm font-semibold">
                Foto {activePhotoIdx + 1} dari {allPhotos.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div
              className="relative flex-1 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getFullUrl(allPhotos[activePhotoIdx], '/banner-spmb.jpg')}
                alt="Enlarged photo"
                className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />

              {allPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1))
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIdx((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="text-center text-xs text-slate-400 py-2">
              Tekan tombol panah atau geser untuk melihat dokumentasi lainnya
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatbotRAG />
      <LandingFooter profil={profil} />
    </div>
  );
}
