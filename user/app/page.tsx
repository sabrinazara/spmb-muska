'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';
import ChatbotRAG from '@/components/ChatbotRAG';

interface LandingData {
  sliders: any[];
  profil: any;
  wks: any[];
  guru?: any[];
  programKeahlian: any[];
  mitraIndustri: any[];
  berita: any[];
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

  useEffect(() => {
    setActivePhotoIdx(0);
  }, [selectedProgram]);

  // Scroll to Top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  // WKS & Dewan Guru Expand / Minimize State (Tombol Selengkapnya)
  const [showAllWks, setShowAllWks] = useState(false);
  const [showAllGuru, setShowAllGuru] = useState(false);

  // Typewriter State for Header Brand Title
  const [typedBrand, setTypedBrand] = useState('');
  const fullBrandText = 'SMK MUHAMMADIYAH SEKAMPUNG';
  const [isDeletingBrand, setIsDeletingBrand] = useState(false);
  const [brandSpeed, setBrandSpeed] = useState(110);

  // Typewriter Effect Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isDeletingBrand && typedBrand.length < fullBrandText.length) {
      timer = setTimeout(() => {
        setTypedBrand(fullBrandText.slice(0, typedBrand.length + 1));
      }, brandSpeed);
    } else if (!isDeletingBrand && typedBrand.length === fullBrandText.length) {
      timer = setTimeout(() => {
        setIsDeletingBrand(true);
        setBrandSpeed(50);
      }, 2200);
    } else if (isDeletingBrand && typedBrand.length > 0) {
      timer = setTimeout(() => {
        setTypedBrand(fullBrandText.slice(0, typedBrand.length - 1));
      }, brandSpeed);
    } else if (isDeletingBrand && typedBrand.length === 0) {
      timer = setTimeout(() => {
        setIsDeletingBrand(false);
        setBrandSpeed(110);
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [typedBrand, isDeletingBrand, brandSpeed]);

  // Track Window Scroll for Back-To-Top Button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
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
                1. TOP INFO BAR
            ======================================================== */}
      <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left: Contact Info */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <div className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>JL. RAYA SEKAMPUNG, Kec. Sekampung, Kab. Lampung Timur, Prov. Lampung.</span>
            </div>
            <a
              href="mailto:smkmuhsekampung@gmail.com"
              className="hidden md:flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>smkmuhsekampung@gmail.com</span>
            </a>
            <a
              href="tel:081377653555"
              className="hidden lg:flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>081377653555</span>
            </a>
          </div>

          {/* Right: Quick Links & Theme Toggle */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              NPSN: 10814962 • Akreditasi A
            </span>
            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
            <motion.button
              whileTap={{ scale: 0.85, rotate: 180 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              onClick={toggleTheme}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ========================================================
                2. MAIN NAVBAR (STICKY)
            ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Name With Typewriter Effect */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 rounded-2xl bg-emerald-700 p-1.5 flex items-center justify-center shrink-0 shadow-md"
            >
              <img
                src="/logo.png"
                onError={(e) => {
                  e.currentTarget.src = '/logo.svg';
                }}
                alt="Logo SMK Muhammadiyah Sekampung"
                className="w-full h-full object-contain"
              />
            </motion.div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white uppercase leading-tight min-h-[22px] flex items-center">
                <span>{typedBrand || ' '}</span>
                <span className="inline-block w-0.5 h-4 sm:h-5 bg-amber-500 ml-1 animate-pulse" />
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide">
                Pusat Keunggulan Vokasi
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <motion.a whileHover={{ y: -2 }} href="#beranda" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Beranda
            </motion.a>
            <motion.a whileHover={{ y: -2 }} href="#sambutan" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Sambutan
            </motion.a>
            <motion.a whileHover={{ y: -2 }} href="#wks" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Pimpinan
            </motion.a>
            <motion.a whileHover={{ y: -2 }} href="#guru" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Dewan Guru
            </motion.a>
            <motion.a whileHover={{ y: -2 }} href="#jurusan" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Program Keahlian
            </motion.a>
            <motion.a whileHover={{ y: -2 }} href="#mitra" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Mitra DUDI
            </motion.a>
            <Link href="/berita" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Berita
            </Link>
            <motion.a whileHover={{ y: -2 }} href="#kontak" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Kontak
            </motion.a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl border border-emerald-600/30 hover:border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold text-xs transition inline-block"
              >
                Masuk
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Daftar</span>
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Drawer with AnimatePresence */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs font-semibold"
            >
              <a
                href="#beranda"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Beranda
              </a>
              <a
                href="#sambutan"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Sambutan Kepala Sekolah
              </a>
              <a
                href="#wks"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Pimpinan Wakil Kepala Sekolah
              </a>
              <a
                href="#guru"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Dewan Guru & Tenaga Pendidik
              </a>
              <a
                href="#jurusan"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Program Keahlian (8 Jurusan)
              </a>
              <a
                href="#mitra"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Mitra Industri & DUDI
              </a>
              <Link
                href="/berita"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Berita & Pengumuman
              </Link>
              <a
                href="#kontak"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Kontak & Lokasi
              </a>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <Link
                  href="/login"
                  className="flex-1 py-2.5 text-center rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold"
                >
                  Masuk Akun
                </Link>
                <Link
                  href="/register"
                  className="flex-1 py-2.5 text-center rounded-xl bg-emerald-700 text-white font-bold"
                >
                  Daftar SPMB
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

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
                  <div className="relative z-20 max-w-7xl mx-auto h-full px-6 sm:px-12 flex flex-col justify-center">
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="max-w-3xl space-y-4"
                    >
                      <motion.div variants={fadeInUp}>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600/30 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-xs shadow-lg">
                          <span>{sliders[currentSlide].badgeText || 'Penerimaan Siswa Baru TA 2026/2027'}</span>
                        </div>
                      </motion.div>

                      <motion.h1
                        variants={fadeInUp}
                        className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md"
                      >
                        {sliders[currentSlide].title}
                      </motion.h1>

                      <motion.p
                        variants={fadeInUp}
                        className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl"
                      >
                        {sliders[currentSlide].subtitle ||
                          'Bergabung bersama SMK Muhammadiyah Sekampung. Kampus vokasi berkarakter Islami, dilengkapi AI OCR dan teknologi modern.'}
                      </motion.p>

                      <motion.div
                        variants={fadeInUp}
                        className="pt-4 flex flex-wrap items-center gap-3"
                      >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Link
                            href={sliders[currentSlide].linkUrl || '/register'}
                            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl hover:shadow-2xl transition flex items-center gap-2 cursor-pointer"
                          >
                            <span>{sliders[currentSlide].ctaText || 'Daftar Sekarang Online'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <a
                            href="#sambutan"
                            className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md transition cursor-pointer inline-block"
                          >
                            Pelajari Profil
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
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(5, 150, 105, 0.85)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1))
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white backdrop-blur-md transition-colors cursor-pointer shadow-lg"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(5, 150, 105, 0.85)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % sliders.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 text-white backdrop-blur-md transition-colors cursor-pointer shadow-lg"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
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
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative group max-w-md w-full"
            >
              {/* Layer 1: Ambient outer blur rotating glow */}
              <div className="absolute -inset-4 rounded-[36px] overflow-hidden blur-2xl opacity-35 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none">
                <div className="muska-rotating-glow-canvas muska-rotating-glow-bg" />
              </div>

              {/* Layer 2: Orbital neon border outline rotating */}
              <div className="absolute -inset-1 rounded-[30px] overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none p-[2px]">
                <div className="muska-rotating-glow-canvas muska-rotating-glow-bg" />
              </div>

              {/* Main Card Frame */}
              <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden backdrop-blur-sm">
                <div className="aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  <img
                    src={getFullUrl(profil.fotoKepsek, '/kepsek.jpg')}
                    alt={profil.namaKepsek || 'Kepala Sekolah'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-5 text-white">
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

            {/* Motto Banner */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-amber-50/50 dark:from-emerald-950/40 dark:via-slate-900/50 dark:to-amber-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-3.5 shadow-2xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-600/10 dark:bg-emerald-400/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Moto
                </div>
                <div className="font-dancing text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-200 tracking-wide leading-tight mt-0.5">
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
                          <ImageIcon className="w-3 h-3 text-emerald-400" />
                          <span>{p.fotoUrls.length} Foto</span>
                        </div>
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                            {p.singkatan}
                          </span>
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
                    <span className="text-[11px] font-mono text-slate-400">
                      Kuota: <strong>{p.kuota}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {p.fotoUrls && p.fotoUrls.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedProgram(p)}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                          title="Buka galeri foto di popup"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Galeri ({p.fotoUrls.length})</span>
                        </button>
                      )}
                      <Link
                        href={`/jurusan/${p.id}`}
                        className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline flex items-center gap-1 group/btn"
                      >
                        <span>Profil</span>
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
                animation: muskaMarqueeScrollLeft 24s linear infinite !important;
                will-change: transform;
              }
              .muska-marquee-row:hover {
                animation-play-state: paused;
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
            <span>Kemitraan Industri & Link-and-Match</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Bekerja Sama dengan Puluhan Industri Nasional
          </h2>
        </motion.div>

        {/* Marquee Track Container */}
        <div className="relative w-full overflow-hidden py-4">
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
                8. KEUNGGULAN SEKOLAH (3 POIN IKONIK)
            ======================================================== */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 max-w-7xl mx-auto px-4 sm:px-8 space-y-12"
      >
        <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Keunggulan Kompetitif</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Mengapa Memilih SMK Muhammadiyah Sekampung?
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div
            variants={cardVariant}
            whileHover={{ y: -10, transition: { duration: 0.25 } }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-8 shadow-xs hover:shadow-xl transition-colors duration-300 space-y-4 group"
          >
            <motion.div
              whileHover={{ rotate: 8, scale: 1.1 }}
              transition={{ duration: 0.25 }}
              className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors duration-300"
            >
              <Cpu className="w-7 h-7" />
            </motion.div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Layanan Digital & AI Terintegrasi
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Pelayanan SPMB berbasis AI OCR verifikasi berkas otomatis, chatbot RAG 24/7, serta ujian seleksi mandiri berbasis CBT modern.
            </p>
          </motion.div>

          <motion.div
            variants={cardVariant}
            whileHover={{ y: -10, transition: { duration: 0.25 } }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-3xl p-8 shadow-xs hover:shadow-xl transition-colors duration-300 space-y-4 group"
          >
            <motion.div
              whileHover={{ rotate: 8, scale: 1.1 }}
              transition={{ duration: 0.25 }}
              className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-colors duration-300"
            >
              <Award className="w-7 h-7" />
            </motion.div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Guru Profesional & Sertifikasi Industri
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Tenaga pendidik tersertifikasi asesor BNSP dan instruktur pelatihan industri, memastikan transfer kompetensi kerja riil.
            </p>
          </motion.div>

          <motion.div
            variants={cardVariant}
            whileHover={{ y: -10, transition: { duration: 0.25 } }}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 rounded-3xl p-8 shadow-xs hover:shadow-xl transition-colors duration-300 space-y-4 group"
          >
            <motion.div
              whileHover={{ rotate: 8, scale: 1.1 }}
              transition={{ duration: 0.25 }}
              className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center transition-colors duration-300"
            >
              <Building2 className="w-7 h-7" />
            </motion.div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. Bengkel & Sarana Praktik Lengkap
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Laboratorium komputer multimedia, bengkel injeksi resmi sepeda motor, studio DKV, serta mesin CNC berstandar APM nasional.
            </p>
          </motion.div>
        </motion.div>
      </motion.section>

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
                10. FOOTER & PETA GOOGLE MAPS
            ======================================================== */}
      <motion.footer
        id="kontak"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeInUp}
        className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1: Brand & Semboyan */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 p-1 flex items-center justify-center shrink-0">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.svg';
                    }}
                  />
                </div>
                <span className="font-bold text-sm text-white uppercase tracking-wider">
                  SMK MUHAMMADIYAH SEKAMPUNG
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sekolah Menengah Kejuruan Pusat Keunggulan di Kabupaten Lampung Timur yang berkarakter Islami, kompeten, dan siap kerja.
              </p>
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-300 font-bold">
                Semboyan: Sukses · Jaya · Bermanfaat · Inspiratif
              </div>
            </div>

            {/* Col 2: Tautan Cepat */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">
                Tautan Pintasan
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link href="/register" className="hover:text-emerald-400 transition-colors">
                    Pendaftaran SPMB Online
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-emerald-400 transition-colors">
                    Login Akun Siswa
                  </Link>
                </li>
                <li>
                  <a href="#jurusan" className="hover:text-emerald-400 transition-colors">
                    Daftar 8 Program Keahlian
                  </a>
                </li>
                <li>
                  <a href="#sambutan" className="hover:text-emerald-400 transition-colors">
                    Profil Pimpinan Sekolah
                  </a>
                </li>
                <li>
                  <Link
                    href="http://localhost:3002"
                    target="_blank"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    CMS Dashboard Administrator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Kontak Resmi */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">
                Kontak Sekretariat
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{profil.alamatLengkap || 'Jl. Raya Sekampung No. 45, Sekampung, Lampung Timur 34382'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{profil.emailResmi || 'smkmuhsekampung@gmail.com'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{profil.teleponResmi || '(0725) 7851234'}</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Google Maps Embed */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">
                Peta Lokasi Kampus
              </h4>
              <div className="w-full h-40 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15888.436151740685!2d105.4314!3d-5.1973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMTEnNTAuMyJTIDEwNcKwMjYnMjkuMCJF!5e0!3m2!1sid!2sid!4v1600000000000!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  title="Peta Lokasi SMK Muhammadiyah Sekampung"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
            © 2026 SMK Muhammadiyah Sekampung. Seluruh Hak Cipta Dilindungi Undang-Undang.
          </div>
        </div>
      </motion.footer>

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
            className="fixed bottom-24 right-6 z-40 p-3 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white shadow-xl cursor-pointer flex items-center justify-center border border-white/20"
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
                              className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                                activePhotoIdx === idx
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
    </div>
  );
}