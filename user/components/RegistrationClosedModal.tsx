'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Lock,
  ArrowLeft,
  Calendar,
  AlertCircle,
  HelpCircle,
  Phone,
  Building,
  CheckCircle2,
} from 'lucide-react';

interface RegistrationClosedModalProps {
  isOpen: boolean;
  onClose?: () => void;
  tahunAjaran?: string;
  forceRedirectHome?: boolean;
  customTitle?: string;
  customDescription?: string;
}

export default function RegistrationClosedModal({
  isOpen,
  onClose,
  tahunAjaran = '2026/2027',
  forceRedirectHome = false,
  customTitle,
  customDescription,
}: RegistrationClosedModalProps) {
  const router = useRouter();

  const handleReturnHome = () => {
    if (onClose) onClose();
    router.push('/');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={!forceRedirectHome ? onClose : undefined}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-amber-500/30 dark:border-amber-500/25 rounded-3xl shadow-2xl shadow-slate-950/50 overflow-hidden z-10"
          >
            {/* Top Accent Strip */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {/* Top Icon & Status Badge */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                    <Lock className="w-8 h-8" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white dark:border-slate-900"></span>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Pendaftaran Sedang Ditutup</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 leading-snug">
                  {customTitle || 'Pemberitahuan Pendaftaran SPMB'}
                </h3>

                {/* Tahun Ajaran Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium mb-4">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Tahun Ajaran: <strong className="font-bold text-slate-900 dark:text-white">{tahunAjaran}</strong></span>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {customDescription || (
                    <>
                      Mohon maaf, saat ini akses pendaftaran siswa baru maupun akun login pendaftar untuk{' '}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        SMK Muhammadiyah Sekampung
                      </span>{' '}
                      sedang <span className="text-amber-600 dark:text-amber-400 font-bold">ditutup sementara</span> atau telah berakhir untuk periode ini.
                    </>
                  )}
                </p>

                {/* Information Card */}
                <div className="w-full text-left bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 mb-6 text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Anda tetap dapat melihat profil sekolah, visi misi, fasilitas, dan 8 program keahlian unggulan.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>Informasi pembukaan gelombang pendaftaran selanjutnya akan diumumkan secara resmi pada halaman beranda.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <span>Butuh bantuan panitia? Hubungi sekretariat: <strong>0813-7765-3555</strong> / <strong>smkmuhsekampung@gmail.com</strong></span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex flex-col sm:flex-row gap-3">
                  {forceRedirectHome ? (
                    <button
                      type="button"
                      onClick={handleReturnHome}
                      className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali ke Halaman Beranda</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition shadow-md hover:shadow-lg cursor-pointer"
                      >
                        Jelajahi Profil & Jurusan
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition cursor-pointer"
                      >
                        Tutup
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
