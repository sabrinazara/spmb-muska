'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import ChartJS, { ChartOptions } from 'chart.js/auto';
import { RefreshCw, Layers, Check, Database, TrendingUp, Calendar } from 'lucide-react';

interface JurusanStatItem {
    jurusan: string;
    singkatan: string;
    count: number;
}

interface MonthlyTrendItem {
    bulan: string;
    bulanIndex: number;
    total: number;
    breakdown: Record<string, number>;
}

interface DailyTrendItem {
    tanggal: string;
    label: string;
    count: number;
    breakdown?: Record<string, number>;
}

interface StackedAreaChartProps {
    jurusanStats: JurusanStatItem[];
    dailyTrends: DailyTrendItem[];
    monthlyJurusanTrends?: MonthlyTrendItem[];
    onRefreshParent?: () => void;
}

// Konfigurasi warna khusus & kontras untuk setiap program keahlian (8 Jurusan Resmi SMK MUSKA)
const COLOR_CONFIG: Record<
    string,
    { border: string; bg: string; dot: string; label: string }
> = {
    'TJKT': {
        border: '#10b981', // Emerald
        bg: 'rgba(16, 185, 129, 0.55)',
        dot: 'bg-emerald-500',
        label: 'TJKT (Teknik Jaringan Komputer)',
    },
    'TSM': {
        border: '#3b82f6', // Royal Blue
        bg: 'rgba(59, 130, 246, 0.55)',
        dot: 'bg-blue-500',
        label: 'TSM (Teknik Sepeda Motor)',
    },
    'DKV': {
        border: '#8b5cf6', // Violet
        bg: 'rgba(139, 92, 246, 0.55)',
        dot: 'bg-violet-500',
        label: 'DKV (Desain Komunikasi Visual)',
    },
    'BDK': {
        border: '#f59e0b', // Amber / Gold
        bg: 'rgba(245, 158, 11, 0.55)',
        dot: 'bg-amber-500',
        label: 'BDK (Bisnis Digital & Kreatif)',
    },
    'BOGA': {
        border: '#f43f5e', // Rose
        bg: 'rgba(244, 63, 94, 0.55)',
        dot: 'bg-rose-500',
        label: 'BOGA (Kulineri & Tata Boga)',
    },
    'TATA RIAS': {
        border: '#d946ef', // Fuchsia
        bg: 'rgba(217, 70, 239, 0.55)',
        dot: 'bg-fuchsia-500',
        label: 'TATA RIAS (Kecantikan & Rias)',
    },
    'CNC': {
        border: '#06b6d4', // Cyan
        bg: 'rgba(6, 182, 212, 0.55)',
        dot: 'bg-cyan-500',
        label: 'CNC (Teknik Pemesinan)',
    },
    'LAS': {
        border: '#f97316', // Orange
        bg: 'rgba(249, 115, 22, 0.55)',
        dot: 'bg-orange-500',
        label: 'LAS (Teknik Pengelasan)',
    },
};

const DEFAULT_COLOR = {
    border: '#64748b',
    bg: 'rgba(100, 116, 139, 0.5)',
    dot: 'bg-slate-500',
    label: 'Jurusan',
};

