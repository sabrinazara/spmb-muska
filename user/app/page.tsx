'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Sun,
  Moon,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Award,
  Building2,
  Users,
  BookOpen,
  Cpu,
  Wrench,
  Server,
  Palette,
  TrendingUp,
  Utensils,
  Flame,
  Calendar,
  Zap,
  Quote,
  GraduationCap,
  Image as ImageIcon,
  Trophy,
  Share2,
  Clock,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';
import ChatbotRAG from '@/components/ChatbotRAG';
import RegistrationClosedModal from '@/components/RegistrationClosedModal';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';

interface LandingData {
  sliders: any[];
  profil: any;
  wks: any[];
  guru?: any[];
  programKeahlian: any[];
  mitraIndustri: any[];
  berita: any[];
  agenda?: any[];
  prestasi?: any[];
  galeri?: any[];
  settings?: {
    tahunAjaran?: string;
    bukaPendaftaran?: boolean;
    pengumumanDibuka?: boolean;
    tanggalPengumuman?: string;
  };
}

// ========================================================
// FRAMER MOTION ANIMATION VARIANTS
// ========================================================
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.1,
    },
  },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const modalBackdropVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalContentVariant: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 320 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export default function HomePage() {
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false);

  // Helper untuk membuka popup jika pendaftaran sedang ditutup oleh admin
  const handleAuthClick = (e: React.MouseEvent, targetUrl?: string) => {
    if (data?.settings && data.settings.bukaPendaftaran === false) {
      e.preventDefault();
      setIsClosedModalOpen(true);
    }
  };

  // Format display URL: if starts with /uploads/, prepend NEXT_PUBLIC_API_URL
  const getFullUrl = (url: string | null | undefined, fallback: string = '/logo.png') => {
    if (!url) return fallback;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
    if (url.startsWith('/uploads/')) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      return `${apiBase}${url}`;
    }
    return url;
  };

  // Dark Mode State
  const [isDark, setIsDark] = useState(false);

  // Mobile Navbar State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Modal Readers / Details
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [selectedBerita, setSelectedBerita] = useState<any | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Tab Keunggulan Sekolah (Layout Screenshot 1)
  const [activeKeunggulanTab, setActiveKeunggulanTab] = useState<'app' | 'guru' | 'fasilitas'>('app');

  // Prestasi Scroll & Auto-Slide (Setiap 5 Detik)
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const prestasiScrollRef = useRef<HTMLDivElement>(null);

  const scrollPrestasi = (direction: 'left' | 'right') => {
    if (prestasiScrollRef.current) {
      const scrollAmount = 340;
      prestasiScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleSharePrestasi = (e: React.MouseEvent, pr: any) => {
    e.stopPropagation();
    e.preventDefault();
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

  // Auto-Slide Prestasi Siswa Setiap 5 Detik (Mobile & Desktop)
  useEffect(() => {
    if (!data?.prestasi || data.prestasi.length <= 1) return;
    const interval = setInterval(() => {
      if (prestasiScrollRef.current) {
        const container = prestasiScrollRef.current;
        const scrollStep = 320;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 25) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollStep, behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [data?.prestasi]);

  useEffect(() => {
    setActivePhotoIdx(0);
  }, [selectedProgram]);

  // Scroll state (Back-to-Top button)
  const [showScrollTop, setShowScrollTop] = useState(false);

  // WKS & Dewan Guru Expand / Minimize State (Tombol Selengkapnya)
  const [showAllWks, setShowAllWks] = useState(false);
  const [showAllGuru, setShowAllGuru] = useState(false);

  // Track Window Scroll for Back-To-Top Button
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setShowScrollTop(scrollY > 350);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch Public Landing Data
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    fetch(API_ENDPOINTS.LANDING_PAGE)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        // Jika status pendaftaran ditutup oleh admin, tampilkan popup pemberitahuan otomatis saat refresh/buka
        if (result?.settings && result.settings.bukaPendaftaran === false) {
          setIsClosedModalOpen(true);
        }
      })
      .catch((err) => console.error('Gagal mengambil data landing page:', err))
      .finally(() => setLoading(false));
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Auto Advance Slider
  useEffect(() => {
    if (!data || !data.sliders || data.sliders.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.sliders.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [data]);

  const sliders = data?.sliders && data.sliders.length > 0 ? data.sliders : [];
  const profil = data?.profil || {};
  const wksList = data?.wks || [];
  const guruList = data?.guru || [];
  const programs = data?.programKeahlian || [];
  const mitraList = data?.mitraIndustri || [];
  const rawBerita = data?.berita || [];
  const beritaList = rawBerita;
  const agendaList = data?.agenda || [];
  const prestasiList = data?.prestasi || [];
  const galeriList = data?.galeri || [];

  // Limits & Pagination for WKS and Dewan Guru
  const INITIAL_WKS_LIMIT = 4;
  const visibleWks = showAllWks ? wksList : wksList.slice(0, INITIAL_WKS_LIMIT);

  const INITIAL_GURU_LIMIT = 8;
  const visibleGuru = showAllGuru ? guruList : guruList.slice(0, INITIAL_GURU_LIMIT);

  // Layout helper adaptif untuk WKS
  const getWksContainerClass = (count: number) => {
    if (count === 1) return 'flex justify-center max-w-sm mx-auto';
    if (count === 2) return 'flex flex-wrap justify-center gap-6 max-w-2xl mx-auto';
    if (count === 3) return 'flex flex-wrap justify-center gap-6 max-w-5xl mx-auto';
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
  };

  const getWksCardClass = (count: number) => {
    if (count === 1) return 'w-full';
    if (count === 2) return 'w-full sm:w-[300px] max-w-sm';
    if (count === 3) return 'w-full sm:w-[280px] lg:w-[310px]';
    return 'w-full';
  };

  // Layout helper adaptif untuk Dewan Guru
  const getGuruContainerClass = (count: number) => {
    if (count === 1) return 'flex justify-center max-w-sm mx-auto';
    if (count === 2) return 'flex flex-wrap justify-center gap-6 max-w-2xl mx-auto';
    if (count === 3) return 'flex flex-wrap justify-center gap-6 max-w-5xl mx-auto';
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';
  };

  const getGuruCardClass = (count: number) => {
    if (count === 1) return 'w-full';
    if (count === 2) return 'w-full sm:w-[300px] max-w-sm';
    if (count === 3) return 'w-full sm:w-[280px] lg:w-[310px]';
    return 'w-full';
  };

  // Map icon for program keahlian
  const getProgramIcon = (singkatan: string) => {
    const s = (singkatan || '').toUpperCase();
    if (s.includes('TKJ') || s.includes('TJKT')) return Server;
    if (s.includes('TSM') || s.includes('TBSM')) return Wrench;
    if (s.includes('DKV')) return Palette;
    if (s.includes('BDK') || s.includes('BISNIS')) return TrendingUp;
    if (s.includes('BOGA') || s.includes('KULINERI')) return Utensils;
    if (s.includes('RIAS') || s.includes('KECANTIKAN')) return Sparkles;
    if (s.includes('CNC') || s.includes('MESIN')) return Cpu;
    if (s.includes('LAS') || s.includes('WELDING')) return Flame;
    return BookOpen;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      {/* ========================================================
                FIXED FLOATING HEADER
            ======================================================== */}
      <LandingHeader
        activeMenu="beranda"
        isHome={true}
        bukaPendaftaran={data?.settings?.bukaPendaftaran}
        tahunAjaran={data?.settings?.tahunAjaran || '2026/2027'}
        profil={data?.profil}
      />

      {/* ========================================================
                3. HERO SECTION (SLIDER CAROUSEL DENGAN FRAMER MOTION)
            ======================================================== */}
      <section id="beranda" className="relative overflow-hidden bg-slate-900 text-white">
        {sliders.length > 0 ? (
          <div className="relative h-[480px] sm:h-[560px] lg:h-[620px] w-full">
            <AnimatePresence mode="wait">
              {sliders[currentSlide] && (
                <motion.div
                  key={sliders[currentSlide].id || currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                >
                  {/* Background Image with subtle scale animation */}
                  <motion.div
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 5.5, ease: 'easeOut' }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${getFullUrl(sliders[currentSlide].imageUrl, '/banner-spmb.jpg')})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-emerald-950/60" />
                  </motion.div>

                  {/* Staggered Slide Content */}
                  <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-12 flex flex-col justify-center">
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="max-w-3xl space-y-3 sm:space-y-4"
                    >
                      <motion.div variants={fadeInUp}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-600/30 border border-emerald-400/40 text-emerald-300 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest backdrop-blur-xs shadow-lg">
                          <span>{sliders[currentSlide].badgeText || `Penerimaan Siswa Baru TA ${data?.settings?.tahunAjaran || '2026/2027'}`}</span>
                        </div>
                      </motion.div>

                      <motion.h1
                        variants={fadeInUp}
                        className="text-xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md"
                      >
                        {sliders[currentSlide].title}
                      </motion.h1>

                      <motion.p
                        variants={fadeInUp}
                        className="text-xs sm:text-base text-slate-200/90 leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-none"
                      >
                        {sliders[currentSlide].subtitle ||
                          'Bergabung bersama SMK Muhammadiyah Sekampung. Kampus vokasi berkarakter Islami, dilengkapi AI OCR dan teknologi modern.'}
                      </motion.p>

                      <motion.div
                        variants={fadeInUp}
                        className="pt-2 sm:pt-4 flex flex-wrap items-center gap-2.5 sm:gap-3"
                      >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Link
                            href={sliders[currentSlide].linkUrl || '/register'}
                            onClick={(e) => {
                              const target = sliders[currentSlide].linkUrl || '/register';
                              if (target.includes('register') || target.includes('login') || target.startsWith('/')) {
                                handleAuthClick(e, target);
                              }
                            }}
                            className="px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider shadow-xl hover:shadow-2xl transition flex items-center gap-2 cursor-pointer"
                          >
                            <span>{sliders[currentSlide].ctaText || 'Daftar SPMB'}</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <a
                            href="#sambutan"
                            className="px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider backdrop-blur-md transition cursor-pointer inline-block"
                          >
                            Profil
                          </a>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slider Controls: Arrows */}
            {sliders.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() =>
                    setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1))
                  }
                  className="group absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-slate-950/20 hover:bg-slate-900/80 text-white/50 hover:text-emerald-400 backdrop-blur-xs border border-white/10 hover:border-emerald-500/40 opacity-40 hover:opacity-100 transition-all duration-300 cursor-pointer shadow-md flex items-center gap-1.5"
                  aria-label="Previous Slide"
                  title={`Sebelumnya: ${sliders[currentSlide === 0 ? sliders.length - 1 : currentSlide - 1]?.title || 'Slide'}`}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-0.5" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-medium opacity-0 group-hover:max-w-32 group-hover:opacity-100 transition-all duration-300 hidden md:inline-block pr-1 text-slate-200">
                    Sebelumnya
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % sliders.length)}
                  className="group absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3.5 rounded-full bg-slate-950/20 hover:bg-slate-900/80 text-white/50 hover:text-emerald-400 backdrop-blur-xs border border-white/10 hover:border-emerald-500/40 opacity-40 hover:opacity-100 transition-all duration-300 cursor-pointer shadow-md flex items-center gap-1.5"
                  aria-label="Next Slide"
                  title={`Berikutnya: ${sliders[(currentSlide + 1) % sliders.length]?.title || 'Slide'}`}
                >
                  <span className="max-w-0 overflow-hidden whitespace-nowrap text-[11px] font-medium opacity-0 group-hover:max-w-32 group-hover:opacity-100 transition-all duration-300 hidden md:inline-block pl-1 text-slate-200">
                    Berikutnya
                  </span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" />
                </motion.button>

                {/* Dot Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                  {sliders.map((_, i) => (
                    <motion.button
                      key={i}
                      layout
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2.5 rounded-full transition-colors cursor-pointer ${currentSlide === i ? 'w-8 bg-emerald-400' : 'w-2.5 bg-white/40'
                        }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </section>

      {/* ========================================================
                4. SAMBUTAN KEPALA SEKOLAH (2 KOLOM)
            ======================================================== */}
      <motion.section
        id="sambutan"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Photo & Frame (5 Cols) */}
          <motion.div variants={fadeInLeft} className="lg:col-span-5 flex justify-center">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-md w-full"
            >
              {/* Main Card Frame - Clean, Normal & Professional */}
              <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/60 overflow-hidden">
                <div className="aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  <img
                    src={getFullUrl(profil.fotoKepsek, '/kepsek.jpg')}
                    alt={profil.namaKepsek || 'Kepala Sekolah'}
                    className="w-full h-full object-cover transition duration-500"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-5 text-white">
                    <div className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
                      Kepala Sekolah
                    </div>
                    <div className="text-base sm:text-lg font-bold">
                      {profil.namaKepsek || 'Drs. H. Hendra Jaya, M.Pd.'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Message Content (7 Cols) */}
          <motion.div variants={fadeInRight} className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Quote className="w-3.5 h-3.5 fill-current" />
              <span>Sambutan Kepala Sekolah</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              Menyiapkan Generasi Unggul, Berkarakter Islami, dan Berdaya Saing Global
            </h2>

            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed whitespace-pre-line">
              {profil.sambutanKepsek ||
                'Selamat datang di portal resmi SMK Muhammadiyah Sekampung. Kami senantiasa berkomitmen menghadirkan pendidikan vokasi berkualitas unggul yang mengintegrasikan kompetensi keahlian industri dengan penanaman nilai-nilai luhur Al-Islam dan Kemuhammadiyahan.'}
            </div>

            {/* Motto Banner (Non-Gradient, Bersih & Profesional) */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 flex items-center gap-3.5 shadow-xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Moto
                </div>
                <div className="font-dancing text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-300 tracking-wide leading-tight mt-0.5">
                  &ldquo;{profil.motto || 'Sukses · Jaya · Bermanfaat · Inspiratif'}&rdquo;
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ========================================================
                5. PROFIL WAKIL KEPALA SEKOLAH (ADAPTIF & MINIMIZE)
            ======================================================== */}
      <motion.section
        id="wks"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Struktur Manajemen</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Pimpinan Wakil Kepala Sekolah
            </h2>
            <p className="text-xs text-slate-500">
              Didukung oleh jajaran wakil kepala sekolah berpengalaman dan berdedikasi tinggi
            </p>
          </motion.div>

          {visibleWks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Belum ada data pimpinan wakil kepala sekolah.
            </div>
          ) : (
            <motion.div
              layout
              variants={staggerContainer}
              className={getWksContainerClass(visibleWks.length)}
            >
              <AnimatePresence>
                {visibleWks.map((w) => (
                  <motion.div
                    key={w.id}
                    layout
                    variants={cardVariant}
                    whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                    className={`bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-6 text-center space-y-4 shadow-xs hover:shadow-xl transition-colors duration-300 group ${getWksCardClass(
                      visibleWks.length
                    )}`}
                  >
                    <div className="w-24 h-24 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 p-1 border-2 border-emerald-500 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={getFullUrl(w.fotoUrl, '/avatar.png')}
                        alt={w.nama}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = '/logo.png';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {w.nama}
                      </h3>
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        {w.jabatan}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Tombol Selengkapnya / Minimize jika data WKS banyak */}
          {wksList.length > INITIAL_WKS_LIMIT && (
            <div className="text-center pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAllWks(!showAllWks)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 shadow-xs hover:shadow-md transition duration-200 cursor-pointer group"
              >
                <span>
                  {showAllWks
                    ? 'Tampilkan Lebih Sedikit'
                    : `Lihat Selengkapnya (${wksList.length - INITIAL_WKS_LIMIT} Pimpinan Lainnya)`}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${showAllWks ? 'rotate-180' : ''
                    }`}
                />
              </motion.button>
            </div>
          )}
        </div>
      </motion.section>

      {/* ========================================================
                5.5. DEWAN GURU & TENAGA PENDIDIK (ADAPTIF & MINIMIZE)
            ======================================================== */}
      <motion.section
        id="guru"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-8 space-y-12"
      >
        <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Pendidik Berpengalaman</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Dewan Guru & Tenaga Pendidik
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tenaga pendidik tersertifikasi BNSP dan industri, berdedikasi tinggi membimbing potensi dan akhlak mulia siswa
          </p>
        </motion.div>

        {visibleGuru.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Belum ada data dewan guru.
          </div>
        ) : (
          <motion.div
            layout
            variants={staggerContainer}
            className={getGuruContainerClass(visibleGuru.length)}
          >
            <AnimatePresence>
              {visibleGuru.map((g) => (
                <motion.div
                  key={g.id}
                  layout
                  variants={cardVariant}
                  whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                  className={`bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-6 text-center space-y-4 shadow-xs hover:shadow-xl transition-colors duration-300 group ${getGuruCardClass(
                    visibleGuru.length
                  )}`}
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 p-1 border-2 border-emerald-500/50 overflow-hidden group-hover:scale-105 group-hover:border-emerald-500 transition duration-300">
                    <img
                      src={getFullUrl(g.fotoUrl, '/avatar.png')}
                      alt={g.nama}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = '/logo.png';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                      {g.nama}
                    </h3>
                    <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 line-clamp-1">
                      {g.mataPelajaran}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {g.pendidikan || 'Pendidik Vokasi'}
                    </div>
                  </div>
                  {g.nip && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-mono text-slate-400">NIP: {g.nip}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Tombol Selengkapnya / Minimize jika data Guru banyak */}
        {guruList.length > INITIAL_GURU_LIMIT && (
          <div className="text-center pt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAllGuru(!showAllGuru)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 shadow-xs hover:shadow-md transition duration-200 cursor-pointer group"
            >
              <span>
                {showAllGuru
                  ? 'Tampilkan Lebih Sedikit'
                  : `Lihat Selengkapnya (${guruList.length - INITIAL_GURU_LIMIT} Guru Lainnya)`}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${showAllGuru ? 'rotate-180' : ''
                  }`}
              />
            </motion.button>
          </div>
        )}
      </motion.section>

      {/* ========================================================
                6. PROGRAM KEAHLIAN (8 JURUSAN DENGAN LOGO JURUSAN)
            ======================================================== */}
      <motion.section
        id="jurusan"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Kompetensi Keahlian</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              8 Program Keahlian Berstandar Industri
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Pilihan kejuruan masa depan dengan kurikulum berbasis Dunia Usaha & Industri
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {programs.map((p) => {
              const IconComponent = getProgramIcon(p.singkatan);
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
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 group transition-colors duration-300"
                >
                  <div className="space-y-3">
                    {/* Tampilan Foto Dokumentasi Unggulan (jika diisi di CMS) */}
                    {p.fotoUrls && p.fotoUrls.length > 0 ? (
                      <div
                        onClick={() => setSelectedProgram(p)}
                        className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer group/photo"
                        title="Klik untuk membuka Galeri Foto Jurusan"
                      >
                        <img
                          src={getFullUrl(p.fotoUrls[0])}
                          alt={p.nama}
                          className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = '/banner-spmb.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover/photo:opacity-40 transition-opacity" />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1 shadow-xs">
                          {/* <ImageIcon className="w-3 h-3 text-emerald-400" />
                          <span>{p.fotoUrls.length} Foto</span> */}
                        </div>
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                          {/* <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                            {p.singkatan}
                          </span> */}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 3 }}
                          transition={{ duration: 0.25 }}
                          className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 flex items-center justify-center group-hover:border-emerald-500 shadow-xs transition-colors duration-300"
                        >
                          {p.iconUrl && (p.iconUrl.startsWith('/') || p.iconUrl.startsWith('http')) ? (
                            <img
                              src={getFullUrl(logoPath, '/logo.png')}
                              alt={p.singkatan}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <IconComponent className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </motion.div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {p.singkatan}
                        </span>
                      </div>
                    )}

                    <div>
                      {p.fotoUrls && p.fotoUrls.length > 0 && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={getFullUrl(logoPath, '/logo.png')}
                              alt={p.singkatan}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = '/logo.png';
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            {p.singkatan}
                          </span>
                        </div>
                      )}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {p.nama}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {p.deskripsi}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    {/* <span className="text-[11px] font-mono text-slate-400">
                      Kuota: <strong>{p.kuota}</strong>
                    </span> */}

                    <div className="flex items-center gap-2">
                      {/* {p.fotoUrls && p.fotoUrls.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedProgram(p)}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                          title="Buka galeri foto di popup"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Galeri ({p.fotoUrls.length})</span>
                        </button>
                      )} */}
                      <Link
                        href={`/jurusan/${p.id}`}
                        className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline flex items-center gap-1 group/btn"
                      >
                        <span>Selengkapnya</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* ========================================================
                7. MITRA DUNIA USAHA & INDUSTRI (MARQUEE ANIMASI)
            ======================================================== */}
      <section id="mitra" className="py-16 bg-slate-900 text-white overflow-hidden relative">
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes muskaMarqueeScrollLeft {
                0% { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-50%, 0, 0); }
              }
              .muska-marquee-row {
                display: flex !important;
                width: max-content !important;
                animation: muskaMarqueeScrollLeft 65s linear infinite !important;
                will-change: transform;
              }
              .muska-marquee-track:hover .muska-marquee-row,
              .muska-marquee-row:hover,
              .muska-marquee-row:hover * {
                animation-play-state: paused !important;
              }
            `,
          }}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-3 mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Kemitraan Industri</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Bekerja Sama dengan Puluhan Industri Nasional
          </h2>
        </motion.div>

        {/* Marquee Track Container (Hover to pause, leave to resume) */}
        <div className="relative w-full overflow-hidden py-4 muska-marquee-track group">
          <div className="muska-marquee-row items-center gap-8">
            {[...mitraList, ...mitraList, ...mitraList, ...mitraList].map((m, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.06, backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 shrink-0 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 flex items-center justify-center p-1 bg-white rounded-xl shadow-xs">
                  <img
                    src={getFullUrl(m.logoUrl, '/logo.png')}
                    alt={m.namaPerusahaan}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white whitespace-nowrap">
                    {m.namaPerusahaan}
                  </div>
                  <div className="text-[10px] text-emerald-400 whitespace-nowrap">
                    {m.bidangKerjasama || 'Mitra Resmi DUDI'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
                8. KEUNGGULAN SEKOLAH (FONT POPPINS & WARNA HIJAU/EMERALD)
            ======================================================== */}
      <section id="keunggulan" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Keunggulan Sekolah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-normal">
            Tiga hal yang menjadi dasar layanan pendidikan unggul kami di SMK Muhammadiyah Sekampung.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left Column: Vertical Tabs */}
          <div className="md:col-span-4 divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
            {/* Tab 1: Digital App */}
            <button
              type="button"
              onClick={() => setActiveKeunggulanTab('app')}
              className={`w-full text-left py-4 px-5 transition-all duration-200 cursor-pointer flex items-center justify-between group ${activeKeunggulanTab === 'app'
                  ? 'border-l-4 border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 border-l-4 border-transparent'
                }`}
            >
              <div>
                <div
                  className={`text-sm sm:text-base transition-colors ${activeKeunggulanTab === 'app'
                      ? 'font-bold text-emerald-800 dark:text-emerald-400'
                      : 'font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                >
                  Digital App
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Layanan berbasis online
                </div>
              </div>
              {activeKeunggulanTab === 'app' && (
                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </button>

            {/* Tab 2: Guru Profesional */}
            <button
              type="button"
              onClick={() => setActiveKeunggulanTab('guru')}
              className={`w-full text-left py-4 px-5 transition-all duration-200 cursor-pointer flex items-center justify-between group ${activeKeunggulanTab === 'guru'
                  ? 'border-l-4 border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 border-l-4 border-transparent'
                }`}
            >
              <div>
                <div
                  className={`text-sm sm:text-base transition-colors ${activeKeunggulanTab === 'guru'
                      ? 'font-bold text-emerald-800 dark:text-emerald-400'
                      : 'font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                >
                  Guru Profesional
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Tenaga pendidik berkualitas
                </div>
              </div>
              {activeKeunggulanTab === 'guru' && (
                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </button>

            {/* Tab 3: Sarana Fasilitas */}
            <button
              type="button"
              onClick={() => setActiveKeunggulanTab('fasilitas')}
              className={`w-full text-left py-4 px-5 transition-all duration-200 cursor-pointer flex items-center justify-between group ${activeKeunggulanTab === 'fasilitas'
                  ? 'border-l-4 border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 border-l-4 border-transparent'
                }`}
            >
              <div>
                <div
                  className={`text-sm sm:text-base transition-colors ${activeKeunggulanTab === 'fasilitas'
                      ? 'font-bold text-emerald-800 dark:text-emerald-400'
                      : 'font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                >
                  Sarana Fasilitas
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Lengkap & modern
                </div>
              </div>
              {activeKeunggulanTab === 'fasilitas' && (
                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </button>
          </div>

          {/* Right Column: Content Detail (Poppins Font) */}
          <div className="md:col-span-8 pt-2">
            <AnimatePresence mode="wait">
              {activeKeunggulanTab === 'app' && (
                <motion.div
                  key="keunggulan-app"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-lg sm:text-2xl lg:text-[23px] font-normal leading-relaxed text-slate-800 dark:text-slate-200">
                    Sekolah kami sudah didukung dengan ekosistem digital terintegrasi untuk memudahkan kegiatan belajar mengajar, administrasi, dan perpustakaan dalam satu genggaman.
                  </p>
                </motion.div>
              )}

              {activeKeunggulanTab === 'guru' && (
                <motion.div
                  key="keunggulan-guru"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-lg sm:text-2xl lg:text-[23px] font-normal leading-relaxed text-slate-800 dark:text-slate-200">
                    Tenaga pendidik kami berdedikasi tinggi, tersertifikasi asesor BNSP dan instruktur pelatihan industri resmi, berdedikasi mendidik akhlak karimah serta kompetensi kerja unggul siswa.
                  </p>
                </motion.div>
              )}

              {activeKeunggulanTab === 'fasilitas' && (
                <motion.div
                  key="keunggulan-fasilitas"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-lg sm:text-2xl lg:text-[23px] font-normal leading-relaxed text-slate-800 dark:text-slate-200">
                    Fasilitas bengkel praktik industri dan laboratorium komputer modern berstandar APM nasional, ruang multimedia, dan sarana olahraga penunjang yang representatif dan lengkap.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ========================================================
                9. BERITA TERBARU (GRID 3 KOLOM)
            ======================================================== */}
      <motion.section
        id="berita"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Informasi & Berita</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Kabar Terkini SMK Muhammadiyah Sekampung
              </h2>
            </div>
            <Link
              href="/berita"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 transition shadow-2xs group cursor-pointer"
            >
              <span>Lihat Semua Berita</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {beritaList.map((b) => (
              <motion.div
                key={b.id}
                variants={cardVariant}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-colors duration-300 flex flex-col justify-between group"
              >
                <Link
                  href={`/berita/${b.slug || b.id}`}
                  className="relative h-48 bg-slate-200 dark:bg-slate-900 overflow-hidden block"
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

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {new Date(b.tanggalPublish).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <Link href={`/berita/${b.slug || b.id}`}>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {b.judul}
                      </h3>
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
          </motion.div>
        </div>
      </motion.section>

      {/* ========================================================
                10. AGENDA KEGIATAN SEKOLAH (Dikelola oleh Admin)
            ======================================================== */}
      <motion.section
        id="agenda"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>Jadwal & Agenda</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Agenda Kegiatan SMK Muhammadiyah Sekampung
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Jadwal agenda akademik, perlombaan, ujian, dan kegiatan kesiswaan mendatang yang dapat diakses oleh seluruh warga sekolah.
              </p>
            </div>
            {agendaList.length > 3 && (
              <Link
                href="/agenda"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 transition shadow-2xs group cursor-pointer"
              >
                <span>Total {agendaList.length} Agenda</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>

          {agendaList.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Belum ada agenda kegiatan yang dijadwalkan saat ini.</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {agendaList.map((ag: any) => {
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
                      className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group h-full"
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
      </motion.section>

      {/* ========================================================
                11. PRESTASI SISWA (Layout Referensi Screenshot 3)
            ======================================================== */}
      <motion.section
        id="prestasi"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="py-20 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          {/* Header Prestasi (Poppins Font, No font-serif) */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Prestasi Siswa
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Capaian siswa SMK Muhammadiyah Sekampung di tingkat daerah hingga nasional.
              </p>
            </div>
            <Link
              href="/prestasi"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group cursor-pointer"
            >
              <span>Semua prestasi</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Carousel Prestasi Siswa dengan Panah Navigasi */}
          <div className="relative group/carousel">
            {/* Navigasi Panah Kiri */}
            <button
              type="button"
              onClick={() => scrollPrestasi('left')}
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Prestasi Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Navigasi Panah Kanan */}
            <button
              type="button"
              onClick={() => scrollPrestasi('right')}
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Prestasi Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Track Horizontal Scroll */}
            <div
              ref={prestasiScrollRef}
              className="flex gap-6 overflow-x-auto pb-4 pt-2 px-1 scroll-smooth no-scrollbar scrollbar-none snap-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {prestasiList.map((pr: any) => {
                const dateStr = pr.tanggal
                  ? new Date(pr.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                  : 'Terbaru';

                return (
                  <Link
                    key={pr.id}
                    href={`/prestasi/${pr.id}`}
                    className="snap-start shrink-0 w-[270px] sm:w-[290px] md:w-[310px] bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                  >
                    {/* Foto Prestasi dengan Badge JUARA */}
                    <div className="relative h-48 sm:h-52 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                      <img
                        src={getFullUrl(pr.fotoUrl, '/banner-spmb.jpg')}
                        alt={pr.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = '/banner-spmb.jpg';
                        }}
                      />
                      {/* Badge JUARA (Emas seperti Screenshot 3) */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-amber-500 text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/30">
                        <Trophy className="w-3.5 h-3.5 fill-current" />
                        <span>{pr.kategoriJuara || 'JUARA'}</span>
                      </div>
                    </div>

                    {/* Informasi Prestasi */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {pr.judul}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {pr.namaPeserta} {pr.namaLomba ? `· ${pr.namaLomba}` : ''} {pr.tingkat ? `(${pr.tingkat})` : ''}
                        </p>
                      </div>

                      {/* Baris Bawah: Tanggal & Tombol Bagikan */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>{dateStr}</span>
                        <button
                          type="button"
                          onClick={(e) => handleSharePrestasi(e, pr)}
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
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ========================================================
                12. GALERI KEGIATAN SEKOLAH (Fitur Baru)
            ======================================================== */}
      <motion.section
        id="galeri"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Dokumentasi Visual</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Galeri Foto Kegiatan & Aktivitas
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Dokumentasi foto kegiatan belajar mengajar, praktikum kejuruan di bengkel, dan momen kebersamaan di kampus SMK Muhammadiyah Sekampung.
              </p>
            </div>
            {galeriList.length > 3 && (
              <Link
                href="/galeri"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 transition shadow-2xs group cursor-pointer"
              >
                <span>Total {galeriList.length} Album Galeri</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>

          {galeriList.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Belum ada album galeri foto yang dipublikasikan saat ini.</p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {galeriList.map((item: any) => {
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
                    whileHover={{ y: -8, transition: { duration: 0.25 } }}
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
      </motion.section>

      {/* ========================================================
                13. FOOTER DENGAN BRANDING "MUSKA HEBAT."
            ======================================================== */}
      <LandingFooter profil={profil} />

      {/* FLOATING AI ASSISTANT CHATBOT */}
      <ChatbotRAG />

      {/* FLOATING SCROLL TO TOP BUTTON */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-to-top"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-[100px] right-4 sm:bottom-[116px] sm:right-6 z-40 p-3 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white shadow-xl cursor-pointer flex items-center justify-center border border-white/20"
            title="Kembali ke Atas"
          >
            <ChevronRight className="w-5 h-5 -rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* MODAL DETAIL PROGRAM KEAHLIAN */}
      <AnimatePresence>
        {selectedProgram && (
          <motion.div
            key="modal-program-backdrop"
            variants={modalBackdropVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setSelectedProgram(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          >
            {(() => {
              const programPhotos: string[] = Array.isArray(selectedProgram.fotoUrls)
                ? selectedProgram.fotoUrls.filter(Boolean)
                : [];
              return (
                <motion.div
                  key="modal-program-content"
                  variants={modalContentVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center shrink-0">
                        <img
                          src={getFullUrl(
                            selectedProgram.iconUrl ||
                            `/jurusan/${(selectedProgram.singkatan || '').toLowerCase().replace(/[^a-z]/g, '')}.svg`,
                            '/logo.png'
                          )}
                          alt={selectedProgram.singkatan}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/logo.png';
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {selectedProgram.singkatan}
                          </span>
                          {programPhotos.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {programPhotos.length} Foto
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {selectedProgram.nama}
                        </h3>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setSelectedProgram(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Photo Gallery (Max 5 photos) */}
                  {programPhotos.length > 0 && (
                    <div className="space-y-2">
                      <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={programPhotos[activePhotoIdx] || activePhotoIdx}
                            src={getFullUrl(programPhotos[activePhotoIdx], '/logo.png')}
                            alt={`${selectedProgram.nama} - Foto ${activePhotoIdx + 1}`}
                            initial={{ opacity: 0, scale: 1.03 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/logo.png';
                            }}
                          />
                        </AnimatePresence>

                        {/* Photo Index Counter */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/20">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{activePhotoIdx + 1} / {programPhotos.length}</span>
                        </div>

                        {/* Navigation arrows if multiple photos */}
                        {programPhotos.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : programPhotos.length - 1));
                              }}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
                              title="Foto Sebelumnya"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePhotoIdx((prev) => (prev < programPhotos.length - 1 ? prev + 1 : 0));
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
                              title="Foto Selanjutnya"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Thumbnails row */}
                      {programPhotos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5">
                          {programPhotos.map((photo, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActivePhotoIdx(idx)}
                              className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${activePhotoIdx === idx
                                ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105'
                                : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                                }`}
                            >
                              <img
                                src={getFullUrl(photo, '/logo.png')}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedProgram.deskripsi}
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Kapasitas Daya Tampung:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {selectedProgram.kuota} Kursi
                    </strong>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedProgram(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Tutup
                    </motion.button>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/register"
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider inline-block cursor-pointer"
                      >
                        Daftar Jurusan Ini
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DETAIL BERITA */}
      <AnimatePresence>
        {selectedBerita && (
          <motion.div
            key="modal-berita-backdrop"
            variants={modalBackdropVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setSelectedBerita(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              key="modal-berita-content"
              variants={modalContentVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                    {selectedBerita.kategori}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                    {selectedBerita.judul}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1">
                    Dipublikasikan:{' '}
                    {new Date(selectedBerita.tanggalPublish).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    • Oleh: {selectedBerita.penulis}
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setSelectedBerita(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="h-56 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={getFullUrl(selectedBerita.thumbnail, '/banner-spmb.jpg')}
                  alt={selectedBerita.judul}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/banner-spmb.jpg';
                  }}
                />
              </div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedBerita.konten}
              </div>
              <div className="flex justify-end pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedBerita(null)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Tutup Berita
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Modal Notifikasi Pendaftaran Ditutup Sementara */}
      <RegistrationClosedModal
        isOpen={isClosedModalOpen}
        onClose={() => setIsClosedModalOpen(false)}
        tahunAjaran={data?.settings?.tahunAjaran || '2026/2027'}
        forceRedirectHome={false}
      />
    </div>
  );
}