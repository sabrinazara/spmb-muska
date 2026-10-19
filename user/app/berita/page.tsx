'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  Calendar,
  User,
  ArrowRight,
  Search,
  BookOpen,
  ChevronRight,
  Tag,
  Sparkles,
} from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ChatbotRAG from '@/components/ChatbotRAG';
import { API_ENDPOINTS } from '@/lib/api';

interface BeritaItem {
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
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function BeritaListPage() {
  const [beritaList, setBeritaList] = useState<BeritaItem[]>([]);
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
    // Ambil data profil untuk footer dan data berita publik
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 1. Coba ambil dari endpoint berita publik
        let beritaData: BeritaItem[] = [];
        try {
          const resBerita = await fetch(API_ENDPOINTS.BERITA.LIST);
          if (resBerita.ok) {
            beritaData = await resBerita.json();
          }
        } catch {
          // fallback
        }

        // 2. Ambil profil sekolah dari landing page
        const resLanding = await fetch(API_ENDPOINTS.LANDING_PAGE);
        if (resLanding.ok) {
          const landingData = await resLanding.json();
          setProfil(landingData.profil || {});
          if (!beritaData || beritaData.length === 0) {
            beritaData = landingData.berita || [];
          }
        }
        setBeritaList(beritaData);
      } catch (err) {
        console.error('Gagal memuat berita:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Kategori unik yang ada pada data berita
  const categories = useMemo(() => {
    const setKat = new Set<string>();
    beritaList.forEach((b) => {
      if (b.kategori) setKat.add(b.kategori);
    });
    return ['Semua', ...Array.from(setKat)];
  }, [beritaList]);

  // Filter berita berdasarkan kata kunci pencarian dan kategori
  const filteredBerita = useMemo(() => {
    return beritaList.filter((b) => {
      const matchKategori = selectedKategori === 'Semua' || b.kategori === selectedKategori;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        b.judul.toLowerCase().includes(query) ||
        (b.ringkasan && b.ringkasan.toLowerCase().includes(query)) ||
        (b.konten && b.konten.toLowerCase().includes(query));

      return matchKategori && matchSearch;
    });
  }, [beritaList, selectedKategori, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* HEADER */}
        <LandingHeader activeMenu="berita" isHome={false} />

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
                Berita & Informasi
              </span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Kabar Terkini Kampus</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Berita & Pengumuman Resmi
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Pusat informasi terbaru mengenai kegiatan akademik, prestasi siswa, program vokasi, dan pengumuman resmi SMK Muhammadiyah Sekampung.
                </p>
              </div>

              {/* Search Bar Input */}
              <div className="w-full md:w-80 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari berita atau informasi..."
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
          </div>
        </div>

        {/* LIST BERITA GRID */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Memuat daftar berita...</p>
            </div>
          ) : filteredBerita.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Tidak ada berita ditemukan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {searchQuery
                  ? `Tidak ada artikel yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain atau pilih kategori berbeda.`
                  : 'Belum ada artikel berita yang dipublikasikan pada kategori ini.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                >
                  Reset Pencarian
                </button>
              )}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredBerita.map((b) => (
                  <motion.div
                    key={b.id}
                    layout
                    variants={cardVariant}
                    whileHover={{ y: -8, transition: { duration: 0.25 } }}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-colors duration-300 flex flex-col justify-between group"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/berita/${b.slug || b.id}`}
                      className="relative h-52 bg-slate-200 dark:bg-slate-900 overflow-hidden block"
                    >
                      <img
                        src={getFullUrl(b.thumbnail, '/banner-spmb.jpg')}
                        alt={b.judul}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = '/banner-spmb.jpg';
                        }}
                      />
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                        {b.kategori}
                      </span>
                    </Link>

                    {/* Content */}
                    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {new Date(b.tanggalPublish).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[120px]">{b.penulis}</span>
                          </div>
                        </div>

                        <Link href={`/berita/${b.slug || b.id}`} className="block">
                          <h2 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {b.judul}
                          </h2>
                        </Link>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {b.ringkasan || b.konten}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        <Link
                          href={`/berita/${b.slug || b.id}`}
                          className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Baca Selengkapnya</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
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
