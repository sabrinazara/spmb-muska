'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Award,
  Users,
  ArrowRight,
  Search,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ChatbotRAG from '@/components/ChatbotRAG';
import { API_ENDPOINTS } from '@/lib/api';

interface ProgramItem {
  id: string;
  nama: string;
  singkatan: string;
  deskripsi: string;
  iconUrl?: string | null;
  fotoUrls?: string[];
  kuota: number;
  urutan?: number;
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

export default function JurusanListPage() {
  const [programList, setProgramList] = useState<ProgramItem[]>([]);
  const [profil, setProfil] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    const fetchData = async () => {
      try {
        setLoading(true);

        // Ambil data dari landing page
        const resLanding = await fetch(API_ENDPOINTS.LANDING_PAGE);
        if (resLanding.ok) {
          const landingData = await resLanding.json();
          setProfil(landingData.profil || {});
          setProgramList(landingData.programKeahlian || []);
        }
      } catch (err) {
        console.error('Gagal memuat daftar program keahlian:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return programList;
    return programList.filter((p) => {
      return (
        p.nama.toLowerCase().includes(q) ||
        p.singkatan.toLowerCase().includes(q) ||
        (p.deskripsi && p.deskripsi.toLowerCase().includes(q))
      );
    });
  }, [programList, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* HEADER */}
        <LandingHeader activeMenu="jurusan" isHome={false} />

        {/* HERO TITLE & BREADCRUMB */}
        <div id="jurusan-hero" className="py-10 sm:py-14 bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-4">
            <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Program Keahlian
              </span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" />
                  <span>Kompetensi Keahlian Unggulan</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Program Keahlian SMK MUSKA
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pendidikan vokasi berstandar industri dengan kurikulum Link and Match, fasilitas lab modern, serta Teaching Factory bersertifikasi resmi.
                </p>
              </div>

              {/* SEARCH BOX */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari jurusan atau keahlian..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* LIST OF PROGRAMS */}
        <div id="jurusan-list" className="py-12 max-w-7xl mx-auto px-4 sm:px-8">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Memuat program keahlian...</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3 max-w-md mx-auto">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tidak Ada Program yang Cocok</h3>
              <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian Anda.</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredPrograms.map((p) => {
                const photos = Array.isArray(p.fotoUrls) ? p.fotoUrls.filter(Boolean) : [];
                const logoPath =
                  p.iconUrl || `/jurusan/${(p.singkatan || '').toLowerCase().replace(/[^a-z]/g, '')}.svg`;

                return (
                  <motion.div
                    key={p.id}
                    variants={cardVariant}
                    whileHover={{
                      y: -8,
                      boxShadow: '0 20px 25px -5px rgba(4, 120, 87, 0.12), 0 8px 10px -6px rgba(4, 120, 87, 0.08)',
                      transition: { duration: 0.25 },
                    }}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 group transition-colors duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 flex items-center justify-center group-hover:border-emerald-500 shadow-xs transition-colors duration-300">
                          <img
                            src={getFullUrl(logoPath, '/logo.png')}
                            alt={p.singkatan}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = '/logo.png';
                            }}
                          />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          {p.singkatan}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          <Link href={`/jurusan/${p.id}`}>{p.nama}</Link>
                        </h3>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {p.deskripsi}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-mono text-slate-400">
                          Kuota: <strong>{p.kuota}</strong> Kursi
                        </span>
                        {photos.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                            <ImageIcon className="w-3 h-3" />
                            <span>{photos.length} Foto Dokumentasi</span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/jurusan/${p.id}`}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 group/btn"
                      >
                        <span>Lihat Profil</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
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
