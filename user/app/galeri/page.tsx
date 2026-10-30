'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Image as ImageIcon,
  Calendar,
  Search,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ChatbotRAG from '@/components/ChatbotRAG';
import { API_ENDPOINTS } from '@/lib/api';

interface GaleriItem {
  id: string;
  judul: string;
  slug: string;
  kategori?: string | null;
  deskripsi?: string | null;
  thumbnail: string;
  fotoUrls?: string[];
  tanggal: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function GaleriListPage() {
  const [galeriList, setGaleriList] = useState<GaleriItem[]>([]);
  const [profil, setProfil] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');

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
    const fetchAllData = async () => {
      try {
        setLoading(true);

        let list: GaleriItem[] = [];
        try {
          const resGaleri = await fetch(API_ENDPOINTS.GALERI.LIST);
          if (resGaleri.ok) {
            list = await resGaleri.json();
          }
        } catch {
          // fallback
        }

        const resLanding = await fetch(API_ENDPOINTS.LANDING_PAGE);
        if (resLanding.ok) {
          const landingData = await resLanding.json();
          setProfil(landingData.profil || {});
          if (!list || list.length === 0) {
            list = landingData.galeri || [];
          }
        }
        setGaleriList(list);
      } catch (err) {
        console.error('Gagal memuat galeri:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const categories = useMemo(() => {
    const setKat = new Set<string>();
    galeriList.forEach((g) => {
      if (g.kategori) setKat.add(g.kategori);
    });
    return ['Semua', ...Array.from(setKat)];
  }, [galeriList]);

  const filteredGaleri = useMemo(() => {
    return galeriList.filter((g) => {
      const matchKategori = selectedKategori === 'Semua' || g.kategori === selectedKategori;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        g.judul.toLowerCase().includes(query) ||
        (g.deskripsi && g.deskripsi.toLowerCase().includes(query));

      return matchKategori && matchSearch;
    });
  }, [galeriList, selectedKategori, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* HEADER */}
        <LandingHeader activeMenu="galeri" isHome={false} profil={profil} />

        {/* HERO / BREADCRUMB HEADER */}
        <div className="bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Galeri Foto
              </span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <span>Dokumentasi Visual Kampus</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Galeri Foto & Aktivitas Sekolah
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Koleksi dokumentasi visual kegiatan belajar mengajar, praktikum bengkel kejuruan, kepramukaan, dan momen kebersamaan di SMK Muhammadiyah Sekampung.
                </p>
              </div>

              {/* Search Bar Input */}
              <div className="w-full md:w-80 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari album foto kegiatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-500 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 shadow-2xs transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs Kategori */}
            {categories.length > 1 && (
              <div className="pt-4 flex flex-wrap items-center gap-2">
                {categories.map((kat) => (
                  <button
                    key={kat}
                    onClick={() => setSelectedKategori(kat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedKategori === kat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600'
                      }`}
                  >
                    {kat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LIST GALERI GRID */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Memuat album galeri foto...</p>
            </div>
          ) : filteredGaleri.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                Tidak ada album foto yang ditemukan
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Silakan coba ubah kata kunci pencarian atau pilih kategori galeri yang lain.
              </p>
              {(searchQuery || selectedKategori !== 'Semua') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedKategori('Semua');
                  }}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredGaleri.map((item) => {
                const totalPhotos = 1 + (Array.isArray(item.fotoUrls) ? item.fotoUrls.filter(Boolean).length : 0);
                const dateStr = item.tanggal
                  ? new Date(item.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                  : 'Dokumentasi Sekolah';

                return (
                  <motion.div
                    key={item.id}
                    variants={cardVariant}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  >
                    <Link
                      href={`/galeri/${item.slug || item.id}`}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer h-full"
                    >
                      {/* Thumbnail Image dengan Badge Total Foto */}
                      <div className="relative h-56 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                        <img
                          src={getFullUrl(item.thumbnail, '/banner-spmb.jpg')}
                          alt={item.judul}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = '/banner-spmb.jpg';
                          }}
                        />
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                          {item.kategori || 'Galeri'}
                        </span>
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{totalPhotos} Foto</span>
                        </span>
                      </div>

                      {/* Deskripsi Galeri */}
                      <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{dateStr}</span>
                          </div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.judul}
                          </h3>
                          {item.deskripsi && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {item.deskripsi}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 group-hover:border-emerald-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5">
                            <span>Buka Album Foto</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      <ChatbotRAG />
      <LandingFooter profil={profil} />
    </div>
  );
}
