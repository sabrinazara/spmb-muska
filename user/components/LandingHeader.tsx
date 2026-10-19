'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';

interface LandingHeaderProps {
  activeMenu?: string;
  isHome?: boolean;
}

export default function LandingHeader({ activeMenu = 'beranda', isHome = false }: LandingHeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Typewriter State for Header Brand Title
  const [typedBrand, setTypedBrand] = useState('');
  const fullBrandText = 'SMK MUHAMMADIYAH SEKAMPUNG';
  const [isDeletingBrand, setIsDeletingBrand] = useState(false);
  const [brandSpeed, setBrandSpeed] = useState(110);

  // Initialize Theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
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
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
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
            <motion.a
              whileHover={{ y: -2 }}
              href={`${prefix}#beranda`}
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${
                activeMenu === 'beranda' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : ''
              }`}
            >
              Beranda
            </motion.a>
            <motion.a
              whileHover={{ y: -2 }}
              href={`${prefix}#sambutan`}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Sambutan
            </motion.a>
            <motion.a
              whileHover={{ y: -2 }}
              href={`${prefix}#wks`}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Pimpinan
            </motion.a>
            <motion.a
              whileHover={{ y: -2 }}
              href={`${prefix}#guru`}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Dewan Guru
            </motion.a>
            <motion.a
              whileHover={{ y: -2 }}
              href={`${prefix}#jurusan`}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Program Keahlian
            </motion.a>
            <motion.a
              whileHover={{ y: -2 }}
              href={`${prefix}#mitra`}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Mitra DUDI
            </motion.a>
            <Link
              href="/berita"
              className={`hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${
                activeMenu === 'berita' ? 'text-emerald-600 dark:text-emerald-400 font-extrabold underline underline-offset-4 decoration-2' : ''
              }`}
            >
              Berita
            </Link>
            <motion.a
              whileHover={{ y: -2 }}
              href={`${prefix}#kontak`}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
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
                href={`${prefix}#beranda`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Beranda
              </a>
              <a
                href={`${prefix}#sambutan`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Sambutan Kepala Sekolah
              </a>
              <a
                href={`${prefix}#wks`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Pimpinan Wakil Kepala Sekolah
              </a>
              <a
                href={`${prefix}#guru`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Dewan Guru & Tenaga Pendidik
              </a>
              <a
                href={`${prefix}#jurusan`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Program Keahlian (8 Jurusan)
              </a>
              <a
                href={`${prefix}#mitra`}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600"
              >
                Mitra Industri & DUDI
              </a>
              <Link
                href="/berita"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 font-bold"
              >
                Berita & Pengumuman
              </Link>
              <a
                href={`${prefix}#kontak`}
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
    </>
  );
}
