'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Sun,
  Moon,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
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
  ExternalLink,
  Calendar,
  Eye,
  Shield,
  Clock,
  Zap,
  Quote,
  GraduationCap,
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
      // Selesai mengetik kalimat penuh, jeda 2.2 detik agar nyaman dibaca
      timer = setTimeout(() => {
        setIsDeletingBrand(true);
        setBrandSpeed(50);
      }, 2200);
    } else if (isDeletingBrand && typedBrand.length > 0) {
      // Menghapus huruf mundur
      timer = setTimeout(() => {
        setTypedBrand(fullBrandText.slice(0, typedBrand.length - 1));
      }, brandSpeed);
    } else if (isDeletingBrand && typedBrand.length === 0) {
      // Selesai menghapus, jeda 500ms lalu ulangi mengetik lagi
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
    // Initialize Theme from localStorage
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
  const beritaList = data?.berita || [];

  // Limits & Pagination for WKS and Dewan Guru (Fitur Selengkapnya / Minimize)
  const INITIAL_WKS_LIMIT = 4;
  const visibleWks = showAllWks ? wksList : wksList.slice(0, INITIAL_WKS_LIMIT);

  const INITIAL_GURU_LIMIT = 8;
  const visibleGuru = showAllGuru ? guruList : guruList.slice(0, INITIAL_GURU_LIMIT);

  // Layout helper adaptif untuk WKS agar proporsional dan tidak timpang saat data 1 atau 2
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

  // Map icon for program keahlian (fallback jika gambar tidak tersedia)
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
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Jl. Raya Sekampung No. 45, Lampung Timur</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>smkmuhsekampung@gmail.com</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>(0725) 7851234</span>
            </div>
          </div>

          {/* Right: Quick Links & Theme Toggle */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              NPSN: 10806085 • Akreditasi A
            </span>
            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
            <button
              onClick={toggleTheme}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 p-1.5 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200">
              <img
                src="/logo.png"
                onError={(e) => {
                  e.currentTarget.src = '/logo.svg';
                }}
                alt="Logo SMK Muhammadiyah Sekampung"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white uppercase leading-tight min-h-[22px] flex items-center">
                <span>{typedBrand || ' '}</span>
                <span className="inline-block w-0.5 h-4 sm:h-5 bg-amber-500 ml-1 animate-pulse" />
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide">
                Pusat Keunggulan Vokasi & Karakter Islami
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <a href="#beranda" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Beranda
            </a>
            <a href="#sambutan" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Sambutan
            </a>
            <a href="#wks" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Pimpinan
            </a>
            <a href="#guru" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Dewan Guru
            </a>
            <a href="#jurusan" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Program Keahlian
            </a>
            <a href="#mitra" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Mitra DUDI
            </a>
            <a href="#berita" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Berita
            </a>
            <a href="#kontak" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Kontak
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-emerald-600/30 hover:border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold text-xs transition"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer transform active:scale-95"
            >
              {/* <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-current" /> */}
              <span>Daftar</span>
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs font-semibold animate-in slide-in-from-top duration-200">
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
            <a
              href="#berita"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
            >
              Berita & Pengumuman
            </a>
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
          </div>
        )}
      </header>

      {/* ========================================================
                3. HERO SECTION (SLIDER CAROUSEL)
            ======================================================== */}
      <section id="beranda" className="relative overflow-hidden bg-slate-900 text-white">
        {sliders.length > 0 ? (
          <div className="relative h-[480px] sm:h-[560px] lg:h-[620px] w-full">
            {sliders.map((s, index) => {
              const isCurrent = index === currentSlide;
              return (
                <div
                  key={s.id || index}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                >
                  {/* Background Image with Dark & Emerald Overlay */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${getFullUrl(s.imageUrl, '/banner-spmb.jpg')})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-emerald-950/60" />
                  </div>

                  {/* Slide Content */}
                  <div className="relative z-20 max-w-7xl mx-auto h-full px-6 sm:px-12 flex flex-col justify-center">
                    <div className="max-w-3xl space-y-4 animate-in fade-in slide-in-from-left duration-500">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600/30 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-xs">
                        {/* <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" /> */}
                        <span>{s.badgeText || 'Penerimaan Siswa Baru TA 2026/2027'}</span>
                      </div>

                      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                        {s.title}
                      </h1>

                      <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl">
                        {s.subtitle ||
                          'Bergabung bersama SMK Muhammadiyah Sekampung. Kampus vokasi berkarakter Islami, dilengkapi AI OCR dan teknologi modern.'}
                      </p>

                      <div className="pt-4 flex flex-wrap items-center gap-3">
                        <Link
                          href={s.linkUrl || '/register'}
                          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl hover:shadow-2xl transition flex items-center gap-2 transform active:scale-95 cursor-pointer"
                        >
                          <span>{s.ctaText || 'Daftar Sekarang Online'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                          href="#sambutan"
                          className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md transition cursor-pointer"
                        >
                          Pelajari Profil
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Slider Controls: Arrows */}
            {sliders.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1))
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-emerald-600 text-white backdrop-blur-md transition cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % sliders.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-emerald-600 text-white backdrop-blur-md transition cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                  {sliders.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${currentSlide === i ? 'w-8 bg-emerald-400' : 'w-2.5 bg-white/40'
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
      <section id="sambutan" className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Photo & Frame (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-md w-full">
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
                    className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
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
            </div>
          </div>

          {/* Right: Message Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Quote className="w-3.5 h-3.5 fill-current" />
              <span>Sambutan Resmi Pimpinan</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              Menyiapkan Generasi Unggul, Berkarakter Islami, dan Berdaya Saing Global
            </h2>

            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed whitespace-pre-line">
              {profil.sambutanKepsek ||
                'Selamat datang di portal resmi SMK Muhammadiyah Sekampung. Kami senantiasa berkomitmen menghadirkan pendidikan vokasi berkualitas unggul yang mengintegrasikan kompetensi keahlian industri dengan penanaman nilai-nilai luhur Al-Islam dan Kemuhammadiyahan.'}
            </div>

            {/* Motto Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-amber-50/50 dark:from-emerald-950/40 dark:via-slate-900/50 dark:to-amber-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600/10 dark:bg-emerald-400/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Semboyan SMK MUSKA
                </div>
                <div className="font-dancing text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-200 tracking-wide leading-tight mt-0.5">
                  &ldquo;{profil.motto || 'Sukses · Jaya · Bermanfaat · Inspiratif'}&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
                5. PROFIL WAKIL KEPALA SEKOLAH (ADAPTIF & MINIMIZE)
            ======================================================== */}
      <section id="wks" className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
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
          </div>

          {visibleWks.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Belum ada data pimpinan wakil kepala sekolah.
            </div>
          ) : (
            <div className={getWksContainerClass(visibleWks.length)}>
              {visibleWks.map((w) => (
                <div
                  key={w.id}
                  className={`bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-6 text-center space-y-4 shadow-xs hover:shadow-lg hover:-translate-y-1 transition duration-300 group ${getWksCardClass(visibleWks.length)}`}
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 p-1 border-2 border-emerald-500 overflow-hidden group-hover:scale-105 transition duration-300">
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
                </div>
              ))}
            </div>
          )}

          {/* Tombol Selengkapnya / Minimize jika data WKS banyak */}
          {wksList.length > INITIAL_WKS_LIMIT && (
            <div className="text-center pt-2">
              <button
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
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
                5.5. DEWAN GURU & TENAGA PENDIDIK (ADAPTIF & MINIMIZE)
            ======================================================== */}
      <section id="guru" className="py-20 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
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
        </div>

        {visibleGuru.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Belum ada data dewan guru.
          </div>
        ) : (
          <div className={getGuruContainerClass(visibleGuru.length)}>
            {visibleGuru.map((g) => (
              <div
                key={g.id}
                className={`bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-6 text-center space-y-4 shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-300 group ${getGuruCardClass(visibleGuru.length)}`}
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
              </div>
            ))}
          </div>
        )}

        {/* Tombol Selengkapnya / Minimize jika data Guru banyak */}
        {guruList.length > INITIAL_GURU_LIMIT && (
          <div className="text-center pt-4">
            <button
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
            </button>
          </div>
        )}
      </section>

      {/* ========================================================
                6. PROGRAM KEAHLIAN (8 JURUSAN DENGAN LOGO JURUSAN)
            ======================================================== */}
      <section id="jurusan" className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((p) => {
              const IconComponent = getProgramIcon(p.singkatan);
              const logoPath = p.iconUrl || `/jurusan/${(p.singkatan || '').toLowerCase().replace(/[^a-z]/g, '')}.svg`;
              return (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 flex items-center justify-center group-hover:scale-110 group-hover:border-emerald-500 shadow-xs transition duration-300">
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
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {p.singkatan}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                        {p.nama}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {p.deskripsi}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Kuota: <strong>{p.kuota}</strong> Kursi
                    </span>
                    <button
                      onClick={() => setSelectedProgram(p)}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Rincian</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
                7. MITRA DUNIA USAHA & INDUSTRI (MARQUEE ANIMASI BERGERAK KE KIRI)
            ======================================================== */}
      <section id="mitra" className="py-16 bg-slate-900 text-white overflow-hidden relative">
        {/* CSS Scoped Marquee Keyframes Bergerak Otomatis dari Kanan ke Kiri */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
                        @keyframes muskaMarqueeScrollLeft {
                            0% {
                                transform: translate3d(0, 0, 0);
                            }
                            100% {
                                transform: translate3d(-50%, 0, 0);
                            }
                        }
                        .muska-marquee-row {
                            display: flex !important;
                            width: max-content !important;
                            animation: muskaMarqueeScrollLeft 22s linear infinite !important;
                            will-change: transform;
                        }
                        .muska-marquee-row:hover {
                            animation-play-state: paused;
                        }
                    `,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Kemitraan Industri & Link-and-Match</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Bekerja Sama dengan Puluhan Industri Nasional
          </h2>
        </div>

        {/* Marquee Track Container */}
        <div className="relative w-full overflow-hidden py-4">
          <div className="muska-marquee-row items-center gap-8">
            {/* Duplicate for seamless infinite loop right to left */}
            {[...mitraList, ...mitraList, ...mitraList, ...mitraList].map((m, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 shrink-0 hover:bg-white/10 transition"
              >
                <div className="w-12 h-12 flex items-center justify-center p-1 bg-white rounded-xl">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
                8. KEUNGGULAN SEKOLAH (3 POIN IKONIK)
            ======================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Keunggulan Kompetitif</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Mengapa Memilih SMK Muhammadiyah Sekampung?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs hover:shadow-lg transition space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Cpu className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Layanan Digital & AI Terintegrasi
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Pelayanan SPMB berbasis AI OCR verifikasi berkas otomatis, chatbot RAG 24/7, serta ujian seleksi mandiri berbasis CBT modern.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs hover:shadow-lg transition space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Guru Profesional & Sertifikasi Industri
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Tenaga pendidik tersertifikasi asesor BNSP dan instruktur pelatihan industri, memastikan transfer kompetensi kerja riil.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs hover:shadow-lg transition space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. Bengkel & Sarana Praktik Lengkap
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Laboratorium komputer multimedia, bengkel injeksi resmi sepeda motor, studio DKV, serta mesin CNC berstandar APM nasional.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
                9. BERITA TERBARU (GRID 3 KOLOM)
            ======================================================== */}
      <section id="berita" className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Informasi & Berita</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Kabar Terkini SMK Muhammadiyah Sekampung
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {beritaList.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between group"
              >
                <div className="relative h-48 bg-slate-200 dark:bg-slate-900 overflow-hidden">
                  <img
                    src={getFullUrl(b.thumbnail, '/banner-spmb.jpg')}
                    alt={b.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/banner-spmb.jpg';
                    }}
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                    {b.kategori}
                  </span>
                </div>

                <div className="p-6 space-y-3 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(b.tanggalPublish).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    {b.judul}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {b.ringkasan || b.konten}
                  </p>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => setSelectedBerita(b)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
                10. FOOTER & PETA GOOGLE MAPS
            ======================================================== */}
      <footer id="kontak" className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Col 1: Brand & Semboyan */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 p-1 flex items-center justify-center shrink-0">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/logo.svg'; }} />
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
                  <Link href="/register" className="hover:text-emerald-400 transition">
                    Pendaftaran SPMB Online
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-emerald-400 transition">
                    Login Akun Siswa
                  </Link>
                </li>
                <li>
                  <a href="#jurusan" className="hover:text-emerald-400 transition">
                    Daftar 8 Program Keahlian
                  </a>
                </li>
                <li>
                  <a href="#sambutan" className="hover:text-emerald-400 transition">
                    Profil Pimpinan Sekolah
                  </a>
                </li>
                <li>
                  <Link href="http://localhost:3002" target="_blank" className="hover:text-emerald-400 transition">
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
      </footer>

      {/* FLOATING AI ASSISTANT CHATBOT */}
      <ChatbotRAG />

      {/* FLOATING SCROLL TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 p-3 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center border border-white/20 animate-in fade-in slide-in-from-bottom-4"
          title="Kembali ke Atas"
        >
          <ChevronRight className="w-5 h-5 -rotate-90" />
        </button>
      )}

      {/* MODAL DETAIL PROGRAM KEAHLIAN */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center shrink-0">
                  <img
                    src={getFullUrl(selectedProgram.iconUrl || `/jurusan/${(selectedProgram.singkatan || '').toLowerCase().replace(/[^a-z]/g, '')}.svg`, '/logo.png')}
                    alt={selectedProgram.singkatan}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/logo.png';
                    }}
                  />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {selectedProgram.singkatan}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedProgram.nama}
                  </h3>
                </div>
              </div>
              <button onClick={() => setSelectedProgram(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedProgram.deskripsi}
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
              <span>Kapasitas Daya Tampung:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{selectedProgram.kuota} Kursi</strong>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedProgram(null)} className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold">
                Tutup
              </button>
              <Link href="/register" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider">
                Daftar Jurusan Ini
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL BERITA */}
      {selectedBerita && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                  {selectedBerita.kategori}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                  {selectedBerita.judul}
                </h3>
                <div className="text-xs text-slate-400 mt-1">
                  Dipublikasikan: {new Date(selectedBerita.tanggalPublish).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • Oleh: {selectedBerita.penulis}
                </div>
              </div>
              <button onClick={() => setSelectedBerita(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-56 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img src={getFullUrl(selectedBerita.thumbnail, '/banner-spmb.jpg')} alt={selectedBerita.judul} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/banner-spmb.jpg'; }} />
            </div>
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedBerita.konten}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedBerita(null)} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider">
                Tutup Berita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}