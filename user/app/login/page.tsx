'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

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
        <div className="min-h-screen flex items-center justify-center py-10 px-4 bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                {/* Header Accent Line */}
                <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500"></div>

                <div className="p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-md border border-slate-100 p-2 mb-3">
                            <img
                                src="/logo.png"
                                alt="Logo SMK Muhammadiyah Sekampung"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                            Selamat Datang
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Portal SPMB SMK Muhammadiyah Sekampung
                        </p>
                    </div>

                    {/* Error Notice */}
                    {errorMsg && (
                        <div className="p-4 rounded-xl text-sm font-medium mb-6 bg-rose-50 text-rose-800 border border-rose-200 transition-all flex items-center gap-2">
                            <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
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
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
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
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold rounded-xl shadow-lg shadow-emerald-700/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        ></path>
                                    </svg>
                                    <span>Memverifikasi Akun...</span>
                                </>
                            ) : (
                                <span>Masuk ke Dashboard</span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
                        Belum punya akun pendaftaran?{' '}
                        <Link
                            href="/register"
                            className="font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2"
                        >
                            Daftar Sekarang
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}