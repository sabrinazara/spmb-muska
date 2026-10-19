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
    ChevronDown,
    Calendar,
    CheckCircle2,
    Clock,
    PanelLeftClose,
    PanelLeftOpen,
    Zap,
    HardDrive,
    Globe,
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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Collapsible navigation groups state
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        penerimaan: true,
        master: true,
    });

    // Theme state (Dark/Light mode)
    const [isDark, setIsDark] = useState(true);

    // Realtime Clock State
    const [currentTime, setCurrentTime] = useState<string>('');

    // Notification dropdown state
    const [notifOpen, setNotifOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const notifRef = useRef<HTMLDivElement>(null);

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
        const savedTheme = localStorage.getItem('cms_theme');
        if (savedTheme === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }

        const savedCollapsed = localStorage.getItem('cms_sidebar_collapsed');
        if (savedCollapsed === 'true') {
            setIsCollapsed(true);
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
            const interval = setInterval(fetchNotifications, 30000);
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

    const toggleCollapse = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        localStorage.setItem('cms_sidebar_collapsed', String(next));
    };

    const toggleGroup = (groupKey: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [groupKey]: !prev[groupKey],
        }));
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

    const navigationGroups = [
        {
            key: 'penerimaan',
            title: 'Penerimaan Siswa',
            items: [
                {
                    name: 'Data Pendaftar & Arsip',
                    href: '/pendaftar',
                    exact: false,
                    icon: Users,
                },
                {
                    name: 'Kuota Jurusan & Seleksi',
                    href: '/pengaturan-kuota',
                    exact: false,
                    icon: Zap,
                },
                {
                    name: 'Pengaturan & Jadwal CBT',
                    href: '/settings',
                    exact: false,
                    icon: Sliders,
                },
            ],
        },
        {
            key: 'master',
            title: 'Master Sistem',
            items: [
                {
                    name: 'Manajemen Administrator',
                    href: '/admin-users',
                    exact: false,
                    icon: UserCog,
                },
                {
                    name: 'AI Knowledge Base',
                    href: '/knowledge-base',
                    exact: false,
                    icon: BookOpen,
                },
                {
                    name: 'Audit Trail Aktivitas',
                    href: '/audit-log',
                    exact: false,
                    icon: ShieldCheck,
                },
                {
                    name: 'Backup & Restore Database',
                    href: '/database-manager',
                    exact: false,
                    icon: HardDrive,
                },
                {
                    name: 'Manajemen Website & Landing',
                    href: '/website',
                    exact: false,
                    icon: Globe,
                },
            ],
        },
    ];

    const getPageTitle = () => {
        if (pathname === '/') return 'Dashboard Analytics';
        if (pathname.startsWith('/pendaftar/')) return 'Detail & Validasi Berkas Pendaftar';
        if (pathname === '/pendaftar') return 'Manajemen Data Pendaftar';
        if (pathname === '/pengaturan-kuota') return 'Manajemen Kuota Jurusan & Seleksi Ranking';
        if (pathname === '/admin-users') return 'Manajemen Administrator & Akun Panitia';
        if (pathname === '/settings') return 'Pengaturan SPMB & Jadwal Kelulusan';
        if (pathname === '/knowledge-base') return 'AI Knowledge Base Management';
        if (pathname === '/audit-log') return 'Audit Trail & Riwayat Aktivitas';
        if (pathname === '/database-manager') return 'Disaster Recovery & Database Manager';
        if (pathname === '/website') return 'Manajemen Landing Page & Website Publik';
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
                className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 border-r flex flex-col justify-between shrink-0 h-screen transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:w-20 w-64' : 'w-64'
                    } ${isDark
                        ? 'bg-slate-950 border-slate-800/80 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-700 shadow-md'
                    } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex flex-col flex-1 min-h-0">
                    {/* Brand Header */}
                    <div className={`h-16 flex items-center border-b transition-colors ${isCollapsed ? 'lg:justify-center justify-between px-3' : 'justify-between px-4'
                        } ${isDark ? 'border-slate-800/80 bg-slate-950/50' : 'border-slate-200 bg-slate-50/80'}`}>
                        <Link
                            href="/"
                            className={`flex items-center gap-3 group min-w-0 ${isCollapsed ? 'lg:justify-center' : ''}`}
                            title="CMS MUSKA"
                        >
                            <div className="w-9 h-9 rounded-xl bg-emerald-700/80 p-1 flex items-center justify-center shrink-0 shadow-sm border border-emerald-600/30 overflow-hidden">
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
                                <div className={`text-sm font-extrabold tracking-wider uppercase leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    CMS
                                </div>
                                <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                                    SMK MUSKA
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

                    {/* Navigation Menu */}
                    <nav className="p-3 space-y-2 flex-1 overflow-y-auto">
                        {/* Standalone: Dashboard Analytics */}
                        <div>
                            <div className={`text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5 ${isCollapsed ? 'lg:hidden block' : 'block'
                                } ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Utama
                            </div>
                            <Link
                                href="/"
                                onClick={() => setSidebarOpen(false)}
                                title={isCollapsed ? 'Dashboard Analytics' : undefined}
                                className={`flex items-center gap-3 rounded-xl text-xs font-semibold transition-all ${isCollapsed
                                    ? 'lg:justify-center lg:px-0 lg:w-11 lg:h-11 lg:mx-auto px-3 py-2.5'
                                    : 'px-3 py-2.5'
                                    } ${pathname === '/'
                                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                                        : isDark
                                            ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                            : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                                    }`}
                            >
                                <LayoutDashboard className="w-4 h-4 shrink-0" />
                                <span className={`truncate ${isCollapsed ? 'lg:hidden block' : 'block'}`}>Dashboard Analytics</span>
                            </Link>
                        </div>

                        {/* Collapsible Categories */}
                        {navigationGroups.map((group) => {
                            const isGroupOpen = openGroups[group.key] ?? true;
                            const hasActiveChild = group.items.some((i) => pathname === i.href || pathname.startsWith(i.href + '/'));

                            return (
                                <div key={group.key} className="pt-2">
                                    {/* Category header for Expanded & Mobile */}
                                    <button
                                        onClick={() => toggleGroup(group.key)}
                                        className={`w-full items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${isCollapsed ? 'lg:hidden flex' : 'flex'
                                            } ${hasActiveChild
                                                ? 'text-emerald-400 font-extrabold'
                                                : isDark
                                                    ? 'text-slate-400 hover:text-slate-200'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                    >
                                        <span>{group.title}</span>
                                        <ChevronDown
                                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isGroupOpen ? 'rotate-0' : '-rotate-90'
                                                }`}
                                        />
                                    </button>

                                    {/* Desktop Collapsed Divider */}
                                    <div className={`h-px my-2 ${isCollapsed ? 'lg:block hidden' : 'hidden'} ${isDark ? 'bg-slate-800' : 'bg-slate-200'
                                        }`} />

                                    {/* Sub-items (Always visible on collapsed desktop as icon buttons, toggleable on mobile/expanded) */}
                                    {(isGroupOpen || isCollapsed) && (
                                        <div className="mt-1 space-y-1">
                                            {group.items.map((item) => {
                                                const active = item.exact
                                                    ? pathname === item.href
                                                    : pathname === item.href || pathname.startsWith(item.href + '/');
                                                const IconComponent = item.icon;

                                                return (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        onClick={() => setSidebarOpen(false)}
                                                        title={isCollapsed ? item.name : undefined}
                                                        className={`flex items-center gap-3 rounded-xl text-xs font-semibold transition-all ${isCollapsed
                                                            ? 'lg:justify-center lg:px-0 lg:w-11 lg:h-11 lg:mx-auto px-3 py-2'
                                                            : 'px-3 py-2'
                                                            } ${active
                                                                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                                                                : isDark
                                                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                                                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                                                            }`}
                                                    >
                                                        <IconComponent className="w-4 h-4 shrink-0" />
                                                        <span className={`truncate ${isCollapsed ? 'lg:hidden block' : 'block'}`}>{item.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* User Profile Card & Logout */}
                    <div className={`p-3 border-t ${isDark ? 'border-slate-800/80 bg-slate-950/80' : 'border-slate-200 bg-slate-50'}`}>
                        {/* Expanded & Mobile view */}
                        <div className={isCollapsed ? 'lg:hidden block' : 'block'}>
                            <div className="flex items-center gap-2.5 mb-2.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isDark ? 'bg-slate-800 border border-slate-700 text-amber-300' : 'bg-emerald-100 text-emerald-800'}`}>
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

                        {/* Collapsed desktop view */}
                        <div className={`space-y-2 ${isCollapsed ? 'lg:flex lg:flex-col lg:items-center hidden' : 'hidden'}`}>
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border cursor-default ${isDark ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-emerald-100 border-emerald-200 text-emerald-800'
                                    }`}
                                title={`${adminUser?.nama || 'Administrator'} (${adminUser?.email || ''})`}
                            >
                                AD
                            </div>
                            <button
                                onClick={handleLogout}
                                title="Keluar Panel"
                                className="w-10 h-10 flex items-center justify-center text-rose-500 hover:text-white hover:bg-rose-600 rounded-xl transition cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-100/70'}`}>
                {/* Header Navbar */}
                <header className={`h-16 border-b sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors ${isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white/80 border-slate-200'}`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className={`p-2 rounded-lg lg:hidden cursor-pointer ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                            aria-label="Buka Menu"
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
                            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                        </button>

                        <div>
                            <h1 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {getPageTitle()}
                            </h1>
                            {/* <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Sistem 
                            </p> */}
                        </div>
                    </div>

                    {/* Right Header: Realtime Clock, Theme Toggle & Notification Bell */}
                    <div className="flex items-center gap-3">
                        {/* LIVE INDONESIAN CLOCK */}
                        {currentTime && (
                            <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium shadow-2xs ${isDark
                                ? 'bg-slate-950/80 text-emerald-400 border-slate-800'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}>
                                <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>{currentTime}</span>
                            </div>
                        )}

                        {/* THEME SWITCHER BUTTON */}
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

                        {/* REALTIME NOTIFICATION BELL */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className={`relative p-2 rounded-xl transition cursor-pointer ${isDark
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
