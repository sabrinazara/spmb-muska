'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        namaLengkap: '',
        email: '',
        password: '',
        nik: '',
        nisn: '',
        jurusanPilihan: 'TKJ',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Registrasi berhasil! Anda akan dialihkan ke dashboard pendaftaran...',
                });

                if (data.access_token) {
                    localStorage.setItem('access_token', data.access_token);
                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }
                }

                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                setMessage({
                    type: 'error',
                    text: data.message || 'Terjadi kesalahan saat registrasi.',
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Gagal terhubung ke server backend (port 3000). Pastikan API aktif.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-10 px-4 bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                {/* Header Strip */}
                <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500"></div>

                <div className="p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-xl mb-3 shadow-inner">
                            MUSKA
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                            Pendaftaran Akun Baru
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Portal SPMB SMK Muhammadiyah 1 Wonosobo
                        </p>
                    </div>

                    {/* Alert Message */}
                    {message && (
                        <div
                            className={`p-4 rounded-xl text-sm font-medium mb-6 transition-all ${
                                message.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                {message.type === 'success' ? (
                                    <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                )}
                                <span>{message.text}</span>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                name="namaLengkap"
                                required
                                value={formData.namaLengkap}
                                onChange={handleChange}
                                placeholder="Contoh: Muhammad Faiz"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Alamat Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="siswa@email.com"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Kata Sandi
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimal 6 karakter"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    NIK (KTP / KK)
                                </label>
                                <input
                                    type="text"
                                    name="nik"
                                    required
                                    maxLength={16}
                                    value={formData.nik}
                                    onChange={handleChange}
                                    placeholder="16 digit NIK"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    NISN
                                </label>
                                <input
                                    type="text"
                                    name="nisn"
                                    required
                                    maxLength={10}
                                    value={formData.nisn}
                                    onChange={handleChange}
                                    placeholder="10 digit NISN"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Pilihan Program Keahlian (Jurusan)
                            </label>
                            <select
                                name="jurusanPilihan"
                                value={formData.jurusanPilihan}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                            >
                                <option value="TKJ">Teknik Jaringan Komputer dan Telekomunikasi (TKJ)</option>
                                <option value="TBSM">Teknik dan Bisnis Sepeda Motor (TBSM)</option>
                                <option value="TKR">Teknik Kendaraan Ringan Otomotif (TKR)</option>
                                <option value="AKL">Akuntansi dan Keuangan Lembaga (AKL)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold rounded-xl shadow-lg shadow-emerald-700/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    <span>Memproses Pendaftaran...</span>
                                </>
                            ) : (
                                <span>Daftar Sekarang</span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-500">
                        Sudah memiliki akun pendaftar?{' '}
                        <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2">
                            Masuk di sini
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}