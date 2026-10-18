'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, Moon, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';
import ChatbotRAG from '@/components/ChatbotRAG';

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

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('user_theme');
        if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
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
        } catch (error) {
            setErrorMsg('Gagal terhubung ke server backend API (port 3001). Pastikan server NestJS sedang berjalan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center py-12 px-4 font-sans overflow-x-hidden">
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

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/70 dark:border-slate-800 overflow-hidden transition-colors duration-200">
                {/* Header Accent Line */}
                <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500"></div>

                <div className="p-8 sm:p-10">
                    {/* Header with School Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 p-2 mb-3">
                            <img
                                src="/logo.png"
                                alt="Logo SMK Muhammadiyah Sekampung"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Selamat Datang
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Portal SPMB SMK Muhammadiyah Sekampung
                        </p>
                    </div>

                    {/* Error Notice */}
                    {errorMsg && (
                        <div className="p-4 rounded-xl text-xs sm:text-sm font-medium mb-6 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 transition-all flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                            >
                                Alamat Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="siswa@email.com"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                                >
                                    Kata Sandi
                                </label>
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold rounded-xl shadow-lg shadow-emerald-700/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    <span>Memverifikasi Akun...</span>
                                </>
                            ) : (
                                <>
                                    <span>Masuk ke Dashboard</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Belum punya akun pendaftaran?{' '}
                        <Link
                            href="/register"
                            className="font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2 transition"
                        >
                            Daftar Sekarang
                        </Link>
                    </div>
                </div>
            </div>

            {/* Floating RAG Chatbot (Siap Menjawab Pertanyaan Calon Siswa & Ortu) */}
            <ChatbotRAG />
        </div>
    );
}