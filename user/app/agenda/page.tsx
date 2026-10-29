'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Search,
  ChevronRight,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ChatbotRAG from '@/components/ChatbotRAG';
import { API_ENDPOINTS } from '@/lib/api';

interface AgendaItem {
  id: string;
  judul: string;
  tanggal: string;
  waktu?: string | null;
  lokasi?: string | null;
  deskripsi?: string | null;
  kategori?: string | null;
  status?: string | null;
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

export default function AgendaListPage() {
  const [agendaList, setAgendaList] = useState<AgendaItem[]>([]);
  const [profil, setProfil] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        let list: AgendaItem[] = [];
        try {
          const resAgenda = await fetch(API_ENDPOINTS.AGENDA.LIST);
          if (resAgenda.ok) {
            list = await resAgenda.json();
          }
        } catch {
          // fallback
        }

        const resLanding = await fetch(API_ENDPOINTS.LANDING_PAGE);
        if (resLanding.ok) {
          const landingData = await resLanding.json();
          setProfil(landingData.profil || {});
          if (!list || list.length === 0) {
            list = landingData.agenda || [];
          }
        }
        setAgendaList(list);
      } catch (err) {
        console.error('Gagal memuat agenda:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const categories = useMemo(() => {
    const setKat = new Set<string>();
    agendaList.forEach((ag) => {
      if (ag.kategori) setKat.add(ag.kategori);
    });
    return ['Semua', ...Array.from(setKat)];
  }, [agendaList]);

  const filteredAgenda = useMemo(() => {
    return agendaList.filter((ag) => {
      const matchKategori = selectedKategori === 'Semua' || ag.kategori === selectedKategori;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        ag.judul.toLowerCase().includes(query) ||
        (ag.deskripsi && ag.deskripsi.toLowerCase().includes(query)) ||
        (ag.lokasi && ag.lokasi.toLowerCase().includes(query));

      return matchKategori && matchSearch;
    });
  }, [agendaList, selectedKategori, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* HEADER */}
        <LandingHeader activeMenu="agenda" isHome={false} profil={profil} />

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
                Agenda Kegiatan
              </span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Jadwal & Kalender Akademik</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Agenda Sekolah Terkini
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Jadwal agenda akademik, ujian, perlombaan, dan kegiatan kesiswaan SMK Muhammadiyah Sekampung yang dapat diakses oleh siswa, wali murid, dan masyarakat.
                </p>
              </div>

              {/* Search Bar Input */}
              <div className="w-full md:w-80 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari agenda atau lokasi..."
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
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedKategori === kat
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

        {/* LIST AGENDA GRID */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Memuat jadwal agenda sekolah...</p>
            </div>
          ) : filteredAgenda.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                Tidak ada agenda yang ditemukan
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Silakan coba ubah kata kunci pencarian atau pilih kategori agenda yang lain.
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAgenda.map((ag) => {
                const dateObj = new Date(ag.tanggal);
                const dayNum = isNaN(dateObj.getDate()) ? '--' : String(dateObj.getDate()).padStart(2, '0');
                const monthName = isNaN(dateObj.getDate())
                  ? 'BULAN'
                  : dateObj.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
                const yearNum = isNaN(dateObj.getFullYear()) ? '' : dateObj.getFullYear();

                return (
                  <motion.div
                    key={ag.id}
                    variants={cardVariant}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  >
                    <Link
                      href={`/agenda/${ag.id}`}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group h-full"
                    >
                      <div className="space-y-4">
                        {/* Top Row: Date Box + Category */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex flex-col items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                              <span className="text-lg font-black leading-none">{dayNum}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider">{monthName}</span>
                            </div>
                            <div>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {ag.kategori || 'Umum'}
                              </span>
                              <div className="text-[11px] text-slate-400 mt-1">Tahun {yearNum}</div>
                            </div>
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {ag.judul}
                          </h3>
                          {ag.deskripsi && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                              {ag.deskripsi}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Metadata & Footer */}
                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                        {ag.waktu && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{ag.waktu}</span>
                          </div>
                        )}
                        {ag.lokasi && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{ag.lokasi}</span>
                          </div>
                        )}
                        <div className="pt-2 flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                          <span>Lihat Rincian Agenda</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
