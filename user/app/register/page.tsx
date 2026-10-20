'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Sun,
    Moon,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    Loader2,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    IdCard,
    BookOpen,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';
import ChatbotRAG from '@/components/ChatbotRAG';
import VisiMisiPanel from '@/components/VisiMisiPanel';
import JurusanMarquee from '@/components/JurusanMarquee';
import RegistrationClosedModal from '@/components/RegistrationClosedModal';

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
                className={`absolute inset-0 opacity-[0.025] ${isDark ? 'invert' : ''}`}
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

            {/* Cincin Bulat Blit Animasi */}
            <div className="absolute top-20 right-10 sm:right-28 w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-emerald-500/40 dark:border-emerald-400/50 bg-emerald-500/10 dark:bg-emerald-400/20 backdrop-blur-xs shadow-lg shadow-emerald-500/20 animate-blit-float-1 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-300 animate-blit-pulse" />
            </div>

            <div className="absolute bottom-24 left-8 sm:left-24 w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-amber-400/40 dark:border-amber-400/50 bg-amber-400/10 dark:bg-amber-400/20 backdrop-blur-xs shadow-lg shadow-amber-500/20 animate-blit-float-2 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-300 animate-blit-pulse-delay-1" />
            </div>

            <div className="absolute top-2/3 right-8 sm:right-20 w-12 h-12 rounded-full border border-teal-400/30 dark:border-teal-400/40 bg-teal-400/10 dark:bg-teal-400/15 animate-blit-float-3 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-teal-300 animate-blit-pulse-delay-2" />
            </div>
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        namaLengkap: '',
        email: '',
        password: '',
        nik: '',
        nisn: '',
        jurusanPilihan: 'Teknik Jaringan Komputer dan Telekomunikasi',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isClosed) {
            return;
        }
        setLoading(true);
        setMessage(null);

        // Validasi Sederhana NIK & NISN
        if (formData.nik.length !== 16) {
            setMessage({ type: 'error', text: 'NIK harus terdiri dari 16 digit angka sesuai KTP/KK.' });
            setLoading(false);
            return;
        }

        if (formData.nisn.length !== 10) {
            setMessage({ type: 'error', text: 'NISN harus terdiri dari 10 digit angka resmi Kemdikbud.' });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Gagal mendaftar. Silakan periksa kembali data Anda.');
            }

            setMessage({
                type: 'success',
                text: 'Registrasi berhasil! Akun Anda telah dibuat. Mengalihkan ke halaman masuk...',
            });

            // Redirect ke login setelah 1.5 detik
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.message || 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 font-sans overflow-x-hidden">
            {/* Background Grafis Bulat Blit Bergerak & Kedip Halus */}
            <AnimatedBlitBackground isDark={isDark} />

            {/* Top Bar Navigation */}
            <div className="relative z-20 max-w-6xl w-full mx-auto flex items-center justify-between pt-1 pb-3">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 shadow-2xs transition group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Kembali ke Beranda</span>
                </Link>

                {/* Tombol Minimalist Darkmode & Lightmode */}
                <button
                    onClick={toggleTheme}
                    type="button"
                    aria-label={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                    className="p-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-amber-300 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
                >
                    {isDark ? (
                        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 group-hover:rotate-45 text-amber-300" />
                    ) : (
                        <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 group-hover:-rotate-12 text-slate-700" />
                    )}
                </button>
            </div>

            {/* Main Content: Split 2 Kolom (Kiri: Form Register, Kanan: Visi & Misi) */}
            <div className="relative z-10 max-w-6xl w-full mx-auto my-auto py-1">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors duration-200">
                    {/* Header Accent Line */}
                    <div className="lg:col-span-12 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />

                    {/* ========================================================
                        KIRI: FORM REGISTER (7 Cols)
                    ======================================================== */}
                    <div className="lg:col-span-7 p-5 sm:p-7 lg:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
                        <div>
                            {/* Header */}
                            <div className="mb-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 p-1.5 mb-2">
                                    <img
                                        src="/logo.png"
                                        alt="Logo SMK Muhammadiyah Sekampung"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Pendaftaran Akun Baru
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Daftarkan diri Anda sebagai calon peserta didik baru SMK Muhammadiyah Sekampung
                                </p>
                            </div>

                            {/* Alert Notice */}
                            {message && (
                                <div
                                    className={`p-4 rounded-2xl text-xs sm:text-sm font-medium mb-6 transition-all ${
                                        message.type === 'success'
                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                                    }`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        {message.type === 'success' ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                        )}
                                        <span>{message.text}</span>
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Nama Lengkap Sesuai Ijazah
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            name="namaLengkap"
                                            required
                                            value={formData.namaLengkap}
                                            onChange={handleChange}
                                            placeholder="Contoh: Muhammad Faiz Nizar"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm font-medium py-2.5"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Alamat Email
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="email@contoh.com"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm font-medium py-2.5"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Kata Sandi
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                required
                                                minLength={6}
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Minimal 6 karakter"
                                                className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm font-medium py-2.5"
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
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            NIK (16 Digit KTP/KK)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <IdCard className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                name="nik"
                                                required
                                                maxLength={16}
                                                value={formData.nik}
                                                onChange={handleChange}
                                                placeholder="16 digit NIK"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-mono text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            NISN (10 Digit Resmi)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <IdCard className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                name="nisn"
                                                required
                                                maxLength={10}
                                                value={formData.nisn}
                                                onChange={handleChange}
                                                placeholder="10 digit NISN"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                        Pilihan Program Keahlian (8 Jurusan)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <select
                                            name="jurusanPilihan"
                                            value={formData.jurusanPilihan}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm font-medium cursor-pointer"
                                        >
                                            <option value="Teknik Jaringan Komputer dan Telekomunikasi">Teknik Jaringan Komputer dan Telekomunikasi (TJKT)</option>
                                            <option value="Teknik Otomotif (Teknik Sepeda Motor)">Teknik Otomotif / Teknik Sepeda Motor (TO)</option>
                                            <option value="Desain Komunikasi Visual">Desain Komunikasi Visual (DKV)</option>
                                            <option value="Bisnis Digital dan Kreatif">Bisnis Digital dan Kreatif (BDK)</option>
                                            <option value="Kulineri (Tata Boga)">Kulineri / Tata Boga</option>
                                            <option value="Kecantikan dan Tata Rias">Kecantikan dan Tata Rias</option>
                                            <option value="Teknik Pemesinan (CNC)">Teknik Pemesinan / CNC</option>
                                            <option value="Teknik Pengelasan (Welding)">Teknik Pengelasan / Welding</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-4 py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Mendaftarkan Akun Anda...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Buat Akun Sekarang</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Footer Link to Login */}
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Sudah memiliki akun pendaftaran?{' '}
                            <Link
                                href="/login"
                                className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-4 transition"
                            >
                                Masuk di Sini
                            </Link>
                        </div>
                    </div>

                    {/* ========================================================
                        KANAN: VISI & MISI SMK MUHAMMADIYAH SEKAMPUNG (5 Cols)
                    ======================================================== */}
                    <div className="lg:col-span-5 flex">
                        <VisiMisiPanel className="w-full rounded-none lg:rounded-none" />
                    </div>
                </div>
            </div>

            {/* ========================================================
                BAWAH: LOGO SEMUA JURUSAN BERGERAK KIRI KE KANAN
            ======================================================== */}
            <div className="relative z-10 max-w-6xl w-full mx-auto">
                <JurusanMarquee />
            </div>

            {/* Floating RAG Chatbot */}
            <ChatbotRAG />

            {/* Modal Notifikasi Jika Pendaftaran Ditutup Admin */}
            <RegistrationClosedModal
                isOpen={isClosed}
                onClose={() => router.push('/')}
                tahunAjaran={tahunAjaran}
                forceRedirectHome={true}
                customTitle="Pendaftaran Siswa Baru Ditutup"
                customDescription="Mohon maaf, saat ini akses pendaftaran akun baru SPMB SMK Muhammadiyah Sekampung sedang tidak dibuka atau telah berakhir oleh pihak panitia. Silakan kembali ke halaman beranda."
            />
        </div>
    );
}