'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon, AlertCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';

function AnimatedBlitBackground({ isDark }: { isDark: boolean }) {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Latar Belakang Gradien Induk */}
            <div
                className={`absolute inset-0 transition-colors duration-500 ${
                    isDark
                        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40'
                        : 'bg-gradient-to-br from-emerald-50/80 via-slate-50 to-amber-50/70'
                }`}
            />

            {/* Pola Titik Grid Halus */}
            <div
                className={`absolute inset-0 opacity-[0.025] ${
                    isDark ? 'invert' : ''
                }`}
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Bulat Blit 1: Ambient Glowing Blob Hijau Zamrud (Kiri Atas) */}
            <div className="absolute -top-24 -left-24 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-emerald-500/20 dark:bg-emerald-500/15 blur-3xl animate-blit-float-1" />

            {/* Bulat Blit 2: Ambient Glowing Blob Emas / Amber (Kanan Bawah) */}
            <div className="absolute -bottom-28 -right-20 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-amber-400/20 dark:bg-amber-500/15 blur-3xl animate-blit-float-2" />

            {/* Bulat Blit 3: Ambient Blob Teal / Cyan (Tengah Kiri) */}
            <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full bg-teal-400/15 dark:bg-teal-500/10 blur-2xl animate-blit-float-3" />

            {/* === KELOMPOK BULAT BLIT BERGERAK & KEDIP HALUS === */}
            
            {/* Bulat Blit A: Cincin Glowing Emerald (Melayang di kanan atas) */}
            <div className="absolute top-20 right-10 sm:right-28 w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-emerald-500/40 dark:border-emerald-400/50 bg-emerald-500/10 dark:bg-emerald-400/20 backdrop-blur-xs shadow-lg shadow-emerald-500/20 animate-blit-float-1 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-300 animate-blit-pulse" />
            </div>

            {/* Bulat Blit B: Cincin Glowing Amber / Gold (Melayang di kiri bawah) */}
            <div className="absolute bottom-24 left-8 sm:left-24 w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-amber-400/40 dark:border-amber-400/50 bg-amber-400/10 dark:bg-amber-400/20 backdrop-blur-xs shadow-lg shadow-amber-500/20 animate-blit-float-2 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-300 animate-blit-pulse-delay-1" />
            </div>

            {/* Bulat Blit C: Cincin Halus Teal (Mengapung di kanan tengah) */}
            <div className="absolute top-2/3 right-8 sm:right-20 w-12 h-12 rounded-full border border-teal-400/30 dark:border-teal-400/40 bg-teal-400/10 dark:bg-teal-400/15 animate-blit-float-3 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-teal-300 animate-blit-pulse-delay-2" />
            </div>

            {/* Bulat Blit D: Sparkle Kedip Smooth (Dekat Card Kiri) */}
            <div className="absolute top-36 left-1/4 w-3.5 h-3.5 rounded-full bg-emerald-400/80 dark:bg-emerald-300/90 shadow-md shadow-emerald-400/50 animate-blit-pulse" />

            {/* Bulat Blit E: Sparkle Kedip Smooth (Kanan Bawah Card) */}
            <div className="absolute bottom-36 right-1/4 w-3 h-3 rounded-full bg-amber-400/80 dark:bg-amber-300/90 shadow-md shadow-amber-400/50 animate-blit-pulse-delay-2" />

            {/* Bulat Blit F: Orbiting Mini Dot (Kiri Tengah) */}
            <div className="absolute top-1/3 left-10 w-2 h-2 rounded-full bg-teal-400/80 dark:bg-teal-300 shadow-xs shadow-teal-400/40 animate-blit-pulse-delay-1" />
        </div>
    );
}

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('admin@muska.sch.id');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('cms_theme');
        if (savedTheme === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }

        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('expired') === '1') {
                setErrorMsg('Sesi login Anda telah berakhir demi keamanan. Silakan masuk kembali.');
            } else if (params.get('forbidden') === '1') {
                setErrorMsg('Akses ditolak: Akun Anda tidak memiliki hak akses Administrator Panitia SPMB.');
            }
        }
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            localStorage.setItem('cms_theme', 'dark');
            document.documentElement.classList.add('dark');
        } else {
            localStorage.setItem('cms_theme', 'light');
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);

        try {
            const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Kredensial login tidak valid');
            }

            if (data.role !== 'ADMIN') {
                throw new Error('Akses ditolak: Akun ini tidak memiliki hak akses Administrator Panitia SPMB.');
            }

            // Simpan token & profil admin
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify({
                userId: data.userId,
                nama: data.nama || 'Administrator Panitia',
                email: email.trim(),
                role: data.role,
            }));

            router.push('/');
        } catch (err: any) {
            setErrorMsg(err.message || 'Gagal terhubung ke server backend');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 antialiased font-sans overflow-x-hidden">
            {/* Background Grafis Bulat Blit Bergerak & Kedip Halus */}
            <AnimatedBlitBackground isDark={isDark} />

            {/* Tombol Minimalist Darkmode & Lightmode */}
            <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40">
                <button
                    onClick={toggleTheme}
                    type="button"
                    aria-label={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                    className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-amber-300 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
                >
                    {isDark ? (
                        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 group-hover:rotate-45 text-amber-300" />
                    ) : (
                        <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 group-hover:-rotate-12 text-slate-700" />
                    )}
                </button>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Brand Header with Official School Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 p-2 mb-3">
                        <img
                            src="/logo.png"
                            alt="Logo SMK Muhammadiyah Sekampung"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        CMS Panel SPMB MUSKA
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Portal Verifikasi & Pengelolaan SMK Muhammadiyah Sekampung
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-colors duration-200">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                        <div>
                            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Autentikasi Panitia</span>
                            </h2>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Masuk menggunakan akun staf panitia SPMB
                            </p>
                        </div>
                        <span className="text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            SECURE ACCESS
                        </span>
                    </div>

                    {errorMsg && (
                        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 mb-5">
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                Email Panitia
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@muska.sch.id"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                Kata Sandi
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-3 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-700/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Memverifikasi Akses...</span>
                                </>
                            ) : (
                                <>
                                    <span>Masuk ke Panel CMS</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Sistem Informasi SPMB &copy; 2026 SMK Muhammadiyah Sekampung
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
