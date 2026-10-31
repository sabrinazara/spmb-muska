'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Mail,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Quote,
  Award,
  Users,
  Building2,
  Sparkles,
  GraduationCap,
  Trophy,
  BookOpen,
  Calendar,
  Image as ImageIcon,
  Phone,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';
import RegistrationClosedModal from './RegistrationClosedModal';

interface LandingHeaderProps {
  activeMenu?: string;
  isHome?: boolean;
  bukaPendaftaran?: boolean | null;
  tahunAjaran?: string;
  profil?: any;
}

export default function LandingHeader({
  activeMenu = 'beranda',
  isHome = false,
  bukaPendaftaran: initialBukaPendaftaran = null,
  tahunAjaran: initialTahunAjaran = '2026/2027',
  profil = null,
}: LandingHeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bukaPendaftaran, setBukaPendaftaran] = useState<boolean | null>(initialBukaPendaftaran);
  const [tahunAjaran, setTahunAjaran] = useState(initialTahunAjaran);
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialBukaPendaftaran !== null && initialBukaPendaftaran !== undefined) {
      setBukaPendaftaran(initialBukaPendaftaran);
    }
  }, [initialBukaPendaftaran]);

  useEffect(() => {
    if (initialTahunAjaran) {
      setTahunAjaran(initialTahunAjaran);
    }
  }, [initialTahunAjaran]);

  // Track window scroll for floating header
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setIsScrolled(scrollY > 25);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check registration status if not provided via props
  useEffect(() => {
    if (initialBukaPendaftaran !== null && initialBukaPendaftaran !== undefined) return;

    fetch(API_ENDPOINTS.PENDAFTARAN.PENGUMUMAN)
      .then((res) => res.json())
      .then((status) => {
        if (typeof status?.bukaPendaftaran === 'boolean') {
          setBukaPendaftaran(status.bukaPendaftaran);
        }
        if (status?.tahunAjaran) {
          setTahunAjaran(status.tahunAjaran);
        }
      })
      .catch((err) => console.error(err));
  }, [initialBukaPendaftaran]);

  const handleAuthClick = (e: React.MouseEvent) => {
    if (bukaPendaftaran === false) {
      e.preventDefault();
      setIsClosedModalOpen(true);
    }
  };

  // Typewriter State for Header Brand Title
  const [typedBrand, setTypedBrand] = useState('');
  const fullBrandText = 'SMK MUHAMMADIYAH SEKAMPUNG';
  const [isDeletingBrand, setIsDeletingBrand] = useState(false);
  const [brandSpeed, setBrandSpeed] = useState(110);

  // Initialize Theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('user_theme') || localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('user_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      localStorage.setItem('user_theme', 'light');
    }
  };

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

  const prefix = isHome ? '' : '/';

  return (
    <>
      {/* ========================================================
                FIXED FLOATING HEADER (ALWAYS FOLLOWS SCROLL)
            ======================================================== */}
      <header className="fixed top-0 inset-x-0 z-40 pointer-events-none transition-all duration-300">
        {/* 1. TOP INFO BAR */}
        <div
          className={`transition-all duration-300 overflow-hidden pointer-events-auto bg-slate-100 dark:bg-slate-900 text-[11px] text-slate-600 dark:text-slate-400 px-4 sm:px-8 ${isScrolled
            ? 'max-h-0 opacity-0 -translate-y-full py-0 border-transparent'
            : 'max-h-12 opacity-100 translate-y-0 py-1.5 border-b border-slate-200 dark:border-slate-800'
            }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            {/* Left: Location & Contact */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate sm:hidden text-[10px]">{profil?.alamatLengkap || 'Sekampung, Lampung Timur'}</span>
                <span className="hidden sm:inline truncate">{profil?.alamatLengkap || 'JL. RAYA SEKAMPUNG, Kec. Sekampung, Kab. Lampung Timur, Prov. Lampung.'}</span>
              </div>
              <a
                href={`mailto:${profil?.emailResmi || 'smkmuhsekampung@gmail.com'}`}
                className="hidden md:flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{profil?.emailResmi || 'smkmuhsekampung@gmail.com'}</span>
              </a>
            </div>

            {/* Right: Accreditation & Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-[11px] whitespace-nowrap">
                <span className="hidden sm:inline">NPSN: 10814962 • </span>Akreditasi A
              </span>
              <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
              <motion.button
                whileTap={{ scale: 0.85, rotate: 180 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                onClick={toggleTheme}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                aria-label="Ganti Tema"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* 2. MAIN NAVBAR (FLOATING PILL ON SCROLL) */}
        <div
          className={`transition-all duration-300 pointer-events-none ${isScrolled
            ? 'pt-2.5 sm:pt-4 px-3 sm:px-6 lg:px-8'
            : 'pt-0 px-0'
            }`}
        >
          <div
            className={`max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4 transition-all duration-300 pointer-events-auto ${isScrolled
              ? 'h-16 sm:h-18 px-3.5 sm:px-6 rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 shadow-xl shadow-slate-900/8 dark:shadow-black/50'
              : 'h-18 sm:h-20 px-4 sm:px-8 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs'
              }`}
          >
            {/* Brand Logo & Name With Typewriter Effect */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3.5 group min-w-0 flex-1 lg:flex-initial lg:shrink-0">
              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center justify-center shrink-0 transition-all duration-300 ${isScrolled ? 'w-9 h-9 sm:w-12 sm:h-12 lg:w-14 lg:h-14' : 'w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16'
                  }`}
              >
                <img
                  src={
                    profil?.logoUrl
                      ? profil.logoUrl.startsWith('/uploads/')
                        ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + profil.logoUrl
                        : profil.logoUrl
                      : '/logo.png'
                  }
                  onError={(e) => {
                    e.currentTarget.src = '/logo.svg';
                  }}
                  alt="Logo SMK Muhammadiyah Sekampung"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </motion.div>
              <div className="min-w-0 flex-1 lg:w-[290px] lg:shrink-0 lg:flex-initial overflow-hidden">
                <div className="font-extrabold text-[11px] sm:text-base tracking-tight text-slate-900 dark:text-white uppercase leading-tight min-h-[18px] sm:min-h-[24px] flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
                  <span>{typedBrand || ' '}</span>
                  <span className="inline-block w-0.5 h-3 sm:h-5 bg-amber-500 ml-1 animate-pulse shrink-0" />
                </div>
                <div className="text-[9px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide truncate">
                  Pusat Keunggulan Vokasi
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links (Grouped Dropdowns dengan Ikon Kontekstual) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {/* 1. Beranda */}
              <Link
                href={`${prefix}#beranda`}
                className={`px-3 py-2 rounded-xl transition-colors ${activeMenu === 'beranda'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs'
                  : 'hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
              >
                Beranda
              </Link>

              {/* 2. Dropdown: Profil Sekolah */}
              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span>Profil Sekolah</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-slate-400 group-hover:text-emerald-600" />
                </button>

                <div className="absolute top-full left-0 pt-2 opacity-0 invisible -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <div className="w-64 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/60 space-y-1">
                    <Link
                      href={`${prefix}#sambutan`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Quote className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">
                          Sambutan
                        </div>
                        <div className="text-[10px] text-slate-400">Pesan dan visi pimpinan</div>
                      </div>
                    </Link>

                    <Link
                      href={`${prefix}#wks`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">
                          Pimpinan
                        </div>
                        <div className="text-[10px] text-slate-400">Wakil kepala sekolah</div>
                      </div>
                    </Link>

                    <Link
                      href={`${prefix}#guru`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">
                          Dewan Guru
                        </div>
                        <div className="text-[10px] text-slate-400">Tenaga pendidik berkualitas</div>
                      </div>
                    </Link>

                    <Link
                      href={`${prefix}#mitra`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">
                          Mitra Industri
                        </div>
                        <div className="text-[10px] text-slate-400">Kerjasama dunia kerja</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 3. Dropdown: Akademik & Keahlian */}
              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span>Akademik</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-slate-400 group-hover:text-emerald-600" />
                </button>

                <div className="absolute top-full left-0 pt-2 opacity-0 invisible -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <div className="w-64 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/60 space-y-1">
                    <Link
                      href={`${prefix}#jurusan`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">
                          Program Keahlian
                        </div>
                        <div className="text-[10px] text-slate-400">8 Jurusan kompetensi unggulan</div>
                      </div>
                    </Link>

                    <Link
                      href={`${prefix}#keunggulan`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">
                          Keunggulan
                        </div>
                        <div className="text-[10px] text-slate-400">Standar mutu & fasilitas</div>
                      </div>
                    </Link>

                    <Link
                      href="/prestasi"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">
                          Prestasi Siswa
                        </div>
                        <div className="text-[10px] text-slate-400">Capaian juara daerah & nasional</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 4. Dropdown: Informasi */}
              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span>Informasi</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 text-slate-400 group-hover:text-emerald-600" />
                </button>

                <div className="absolute top-full left-0 pt-2 opacity-0 invisible -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                  <div className="w-64 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/60 space-y-1">
                    <Link
                      href="/berita"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">
                          Berita
                        </div>
                        <div className="text-[10px] text-slate-400">Pengumuman & artikel sekolah</div>
                      </div>
                    </Link>

                    <Link
                      href="/agenda"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">
                          Agenda
                        </div>
                        <div className="text-[10px] text-slate-400">Jadwal kegiatan & ujian</div>
                      </div>
                    </Link>

                    <Link
                      href="/galeri"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/item"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400">
                          Galeri
                        </div>
                        <div className="text-[10px] text-slate-400">Dokumentasi foto kegiatan</div>
                      </div>
                    </Link>

                    <Link
                      href="/pengumuman"
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group/item"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 flex items-center gap-1.5">
                          <span>Pengumuman</span>
                          <span className="px-1.5 py-0.5 bg-emerald-600 text-[9px] text-white rounded-full font-bold">Online</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Cek status kelulusan seleksi</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 5. Pengumuman Kelulusan (Navbar Menu Utama) */}
              <Link
                href="/pengumuman"
                className={`px-3 py-2 rounded-xl transition-colors ${activeMenu === 'pengumuman'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs'
                  : 'hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
              >
                Pengumuman
              </Link>

              {/* 5. Kontak */}
              <Link
                href={`${prefix}#kontak`}
                className={`px-3 py-2 rounded-xl transition-colors ${activeMenu === 'kontak'
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/70 dark:border-emerald-800/60'
                  : 'hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
              >
                Kontak
              </Link>
            </nav>

            {/* Right: Actions, CTA Button & Theme Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <Link
                href="/login"
                onClick={handleAuthClick}
                className="hidden sm:inline-block px-3.5 py-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/60 font-extrabold text-xs transition"
              >
                Masuk
              </Link>

              {/* Prominent Action Button */}
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/register"
                  onClick={handleAuthClick}
                  className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[11px] sm:text-xs tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Daftar SPMB</span>
                </Link>
              </motion.div>

              {/* Mobile Menu Hamburger */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Drawer with Accordion Groups */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto lg:hidden max-w-7xl mx-auto mt-2 bg-white dark:bg-slate-950 p-4 space-y-2 text-xs font-semibold shadow-2xl max-h-[calc(100vh-100px)] overflow-y-auto ${isScrolled
                  ? 'rounded-2xl border border-slate-200 dark:border-slate-800'
                  : 'border-b border-slate-200 dark:border-slate-800'
                  }`}
              >
                {/* 1. Beranda */}
                <Link
                  href={`${prefix}#beranda`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/60 dark:bg-emerald-950/40"
                >
                  Beranda
                </Link>

                {/* 2. Group: Profil Sekolah */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'profil' ? null : 'profil')}
                    className="w-full flex items-center justify-between p-3 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <span>Profil</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${mobileExpandedGroup === 'profil' ? 'rotate-180 text-emerald-600' : ''
                        }`}
                    />
                  </button>
                  {mobileExpandedGroup === 'profil' && (
                    <div className="p-2 space-y-1 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                      <Link
                        href={`${prefix}#sambutan`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                      >
                        <Quote className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sambutan</span>
                      </Link>
                      <Link
                        href={`${prefix}#wks`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pimpinan & Manajemen</span>
                      </Link>
                      <Link
                        href={`${prefix}#guru`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Dewan Guru & Tendik</span>
                      </Link>
                      <Link
                        href={`${prefix}#mitra`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                      >
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mitra Industri (DUDI)</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. Group: Akademik & Keahlian */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'akademik' ? null : 'akademik')}
                    className="w-full flex items-center justify-between p-3 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <span>Akademik & Keahlian</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${mobileExpandedGroup === 'akademik' ? 'rotate-180 text-emerald-600' : ''
                        }`}
                    />
                  </button>
                  {mobileExpandedGroup === 'akademik' && (
                    <div className="p-2 space-y-1 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                      <Link
                        href={`${prefix}#jurusan`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Program Keahlian (8 Jurusan)</span>
                      </Link>
                      <Link
                        href={`${prefix}#keunggulan`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Keunggulan Sekolah</span>
                      </Link>
                      <Link
                        href="/prestasi"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                      >
                        <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Prestasi Siswa</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 4. Group: Informasi */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setMobileExpandedGroup(mobileExpandedGroup === 'info' ? null : 'info')}
                    className="w-full flex items-center justify-between p-3 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <span>Informasi & Agenda</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${mobileExpandedGroup === 'info' ? 'rotate-180 text-emerald-600' : ''
                        }`}
                    />
                  </button>
                  {mobileExpandedGroup === 'info' && (
                    <div className="p-2 space-y-1 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                      <Link
                        href="/berita"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Berita & Kabar Terkini</span>
                      </Link>
                      <Link
                        href="/agenda"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                      >
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Agenda Kegiatan Sekolah</span>
                      </Link>
                      <Link
                        href="/galeri"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Galeri Foto Dokumentasi</span>
                      </Link>
                      <Link
                        href="/pengumuman"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 p-2 rounded-lg text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/70 dark:bg-emerald-950/40"
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pengumuman Kelulusan Online</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* 5. Pengumuman Kelulusan Mobile Direct */}
                <Link
                  href="/pengumuman"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition ${activeMenu === 'pengumuman'
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/40 dark:bg-emerald-950/20'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Pengumuman Kelulusan</span>
                  </span>
                </Link>

                {/* 5. Kontak */}
                <Link
                  href={`${prefix}#kontak`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-emerald-600"
                >
                  Kontak Sekretariat
                </Link>

                {/* Buttons */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                  <Link
                    href="/login"
                    onClick={(e) => {
                      if (bukaPendaftaran === false) {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        setIsClosedModalOpen(true);
                      }
                    }}
                    className="flex-1 py-2.5 text-center rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold"
                  >
                    Masuk Akun
                  </Link>
                  <Link
                    href="/register"
                    onClick={(e) => {
                      if (bukaPendaftaran === false) {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        setIsClosedModalOpen(true);
                      }
                    }}
                    className="flex-1 py-2.5 text-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md"
                  >
                    Daftar SPMB
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Header Spacer (keeps page content properly positioned below fixed header) */}
      <div className="h-[108px] sm:h-[116px] shrink-0 pointer-events-none" />

      {/* Modal Notifikasi Jika Pendaftaran Ditutup Admin */}
      <RegistrationClosedModal
        isOpen={isClosedModalOpen}
        onClose={() => setIsClosedModalOpen(false)}
        tahunAjaran={tahunAjaran}
        forceRedirectHome={false}
      />
    </>
  );
}
