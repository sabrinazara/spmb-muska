'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Check,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ChatbotRAG from '@/components/ChatbotRAG';
import { API_ENDPOINTS } from '@/lib/api';

interface AgendaDetail {
  id: string;
  judul: string;
  tanggal: string;
  waktu?: string | null;
  lokasi?: string | null;
  deskripsi?: string | null;
  kategori?: string | null;
  status?: string | null;
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

export default function AgendaDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [agenda, setAgenda] = useState<AgendaDetail | null>(null);
  const [otherAgenda, setOtherAgenda] = useState<AgendaDetail[]>([]);
  const [profil, setProfil] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAgendaData = async () => {
      try {
        setLoading(true);

        // 1. Ambil detail via endpoint spesifik agenda jika ada
        let currentItem: AgendaDetail | null = null;
        try {
          const resDetail = await fetch(API_ENDPOINTS.AGENDA.DETAIL(id));
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
          const allAgenda: AgendaDetail[] = landingData.agenda || [];

          if (!currentItem && allAgenda.length > 0) {
            currentItem = allAgenda.find((a) => a.id === id) || null;
          }

          const others = allAgenda.filter((a) => a.id !== id);
          setOtherAgenda(others.slice(0, 3));
        }

        setAgenda(currentItem);
      } catch (err) {
        console.error('Gagal mengambil data agenda:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendaData();
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: agenda?.judul || 'Agenda SMK MUSKA',
          text: `Agenda Sekolah: ${agenda?.judul}\n${shareUrl}`,
          url: shareUrl,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  const dateObj = agenda?.tanggal ? new Date(agenda.tanggal) : null;
  const dayNum = dateObj && !isNaN(dateObj.getDate()) ? String(dateObj.getDate()).padStart(2, '0') : '--';
  const monthName = dateObj && !isNaN(dateObj.getDate())
    ? dateObj.toLocaleDateString('id-ID', { month: 'long' })
    : 'Bulan';
  const yearNum = dateObj && !isNaN(dateObj.getFullYear()) ? dateObj.getFullYear() : '';
  const fullDateStr = dateObj && !isNaN(dateObj.getTime())
    ? dateObj.toLocaleDateString('id-ID', {
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
        <LandingHeader activeMenu="agenda" isHome={false} profil={profil} />

        <main className="pt-28 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-emerald-600 transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/agenda" className="hover:text-emerald-600 transition-colors">
                Agenda Kegiatan
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[180px] sm:max-w-xs">
                {agenda?.judul || 'Detail Agenda'}
              </span>
            </nav>

            {loading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4"></div>
                <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
              </div>
            ) : !agenda ? (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Agenda Tidak Ditemukan</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Agenda yang Anda cari mungkin telah diperbarui atau dipindahkan oleh pihak sekolah.
                </p>
                <Link
                  href="/agenda"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Daftar Agenda</span>
                </Link>
              </div>
            ) : (
              <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-8">
                {/* HERO CARD DETAIL AGENDA */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                  {/* Top Header: Badge & Share Button */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                        {agenda.kategori || 'Agenda Sekolah'}
                      </span>
                      {agenda.status && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {agenda.status}
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
                          <span>Bagikan Agenda</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {agenda.judul}
                  </h1>

                  {/* Meta Key Info Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Tanggal Pelaksanaan
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {fullDateStr}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Waktu
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {agenda.waktu || 'Menyesuaikan Jadwal'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Lokasi Tempat
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                          {agenda.lokasi || 'Kampus SMK Muhammadiyah Sekampung'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Full Description */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                      Rincian Informasi & Petunjuk Kegiatan
                    </h3>
                    <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {agenda.deskripsi ||
                        'Tidak ada deskripsi rincian tambahan untuk agenda ini. Silakan hubungi pihak sekolah atau wali kelas untuk informasi selengkapnya.'}
                    </div>
                  </div>
                </div>

                {/* AGENDA LAINNYA */}
                {otherAgenda.length > 0 && (
                  <div className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Agenda Mendatang Lainnya
                      </h3>
                      <Link
                        href="/agenda"
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <span>Lihat Semua Agenda</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {otherAgenda.map((other) => {
                        const oDate = new Date(other.tanggal);
                        const oDay = isNaN(oDate.getDate()) ? '--' : String(oDate.getDate()).padStart(2, '0');
                        const oMonth = isNaN(oDate.getDate())
                          ? 'BLN'
                          : oDate.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();

                        return (
                          <Link
                            key={other.id}
                            href={`/agenda/${other.id}`}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-2xl p-4 shadow-xs transition group flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex flex-col items-center justify-center shadow-xs shrink-0">
                                  <span className="text-sm font-black leading-none">{oDay}</span>
                                  <span className="text-[9px] font-bold uppercase">{oMonth}</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 truncate">
                                  {other.kategori || 'Agenda'}
                                </span>
                              </div>
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                {other.judul}
                              </h4>
                            </div>
                            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                              <span>Detail Agenda</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        );
                      })}
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
