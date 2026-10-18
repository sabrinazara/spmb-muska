'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Home,
    FileText,
    UploadCloud,
    CheckCircle2,
    Award,
    CreditCard,
    LogOut,
    Menu,
    X,
    ChevronRight,
    User,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/api';
import ChatbotRAG from '@/components/ChatbotRAG';

interface UserSession {
    userId?: string;
    nama?: string;
    email?: string;
    role?: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<UserSession | null>(null);
    const [statusPendaftaran, setStatusPendaftaran] = useState<string>('PENDING');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
            } catch (e) {
                // Ignore parse error
            }
        }

        fetch(API_ENDPOINTS.PENDAFTARAN.STATUS, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data && data.status) {
                    setStatusPendaftaran(data.status);
                    if (data.namaLengkap) {
                        setUser(prev => ({ ...prev, nama: data.namaLengkap }));
                    }
                }
            })
            .catch(() => {});
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const navItems = [
        {
            label: 'Beranda',
            href: '/dashboard',
            icon: Home,
        },
        {
            label: 'Lengkapi Data',
            href: '/dashboard/lengkapi-data',
            icon: FileText,
        },
        {
            label: 'Upload Dokumen',
            href: '/dashboard/upload',
            icon: UploadCloud,
        },
        {
            label: 'Status Pendaftaran',
            href: '/dashboard/status',
            icon: CheckCircle2,
        },
        {
            label: 'Kartu Peserta Ujian',
            href: '/dashboard/kartu-ujian',
            icon: CreditCard,
        },
        {
            label: 'Pengumuman Kelulusan',
            href: '/dashboard/kelulusan',
            icon: Award,
        },
    ];

    const getPageTitle = () => {
        if (pathname === '/dashboard') return 'Beranda';
        if (pathname === '/dashboard/lengkapi-data') return 'Formulir Kelengkapan Data';
        if (pathname === '/dashboard/upload') return 'Unggah Dokumen Persyaratan';
        if (pathname === '/dashboard/status') return 'Status Pendaftaran';
        if (pathname === '/dashboard/kartu-ujian') return 'Kartu Peserta Ujian';
        if (pathname === '/dashboard/kelulusan') return 'Pengumuman Hasil Seleksi';
        return 'Dashboard Siswa';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans antialiased">
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
                />
            )}

            {/* Sidebar Navigation */}
            <aside
                className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 w-64 bg-[#064e3b] text-white flex flex-col justify-between shrink-0 h-screen transition-transform duration-300 ease-in-out border-r border-emerald-950/40 shadow-xl lg:shadow-none ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="flex flex-col flex-1 min-h-0">
                    {/* Sidebar Brand Header */}
                    <div className="h-20 flex items-center px-5 border-b border-emerald-800/60 bg-[#053e2f]">
                        <Link href="/dashboard" className="flex items-center gap-3 group w-full">
                            <div className="w-11 h-11 shrink-0 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-emerald-600/30 overflow-hidden shadow-inner">
                                <img
                                    src="/logo.png"
                                    onError={(e) => {
                                        e.currentTarget.src = '/logo.svg';
                                    }}
                                    alt="Logo SMK Muhammadiyah Sekampung"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[13px] font-bold text-white tracking-tight leading-tight truncate group-hover:text-amber-300 transition">
                                    SMK Muhammadiyah
                                </div>
                                <div className="text-xs font-semibold text-amber-400 tracking-wide uppercase">
                                    Sekampung
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Nav Items List */}
                    <div className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
                        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/60">
                            Menu Pendaftar
                        </div>

                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-emerald-800/90 text-amber-300 font-semibold shadow-inner border-l-4 border-amber-400 pl-3'
                                            : 'text-emerald-100/90 hover:bg-emerald-800/40 hover:text-white'
                                    }`}
                                >
                                    <span className={`${isActive ? 'text-amber-400' : 'text-emerald-300'}`}>
                                        <IconComponent className="w-5 h-5" />
                                    </span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar Footer: User Card & Status */}
                <div className="p-4 border-t border-emerald-800/60 bg-[#053e2f]">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-400 flex items-center justify-center shrink-0 border border-emerald-700/50">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">
                                    {user?.nama || 'Calon Siswa'}
                                </div>
                                <div className="text-[10px] text-emerald-300/80 truncate">
                                    {user?.email || 'Calon Siswa Baru'}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            title="Keluar dari akun"
                            className="p-2 text-rose-300 hover:text-white hover:bg-rose-900/40 rounded-lg transition shrink-0 cursor-pointer"
                            aria-label="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="bg-white border-b border-slate-200/90 h-16 sticky top-0 z-30 shadow-2xs">
                    <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                        {/* Left: Mobile hamburger & Breadcrumb */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer"
                                aria-label="Buka Menu Navigasi"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                <span className="text-slate-400">Portal Siswa</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                <span className="font-bold text-slate-800">{getPageTitle()}</span>
                            </div>
                        </div>

                        {/* Right: Status Pill & Logout Button */}
                        <div className="flex items-center gap-3">
                            {statusPendaftaran === 'VALID' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Terverifikasi</span>
                                </span>
                            ) : statusPendaftaran === 'INVALID' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Perlu Perbaikan</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                    <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                                    <span>Menunggu Verifikasi</span>
                                </span>
                            )}

                            <button
                                onClick={handleLogout}
                                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition shadow-2xs cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Keluar</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Floating RAG Chatbot */}
            <ChatbotRAG />
        </div>
    );
}
