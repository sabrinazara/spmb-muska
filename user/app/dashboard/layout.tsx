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
    ChevronDown,
    User,
    Loader2,
    AlertCircle,
    Clock,
    Sun,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [user, setUser] = useState<UserSession | null>(null);
    const [statusPendaftaran, setStatusPendaftaran] = useState<string>('PENDING');

    // Theme state (Dark / Light mode)
    const [isDark, setIsDark] = useState(false);

    // Live Clock State
    const [currentTime, setCurrentTime] = useState<string>('');

    // Collapsible Groups state
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        pendaftaran: true,
        ujian: true,
    });

    // Real-time Indonesian Clock
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
            const timeStr = now.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
            setCurrentTime(`${dateStr} • ${timeStr} WIB`);
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Initialize Theme & Auth
    useEffect(() => {
        const savedTheme = localStorage.getItem('user_theme');
        if (savedTheme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }

        const savedCollapsed = localStorage.getItem('user_sidebar_collapsed');
        if (savedCollapsed === 'true') {
            setIsCollapsed(true);
        }

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
            } catch {
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
            .catch(() => { });
    }, [router]);

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

    const toggleCollapse = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        localStorage.setItem('user_sidebar_collapsed', String(next));
    };

    const toggleGroup = (key: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const navGroups = [
        {
            key: 'pendaftaran',
            title: 'Tahapan Pendaftaran',
            items: [
                {
                    label: 'Data Diri',
                    href: '/dashboard/lengkapi-data',
                    icon: FileText,
                },
                {
                    label: 'Upload Dokumen',
                    href: '/dashboard/upload',
                    icon: UploadCloud,
                },
                {
                    label: 'Status Verifikasi',
                    href: '/dashboard/status',
                    icon: CheckCircle2,
                },
            ],
        },
        {
            key: 'ujian',
            title: 'Ujian & Kelulusan',
            items: [
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
            ],
        },
    ];

    const getPageTitle = () => {
        if (pathname === '/dashboard') return 'Beranda Alur Pendaftaran';
        if (pathname === '/dashboard/lengkapi-data') return 'Formulir Kelengkapan Data Siswa';
        if (pathname === '/dashboard/upload') return 'Unggah Dokumen & Verifikasi OCR';
        if (pathname === '/dashboard/status') return 'Status Validasi Pendaftaran';
        if (pathname === '/dashboard/kartu-ujian') return 'Kartu Peserta Ujian CBT';
        if (pathname === '/dashboard/kelulusan') return 'Pengumuman Hasil Seleksi';
        return 'Portal Pendaftaran Siswa';
    };

    return (
        <div className={`min-h-screen flex font-sans antialiased transition-colors duration-200 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
            }`}>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
                />
            )}

            {/* Sidebar Navigation - Adaptive Dark & Light Modes */}
            <aside
                className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 border-r flex flex-col justify-between shrink-0 h-screen transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:w-20 w-64' : 'w-64'
                    } ${isDark
                        ? 'bg-slate-950 border-slate-800/80 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                    } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex flex-col flex-1 min-h-0">
                    {/* Sidebar Brand Header */}
                    <div className={`h-16 flex items-center border-b transition-colors ${isCollapsed ? 'lg:justify-center justify-between px-3' : 'justify-between px-4'
                        } ${isDark ? 'border-slate-800/80 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'
                        }`}>
                        <Link
                            href="/dashboard"
                            className={`flex items-center gap-3 group min-w-0 ${isCollapsed ? 'lg:justify-center' : ''}`}
                            title="SMK Muhammadiyah Sekampung"
                        >
                            <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-700/80 p-1 flex items-center justify-center border border-emerald-600/40 overflow-hidden shadow-xs">
                                <img
                                    src="/logo.png"
                                    onError={(e) => {
                                        e.currentTarget.src = '/logo.svg';
                                    }}
                                    alt="Logo SMK Muhammadiyah Sekampung"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className={`min-w-0 transition-all duration-200 ${isCollapsed ? 'lg:hidden block' : 'block'}`}>
                                <div className={`text-[13px] font-bold tracking-tight leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'
                                    }`}>
                                    SMK Muhammadiyah
                                </div>
                                <div className={`text-[13px] font-extrabold tracking-wider truncate  ${isDark ? 'text-white' : 'text-slate-900'
                                    }`}>
                                    Sekampung
                                </div>
                            </div>
                        </Link>

                        {/* Minimize Sidebar Button (Desktop Only, hidden when collapsed to prevent overflow) */}
                        {/* <button
                            onClick={toggleCollapse}
                            className={`hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer ${isCollapsed ? 'hidden' : 'block'
                                }`}
                            title="Kecilkan Sidebar"
                            aria-label="Toggle Minimize Sidebar"
                        >
                            <PanelLeftClose className="w-4 h-4" />
                        </button> */}

                        {/* Close Drawer Button (Mobile Only) */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            aria-label="Tutup Menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Nav Items List */}
                    <nav className="flex-1 overflow-y-auto p-3 space-y-2">
                        {/* Standalone: Beranda */}
                        <div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5 ${isCollapsed ? 'lg:hidden block' : 'block'
                                } ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Utama
                            </div>

                            <Link
                                href="/dashboard"
                                onClick={() => setSidebarOpen(false)}
                                title={isCollapsed ? 'Beranda' : undefined}
                                className={`flex items-center gap-3 rounded-xl text-xs font-semibold transition-all ${isCollapsed
                                        ? 'lg:justify-center lg:px-0 lg:w-11 lg:h-11 lg:mx-auto px-3 py-2.5'
                                        : 'px-3 py-2.5'
                                    } ${pathname === '/dashboard'
                                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                        : isDark
                                            ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                            : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80'
                                    }`}
                            >
                                <Home className={`w-4 h-4 shrink-0 ${pathname === '/dashboard' ? 'text-white' : 'text-emerald-500'}`} />
                                <span className={`truncate ${isCollapsed ? 'lg:hidden block' : 'block'}`}>
                                    Beranda
                                </span>
                            </Link>
                        </div>

                        {/* Collapsible Groups */}
                        {navGroups.map((group) => {
                            const isGroupOpen = openGroups[group.key] ?? true;
                            const hasActiveChild = group.items.some((i) => pathname === i.href);

                            return (
                                <div key={group.key} className="pt-2">
                                    {/* Group Title for Expanded & Mobile */}
                                    <button
                                        onClick={() => toggleGroup(group.key)}
                                        className={`w-full items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${isCollapsed ? 'lg:hidden flex' : 'flex'
                                            } ${hasActiveChild
                                                ? isDark ? 'text-emerald-400 font-extrabold' : 'text-emerald-700 font-extrabold'
                                                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                    >
                                        <span>{group.title}</span>
                                        <ChevronDown
                                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isGroupOpen ? 'rotate-0' : '-rotate-90'
                                                }`}
                                        />
                                    </button>

                                    {/* Desktop Collapsed Divider */}
                                    <div className={`h-px my-2 ${isCollapsed ? 'lg:block hidden' : 'hidden'} ${isDark ? 'bg-slate-800/80' : 'bg-slate-200'
                                        }`} />

                                    {/* Sub-items (Always visible on collapsed desktop as icon buttons, toggleable on mobile/expanded) */}
                                    {(isGroupOpen || isCollapsed) && (
                                        <div className="mt-1 space-y-1">
                                            {group.items.map((item) => {
                                                const isActive = pathname === item.href;
                                                const IconComponent = item.icon;

                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setSidebarOpen(false)}
                                                        title={isCollapsed ? item.label : undefined}
                                                        className={`flex items-center gap-3 rounded-xl text-xs font-semibold transition-all ${isCollapsed
                                                                ? 'lg:justify-center lg:px-0 lg:w-11 lg:h-11 lg:mx-auto px-3 py-2'
                                                                : 'px-3 py-2'
                                                            } ${isActive
                                                                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                                                : isDark
                                                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                                                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80'
                                                            }`}
                                                    >
                                                        <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                                        <span className={`truncate ${isCollapsed ? 'lg:hidden block' : 'block'}`}>
                                                            {item.label}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer: User Card & Status with Logout */}
                <div className={`p-3 border-t transition-colors ${isDark ? 'border-slate-800/80 bg-slate-950/80' : 'border-slate-200 bg-slate-50/80'
                    }`}>
                    {/* User info: Full view on mobile & expanded desktop, compact icon view on collapsed desktop */}
                    <div className={isCollapsed ? 'lg:hidden block' : 'block'}>
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${isDark
                                    ? 'bg-emerald-900/60 border-emerald-700/40 text-emerald-400'
                                    : 'bg-emerald-100 border-emerald-200 text-emerald-800'
                                }`}>
                                <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {user?.nama || 'Calon Siswa'}
                                </div>
                                <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {user?.email || 'Calon Siswa Baru'}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer border ${isDark
                                    ? 'text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20'
                                    : 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200'
                                }`}
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Keluar Akun</span>
                        </button>
                    </div>

                    {/* Collapsed Desktop View */}
                    <div className={`space-y-2 ${isCollapsed ? 'lg:flex lg:flex-col lg:items-center hidden' : 'hidden'}`}>
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border cursor-default ${isDark
                                    ? 'bg-emerald-900/60 border-emerald-700/40 text-emerald-400'
                                    : 'bg-emerald-100 border-emerald-200 text-emerald-800'
                                }`}
                            title={`${user?.nama || 'Calon Siswa'} (${user?.email || ''})`}
                        >
                            <User className="w-4 h-4" />
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Keluar dari akun"
                            className="w-10 h-10 flex items-center justify-center text-rose-500 hover:text-white hover:bg-rose-600 rounded-xl transition cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className={`h-16 border-b sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors ${isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white/80 border-slate-200'
                    }`}>
                    {/* Left: Mobile hamburger & Desktop Minimize & Breadcrumb */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className={`lg:hidden p-2 rounded-xl cursor-pointer ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            aria-label="Buka Menu Navigasi"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Desktop Sidebar Minimize / Expand Toggle */}
                        <button
                            onClick={toggleCollapse}
                            className={`hidden lg:flex p-2 rounded-xl transition cursor-pointer ${isDark
                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            title={isCollapsed ? 'Perluas Sidebar' : 'Kecilkan Sidebar'}
                            aria-label="Toggle Minimize Sidebar"
                        >
                            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                        </button>

                        {/* Breadcrumb Info */}
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Portal Siswa</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{getPageTitle()}</span>
                        </div>
                    </div>

                    {/* Right: Live Indonesian Clock, Theme Switcher & Status Badge */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* Live Clock Widget */}
                        {currentTime && (
                            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium shadow-2xs ${isDark
                                    ? 'bg-slate-950 text-emerald-400 border-slate-800'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>{currentTime}</span>
                            </div>
                        )}

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-xl transition cursor-pointer ${isDark
                                    ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                                }`}
                            title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                            aria-label="Toggle Theme"
                        >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {/* Status Verification Badge */}
                        {statusPendaftaran === 'VALID' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="hidden sm:inline">Berkas</span>
                                <span>Terverifikasi</span>
                            </span>
                        ) : statusPendaftaran === 'INVALID' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Perlu Perbaikan</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                                <span>Verifikasi Berkas</span>
                            </span>
                        )}
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
