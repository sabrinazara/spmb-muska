'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Users,
    UserCog,
    BookOpen,
    ShieldCheck,
    LogOut,
    Menu,
    X,
    Bell,
    Sun,
    Moon,
    Sliders,
    ChevronRight,
    Loader2,
    Calendar,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api';

interface AdminUser {
    userId?: string;
    nama?: string;
    email?: string;
    role?: string;
}

interface NotificationItem {
    id: string;
    namaLengkap: string;
    nisn: string;
    jurusan: string;
    createdAt: string;
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Theme state (Dark/Light mode)
    const [isDark, setIsDark] = useState(true);

    // Notification dropdown state
    const [notifOpen, setNotifOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const notifRef = useRef<HTMLDivElement>(null);

    // Initialize Theme & Auth
    useEffect(() => {
        const savedTheme = localStorage.getItem('cms_theme');
        if (savedTheme === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }

        const token = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (!token) {
            router.push('/login');
            return;
        }

        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                if (parsed.role !== 'ADMIN') {
                    router.push('/login');
                    return;
                }
                setAdminUser(parsed);
            } catch {
                router.push('/login');
                return;
            }
        }
        setIsCheckingAuth(false);
    }, [router]);

    // Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.NOTIFICATIONS, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setPendingCount(data.pendingCount || 0);
                setNotifications(data.pendingList || []);
            }
        } catch (e) {
            console.error('Failed to fetch notifications:', e);
        }
    };

    useEffect(() => {
        if (!isCheckingAuth) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // 30s poll
            return () => clearInterval(interval);
        }
    }, [isCheckingAuth]);

    // Close notification on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        if (newTheme) {
            localStorage.setItem('cms_theme', 'dark');
            document.documentElement.classList.add('dark');
        } else {
            localStorage.setItem('cms_theme', 'light');
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const navigation = [
        {
            name: 'Dashboard Analytics',
            href: '/',
            exact: true,
            icon: LayoutDashboard,
        },
        {
            name: 'Manajemen Pendaftar',
            href: '/pendaftar',
            exact: false,
            icon: Users,
        },
        {
            name: 'Manajemen Administrator',
            href: '/admin-users',
            exact: false,
            icon: UserCog,
        },
        {
            name: 'Pengaturan Kelulusan',
            href: '/settings',
            exact: false,
            icon: Sliders,
        },
        {
            name: 'AI Knowledge Base',
            href: '/knowledge-base',
            exact: false,
            icon: BookOpen,
        },
        {
            name: 'Audit Trail Panitia',
            href: '/audit-log',
            exact: false,
            icon: ShieldCheck,
        },
    ];

    const getPageTitle = () => {
        if (pathname === '/') return 'Dashboard Analytics';
        if (pathname.startsWith('/pendaftar/')) return 'Detail & Validasi Berkas Pendaftar';
        if (pathname === '/pendaftar') return 'Manajemen Data Pendaftar';
        if (pathname === '/admin-users') return 'Manajemen Administrator & Akun Panitia';
        if (pathname === '/settings') return 'Pengaturan Pengumuman & Kelulusan';
        if (pathname === '/knowledge-base') return 'AI Knowledge Base Management';
        if (pathname === '/audit-log') return 'Audit Trail & Riwayat Aktivitas';
        return 'CMS MUSKA';
    };

    return (
        <div className={`min-h-screen flex antialiased font-sans transition-colors duration-200 ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
                />
            )}

            {/* Sidebar Desktop & Mobile */}
            <aside
                className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 w-64 border-r flex flex-col justify-between shrink-0 h-screen transition-all duration-300 ease-in-out ${
                    isDark
                        ? 'bg-slate-950 border-slate-800/80 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-700 shadow-md'
                } ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="flex flex-col flex-1 min-h-0">
                    {/* Brand Header: CMS MUSKA with Logo */}
                    <div className={`h-16 flex items-center px-5 border-b ${isDark ? 'border-slate-800/80 bg-slate-950/50' : 'border-slate-200 bg-slate-50/80'}`}>
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-xl bg-emerald-700 p-1 flex items-center justify-center shrink-0 shadow-sm border border-emerald-600/30">
                                <img
                                    src="/logo.svg"
                                    alt="Logo SMK MUSKA"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="min-w-0">
                                <div className={`text-sm font-extrabold tracking-wider uppercase leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    CMS MUSKA
                                </div>
                                <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                                    SMK Muhammadiyah
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
                        <div className={`text-[10px] font-bold uppercase tracking-widest px-3 mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Menu Navigasi
                        </div>
                        {navigation.map((item) => {
                            const active = item.exact
                                ? pathname === item.href
                                : pathname.startsWith(item.href);
                            const IconComponent = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                        active
                                            ? 'bg-emerald-600 text-white shadow-sm font-bold'
                                            : isDark
                                            ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                            : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                                    }`}
                                >
                                    <IconComponent className="w-4 h-4 shrink-0" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User profile card & Logout */}
                    <div className={`p-4 border-t ${isDark ? 'border-slate-800/80 bg-slate-950/80' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isDark ? 'bg-slate-800 border border-slate-700 text-amber-300' : 'bg-emerald-100 text-emerald-800'}`}>
                                AD
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {adminUser?.nama || 'Administrator'}
                                </div>
                                <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {adminUser?.email || 'admin@muska.sch.id'}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 rounded-xl transition cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Keluar Panel</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-100/70'}`}>
                {/* Header Navbar */}
                <header className={`h-16 border-b sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors ${isDark ? 'bg-slate-950/70 border-slate-800/80' : 'bg-white/80 border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className={`p-2 rounded-lg lg:hidden cursor-pointer ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {getPageTitle()}
                            </h1>
                            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Sistem Verifikasi Digital SPMB Berbasis AI & OCR
                            </p>
                        </div>
                    </div>

                    {/* Right Header: Theme Toggle & Realtime Notification Bell */}
                    <div className="flex items-center gap-3">
                        {/* THEME SWITCHER BUTTON */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-xl transition cursor-pointer ${
                                isDark
                                    ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                            }`}
                            title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                            aria-label="Toggle Theme"
                        >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {/* REALTIME NOTIFICATION BELL */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className={`relative p-2 rounded-xl transition cursor-pointer ${
                                    isDark
                                        ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                                        : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-300'
                                }`}
                                title="Notifikasi Verifikasi"
                                aria-label="Notifikasi Realtime"
                            >
                                <Bell className="w-4 h-4" />
                                {pendingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] flex items-center justify-center animate-pulse">
                                        {pendingCount > 9 ? '9+' : pendingCount}
                                    </span>
                                )}
                            </button>

                            {/* DROPDOWN NOTIFIKASI */}
                            {notifOpen && (
                                <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
                                    <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-bold uppercase tracking-wider">
                                                Notifikasi Berkas
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                                            {pendingCount} Menunggu
                                        </span>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {notifications.length > 0 ? (
                                            notifications.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={`/pendaftar/${item.id}`}
                                                    onClick={() => setNotifOpen(false)}
                                                    className={`p-3.5 block transition ${isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-50'}`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <div className="text-xs font-bold truncate">
                                                                {item.namaLengkap}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 mt-0.5">
                                                                NISN: {item.nisn} • {item.jurusan}
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-mono text-amber-500 shrink-0 font-medium">
                                                            Pending
                                                        </span>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-xs text-slate-400">
                                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                                                Semua berkas pendaftar telah diverifikasi!
                                            </div>
                                        )}
                                    </div>

                                    <div className={`p-2.5 text-center border-t text-xs ${isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50'}`}>
                                        <Link
                                            href="/pendaftar"
                                            onClick={() => setNotifOpen(false)}
                                            className="text-emerald-500 hover:text-emerald-400 font-semibold"
                                        >
                                            Buka Semua Data Pendaftar &rarr;
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content Container */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
                    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            }
        >
            <AdminLayoutInner>{children}</AdminLayoutInner>
        </Suspense>
    );
}
