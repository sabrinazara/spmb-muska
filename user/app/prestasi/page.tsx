'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Trophy,
  Award,
  Search,
  ChevronRight,
  ArrowRight,
  Share2,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ChatbotRAG from '@/components/ChatbotRAG';
import { API_ENDPOINTS } from '@/lib/api';

interface PrestasiItem {
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

export default function PrestasiListPage() {
  const [prestasiList, setPrestasiList] = useState<PrestasiItem[]>([]);
  const [profil, setProfil] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTingkat, setSelectedTingkat] = useState('Semua');
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

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

        let list: PrestasiItem[] = [];
        try {
          const resPrestasi = await fetch(API_ENDPOINTS.PRESTASI.LIST);
          if (resPrestasi.ok) {
            list = await resPrestasi.json();
          }
        } catch {
          // fallback
        }

        const resLanding = await fetch(API_ENDPOINTS.LANDING_PAGE);
        if (resLanding.ok) {
          const landingData = await resLanding.json();
          setProfil(landingData.profil || {});
          if (!list || list.length === 0) {
            list = landingData.prestasi || [];
          }
        }
        setPrestasiList(list);
      } catch (err) {
        console.error('Gagal memuat prestasi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const tingkats = useMemo(() => {
    const setTingkat = new Set<string>();
    prestasiList.forEach((pr) => {
      if (pr.tingkat) setTingkat.add(pr.tingkat);
    });
    return ['Semua', ...Array.from(setTingkat)];
  }, [prestasiList]);

  const filteredPrestasi = useMemo(() => {
    return prestasiList.filter((pr) => {
      const matchTingkat = selectedTingkat === 'Semua' || pr.tingkat === selectedTingkat;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        pr.judul.toLowerCase().includes(query) ||
        pr.namaPeserta.toLowerCase().includes(query) ||
        (pr.namaLomba && pr.namaLomba.toLowerCase().includes(query)) ||
        (pr.kategoriJuara && pr.kategoriJuara.toLowerCase().includes(query));

      return matchTingkat && matchSearch;
    });
  }, [prestasiList, selectedTingkat, searchQuery]);

  const handleShare = (e: React.MouseEvent, pr: PrestasiItem) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/prestasi/${pr.id}` : '';
    const shareText = `Prestasi Siswa SMK MUSKA: ${pr.judul} - ${pr.namaPeserta} (${pr.kategoriJuara || 'JUARA'})\n${shareUrl}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: pr.judul,
        text: shareText,
        url: shareUrl,
      }).catch(() => { });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShareId(pr.id);
      setTimeout(() => setCopiedShareId(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* HEADER */}
        <LandingHeader activeMenu="prestasi" isHome={false} profil={profil} />

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
                Prestasi Siswa
              </span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <span>Koleksi Prestasi & Kejuaraan</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Prestasi Membanggakan Siswa
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Bukti dedikasi, keahlian, dan semangat juang siswa-siswi SMK Muhammadiyah Sekampung dalam berbagai kompetisi kejuruan, akademik, dan ekstrakurikuler.
                </p>
              </div>

              {/* Search Bar Input */}
              <div className="w-full md:w-80 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari prestasi, nama siswa, atau lomba..."
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

            {/* Filter Tabs Tingkat */}
            {tingkats.length > 1 && (
              <div className="pt-4 flex flex-wrap items-center gap-2">
                {tingkats.map((tingkat) => (
                  <button
                    key={tingkat}
                    onClick={() => setSelectedTingkat(tingkat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedTingkat === tingkat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600'
                      }`}
                  >
                    {tingkat === 'Semua' ? 'Semua Tingkat' : `Tingkat ${tingkat}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LIST PRESTASI GRID */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Memuat data prestasi siswa...</p>
            </div>
          ) : filteredPrestasi.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                Tidak ada data prestasi yang ditemukan
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Silakan coba ubah kata kunci pencarian atau pilih filter tingkat yang lain.
              </p>
              {(searchQuery || selectedTingkat !== 'Semua') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTingkat('Semua');
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredPrestasi.map((pr) => {
                const dateStr = pr.tanggal
                  ? new Date(pr.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                  : 'Terbaru';

                return (
                  <motion.div
                    key={pr.id}
                    variants={cardVariant}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  >
                    <Link
                      href={`/prestasi/${pr.id}`}
                      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer h-full"
                    >
                      {/* Foto Prestasi dengan Badge JUARA */}
                      <div className="relative h-48 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                        <img
                          src={getFullUrl(pr.fotoUrl, '/banner-spmb.jpg')}
                          alt={pr.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = '/banner-spmb.jpg';
                          }}
                        />
                        {/* Badge JUARA (Emas Trophy) */}
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-amber-500 text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/30">
                          <Trophy className="w-3.5 h-3.5 fill-current" />
                          <span>{pr.kategoriJuara || 'JUARA'}</span>
                        </div>
                        {pr.tingkat && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white border border-white/20">
                            {pr.tingkat}
                          </span>
                        )}
                      </div>

                      {/* Informasi Prestasi */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {pr.judul}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            <strong className="text-slate-700 dark:text-slate-300">{pr.namaPeserta}</strong>
                            {pr.namaLomba ? ` · ${pr.namaLomba}` : ''}
                          </p>
                        </div>

                        {/* Baris Bawah: Tanggal & Tombol Bagikan */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {dateStr}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleShare(e, pr)}
                            className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all shadow-2xs hover:scale-105"
                            title="Bagikan Prestasi Ini"
                          >
                            {copiedShareId === pr.id ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                          </button>
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