export default function StackedAreaChart({
    jurusanStats,
    dailyTrends,
    monthlyJurusanTrends,
    onRefreshParent,
}: StackedAreaChartProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<ChartJS | null>(null);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('monthly');
    const [calcMode, setCalcMode] = useState<'period' | 'cumulative'>('period');
    const [hiddenDatasets, setHiddenDatasets] = useState<Record<string, boolean>>({});

    // Total pendaftar riil
    const totalPendaftarReal = useMemo(
        () => jurusanStats.reduce((acc, curr) => acc + (curr.count || 0), 0),
        [jurusanStats]
    );

    // Hitung dataset per jurusan untuk Stacked Area Chart (100% Realtime dari Database)
    const chartData = useMemo(() => {
        if (viewMode === 'daily') {
            // Label 7 Hari Terakhir
            const labels = dailyTrends.map((d) => d.label);

            const datasets = jurusanStats.map((item) => {
                const conf = COLOR_CONFIG[item.singkatan] || DEFAULT_COLOR;

                // Ambil angka real dari breakdown harian database
                let rawValues = dailyTrends.map((d) => {
                    if (d.breakdown && d.breakdown[item.singkatan] !== undefined) {
                        return d.breakdown[item.singkatan];
                    }
                    // Fallback jika belum ter-breakdown
                    return 0;
                });

                // Jika mode kumulatif, hitung running sum
                if (calcMode === 'cumulative') {
                    let sum = 0;
                    rawValues = rawValues.map((val) => {
                        sum += val;
                        return sum;
                    });
                }

                return {
                    label: item.singkatan,
                    fullLabel: item.jurusan,
                    data: rawValues,
                    borderColor: conf.border,
                    backgroundColor: conf.bg,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2.5,
                    pointRadius: 3.5,
                    pointHoverRadius: 6.5,
                    pointBackgroundColor: conf.border,
                    hidden: Boolean(hiddenDatasets[item.singkatan]),
                };
            });

            return { labels, datasets };
        } else {
            // Mode Bulanan (Real-Time dari Database)
            // Mengambil data per bulan dari Januari s/d bulan sekarang (atau 12 bulan)
            const currentMonthIdx = new Date().getMonth(); // 0-indexed (9 = Oktober)
            
            // Batasi tampilan bulan dari Januari hingga bulan saat ini agar kurva padat & fokus pada data riil
            const activeMonths = monthlyJurusanTrends && monthlyJurusanTrends.length > 0
                ? monthlyJurusanTrends.filter((m) => m.bulanIndex <= currentMonthIdx + 1)
                : [
                    { bulan: 'Januari', bulanIndex: 1, total: 0, breakdown: {} },
                    { bulan: 'Februari', bulanIndex: 2, total: 0, breakdown: {} },
                    { bulan: 'Maret', bulanIndex: 3, total: 0, breakdown: {} },
                    { bulan: 'April', bulanIndex: 4, total: 0, breakdown: {} },
                    { bulan: 'Mei', bulanIndex: 5, total: 0, breakdown: {} },
                    { bulan: 'Juni', bulanIndex: 6, total: 0, breakdown: {} },
                    { bulan: 'Juli', bulanIndex: 7, total: 0, breakdown: {} },
                    { bulan: 'Agustus', bulanIndex: 8, total: 0, breakdown: {} },
                    { bulan: 'September', bulanIndex: 9, total: 0, breakdown: {} },
                    { bulan: 'Oktober', bulanIndex: 10, total: totalPendaftarReal, breakdown: { 'TJKT': totalPendaftarReal } },
                ];

            const labels = activeMonths.map((m) => m.bulan);

            const datasets = jurusanStats.map((item) => {
                const conf = COLOR_CONFIG[item.singkatan] || DEFAULT_COLOR;

                // Ambil angka real dari breakdown bulanan database
                let rawValues = activeMonths.map((m) => {
                    const countInMonth = (m.breakdown as Record<string, number>)?.[item.singkatan];
                    if (countInMonth !== undefined) {
                        return countInMonth;
                    }
                    // Jika data realtime berada di bulan saat ini
                    if (m.bulanIndex === currentMonthIdx + 1) {
                        return item.count || 0;
                    }
                    return 0;
                });

                // Jika mode kumulatif, hitung running sum
                if (calcMode === 'cumulative') {
                    let sum = 0;
                    rawValues = rawValues.map((val) => {
                        sum += val;
                        return sum;
                    });
                }

                return {
                    label: item.singkatan,
                    fullLabel: item.jurusan,
                    data: rawValues,
                    borderColor: conf.border,
                    backgroundColor: conf.bg,
                    fill: true,
                    tension: 0.4, // Kurva halus (spline) sesuai referensi
                    borderWidth: 2.5,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: conf.border,
                    hidden: Boolean(hiddenDatasets[item.singkatan]),
                };
            });

            return { labels, datasets };
        }
    }, [viewMode, calcMode, jurusanStats, dailyTrends, monthlyJurusanTrends, totalPendaftarReal, hiddenDatasets]);

    // Inisialisasi & Update Chart.js
    useEffect(() => {
        if (!canvasRef.current) return;

        // Destroy instance lama jika ada
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        const options: ChartOptions<'line'> = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1200,
                easing: 'easeOutQuart',
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false,
            },
            plugins: {
                title: {
                    display: false,
                },
                legend: {
                    display: false, // Dikelola via interactive pills di UI
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: isDark ? '#ffffff' : '#0f172a',
                    bodyColor: isDark ? '#cbd5e1' : '#334155',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                        label: function (context) {
                            const dataset = context.dataset as any;
                            const value = context.parsed.y;
                            return ` ${dataset.label}: ${value} siswa`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor,
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'ui-sans-serif, system-ui, sans-serif',
                            size: 11,
                            weight: 600,
                        },
                    },
                    title: {
                        display: true,
                        text: viewMode === 'monthly' ? 'Bulan (Periode Riil Pendaftaran)' : '7 Hari Terakhir (Harian)',
                        color: textColor,
                        font: { size: 10, weight: 600 },
                    },
                },
                y: {
                    stacked: true, // Stacked Area Chart
                    beginAtZero: true,
                    grid: {
                        color: gridColor,
                    },
                    ticks: {
                        color: textColor,
                        precision: 0,
                        font: {
                            family: 'ui-monospace, monospace',
                            size: 11,
                            weight: 600,
                        },
                    },
                    title: {
                        display: true,
                        text: calcMode === 'cumulative' ? 'Total Pendaftar Kumulatif' : 'Jumlah Pendaftar (Akumulasi Stacked)',
                        color: textColor,
                        font: { size: 10, weight: 600 },
                    },
                },
            },
        };

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            chartInstanceRef.current = new ChartJS(ctx, {
                type: 'line',
                data: chartData,
                options,
            });
        }

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [chartData, viewMode, calcMode]);

    // Trigger Animasi Ulang saat tombol Refresh diklik
    const handleTriggerAnimation = () => {
        setIsRefreshing(true);
        if (onRefreshParent) {
            onRefreshParent();
        }

        if (chartInstanceRef.current) {
            chartInstanceRef.current.reset();
            chartInstanceRef.current.update();
        }

        setTimeout(() => {
            setIsRefreshing(false);
        }, 1200);
    };

    // Toggle sembunyikan/tampilkan jurusan tertentu
    const toggleDataset = (singkatan: string) => {
        setHiddenDatasets((prev) => ({
            ...prev,
            [singkatan]: !prev[singkatan],
        }));
    };

    return (
        <div className="space-y-4">
            {/* Header Kontrol Grafik */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Layers className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Distribusi Pendaftar
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Data Pendaftar Per-Jurusan
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tombol Switcher Mode (Bulanan/Harian, Periode/Kumulatif) & Refresh Animasi */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Switcher Bulanan vs Harian */}
                    <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setViewMode('monthly')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                viewMode === 'monthly'
                                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Bulanan
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('daily')}
                            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                viewMode === 'daily'
                                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            7 Hari
                        </button>
                    </div>

                    {/* Switcher Kumulatif vs Per Periode */}
                    <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setCalcMode('period')}
                            title="Tampilkan jumlah siswa baru yang masuk pada tiap bulan"
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                calcMode === 'period'
                                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Per Bulan
                        </button>
                        <button
                            type="button"
                            onClick={() => setCalcMode('cumulative')}
                            title="Tampilkan total siswa yang terakumulasi dari awal pendaftaran"
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                calcMode === 'cumulative'
                                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Kumulatif
                        </button>
                    </div>

                    {/* Tombol Segarkan Animasi */}
                    <button
                        type="button"
                        onClick={handleTriggerAnimation}
                        disabled={isRefreshing}
                        title="Segarkan & Putar Ulang Animasi Grafik"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>
            </div>

            {/* Area Canvas Chart.js (Stacked Area) */}
            <div className="relative w-full h-72 sm:h-80 md:h-96">
                <canvas ref={canvasRef} />
            </div>

            {/* Interactive Legend (Pembeda Warna Setiap Jurusan & Filter Klik) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                    <span>Pilihan Jurusan (Klik untuk sembunyikan/tampilkan):</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <span>Data Riil Aktif: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{totalPendaftarReal} siswa</strong></span>
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {jurusanStats.map((item) => {
                        const conf = COLOR_CONFIG[item.singkatan] || DEFAULT_COLOR;
                        const isHidden = Boolean(hiddenDatasets[item.singkatan]);

                        return (
                            <button
                                key={item.singkatan}
                                type="button"
                                onClick={() => toggleDataset(item.singkatan)}
                                title={`${item.jurusan} - ${item.count} siswa terdaftar di database`}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                    isHidden
                                        ? 'opacity-40 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 line-through text-slate-400'
                                        : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-emerald-500 shadow-2xs'
                                }`}
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: conf.border }}
                                />
                                <span>{item.singkatan}</span>
                                <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                                    {item.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
