'use client';

import { motion } from 'framer-motion';

interface LandingLoaderProps {
  text?: string;
  subtext?: string;
  isFullScreen?: boolean;
}

export default function LandingLoader({
  text = 'Memuat...',
  subtext = 'SMK Muhammadiyah Sekampung',
  isFullScreen = true,
}: LandingLoaderProps) {
  return (
    <div
      className={`${isFullScreen
        ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white select-none'
        : 'w-full h-full min-h-screen flex flex-col items-center justify-center bg-white select-none p-6'
        }`}
    >
      {/* Container Loader */}
      <div className="relative flex flex-col items-center justify-center select-none">
        {/* Glow ambient lembut bertema Emerald */}
        {/* <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" /> */}

        {/* Modern Classic Spinner (Hollow Center - Tanpa Logo) */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
          <svg
            viewBox="0 0 64 64"
            className="w-full h-full filter drop-shadow-xs"
          >
            <defs>
              {/* Gradien Emerald Modern khas SMK MUSKA */}
              <linearGradient id="spinner-muska-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            {/* 1. Track Cincin Latar Belakang (Gaya Klasik) */}
            <circle
              cx="32"
              cy="32"
              r="25"
              fill="none"
              strokeWidth="4.5"
              stroke="#e2e8f0"
            />

            {/* 2. Busur Spinner Aktif (Gaya Modern dengan Rotasi & Panjang Adaptif) */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ transformOrigin: '32px 32px' }}
            >
              <motion.circle
                cx="32"
                cy="32"
                r="25"
                fill="none"
                stroke="url(#spinner-muska-gradient)"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray="157"
                animate={{
                  strokeDashoffset: [125, 35, 125],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.g>
          </svg>
        </div>

        {/* Teks Status Loading */}
        <div className="mt-5 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 tracking-wide">
            <span>{text}</span>
          </div>
          {subtext && (
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
