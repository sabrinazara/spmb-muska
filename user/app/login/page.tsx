'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Sun,
    Moon,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Lock,
    Mail,
    Eye,
    EyeOff,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';
import ChatbotRAG from '@/components/ChatbotRAG';
import AuthLottiePanel from '@/components/AuthLottiePanel';
import JurusanMarquee from '@/components/JurusanMarquee';
import RegistrationClosedModal from '@/components/RegistrationClosedModal';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isDark, setIsDark] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [tahunAjaran, setTahunAjaran] = useState('2026/2027');

    useEffect(() => {
        const savedTheme = localStorage.getItem('user_theme');
        if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }

        // Cek status buka/tutup pendaftaran SPMB dari server
        fetch(API_ENDPOINTS.PENDAFTARAN.PENGUMUMAN)
            .then((res) => res.json())
            .then((status) => {
                if (status?.bukaPendaftaran === false) {
                    setIsClosed(true);
                }
                if (status?.tahunAjaran) {
                    setTahunAjaran(status.tahunAjaran);
                }
            })
            .catch((err) => console.error('Gagal memuat status pendaftaran:', err));
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            localStorage.setItem('user_theme', 'dark');
            document.documentElement.classList.add('dark');
        } else {
            localStorage.setItem('user_theme', 'light');
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isClosed) {
            return;
        }
        setLoading(true);
        setErrorMsg('');

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Simpan token JWT & data user ke localStorage
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem(
                    'user',
                    JSON.stringify({
                        userId: data.userId,
                        nama: data.nama,
                        role: data.role,
                        pendaftaran: data.pendaftaran,
                    })
                );

                // Arahkan langsung ke halaman dashboard pendaftaran siswa
                router.push('/dashboard');
            } else {
                setErrorMsg(data.message || 'Email atau kata sandi tidak cocok.');
            }
        } catch {
            setErrorMsg(
                'Gagal terhubung ke server backend API (port 3001). Pastikan server NestJS sedang berjalan.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between py-5 px-3 sm:px-6 lg:px-8 font-sans overflow-x-hidden transition-colors duration-200">
            {/* Top Bar Navigation */}
            <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-3">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 shadow-xs transition group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Kembali ke Beranda</span>
                </Link>

                {/* Tombol Darkmode & Lightmode */}
                <button
                    onClick={toggleTheme}
                    type="button"
                    aria-label={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-amber-300 shadow-xs hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-center"
                >
                    {isDark ? (
                        <Sun className="w-4 h-4 text-amber-300" />
                    ) : (
                        <Moon className="w-4 h-4 text-slate-700" />
                    )}
                </button>
            </div>

            {/* Main Card: Layout Sesuai Referensi Desain (Kiri: Panel Lottie Hijau Solid, Kanan: Form Putih Solid) */}
            <div className="max-w-5xl w-full mx-auto my-auto">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors duration-200">
                    {/* ========================================================
                        KIRI: PANEL BRANDING & ANIMASI LOTTIE (Hanya Desktop)
                    ======================================================== */}
                    <div className="hidden lg:flex lg:col-span-5 flex-col">
                        <AuthLottiePanel type="login" className="w-full h-full" />
                    </div>

                    {/* ========================================================
                        KANAN: FORM LOGIN CLEAN & MINIMALIST (7 Cols)
                    ======================================================== */}
                    <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
                        <div>
                            {/* Mobile School Brand (Hanya tampil di Mobile karena panel kiri disembunyikan) */}
                            <div className="flex items-center gap-3 mb-5 lg:hidden pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-xs">
                                    <img
                                        src="/logo.png"
                                        alt="Logo SMK Muhammadiyah Sekampung"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.src = '/logo.svg';
                                        }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase leading-tight truncate">
                                        SMK MUHAMMADIYAH SEKAMPUNG
                                    </h2>
                                    <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        Portal SPMB Online • Pusat Keunggulan
                                    </p>
                                </div>
                            </div>

                            {/* Header Form */}
                            <div className="mb-6">
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Masuk ke Akun
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Silakan masukkan email dan kata sandi Anda untuk melanjutkan.
                                </p>
                            </div>

                            {/* Error Notice */}
                            {errorMsg && (
                                <div className="p-3.5 rounded-2xl text-xs sm:text-sm font-medium mb-6 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 transition-all flex items-start gap-2.5">
                                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {/* Form Login */}
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                                    >
                                        Alamat Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="siswa@email.com"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label
                                            htmlFor="password"
                                            className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                                        >
                                            Kata Sandi
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                            aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Memverifikasi Akun...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Masuk ke Akun</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Mobile Switch Link (Terlihat saat di layar HP jika panel kiri di-scroll) */}
                        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 lg:hidden">
                            Belum punya akun pendaftaran?{' '}
                            <Link
                                href="/register"
                                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-4"
                            >
                                Daftar Sekarang
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Marquee Logo Jurusan (Bergerak Halus & Pause on Hover) */}
            <div className="max-w-5xl w-full mx-auto mt-4">
                <JurusanMarquee />
            </div>

            {/* Floating RAG Chatbot */}
            <ChatbotRAG />

            {/* Modal Notifikasi Jika Pendaftaran/Login Ditutup Admin */}
            <RegistrationClosedModal
                isOpen={isClosed}
                onClose={() => router.push('/')}
                tahunAjaran={tahunAjaran}
                forceRedirectHome={true}
                customTitle="Akses Masuk Siswa Ditutup Sementara"
                customDescription="Mohon maaf, layanan login dan akses akun pendaftar SPMB SMK Muhammadiyah Sekampung saat ini sedang ditutup sementara oleh pihak panitia. Silakan kembali ke halaman beranda."
            />
        </div>
    );
}