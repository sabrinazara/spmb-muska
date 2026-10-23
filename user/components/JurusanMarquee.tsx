'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/api';

export const DAFTAR_JURUSAN_FALLBACK = [
    {
        id: 'tjkt',
        singkatan: 'TJKT',
        nama: 'Teknik Jaringan Komputer & Telekomunikasi',
        logo: '/jurusan/tkj.svg',
    },
    {
        id: 'to',
        singkatan: 'TO (TSM)',
        nama: 'Teknik Sepeda Motor & Otomotif',
        logo: '/jurusan/tsm.svg',
    },
    {
        id: 'dkv',
        singkatan: 'DKV',
        nama: 'Desain Komunikasi Visual',
        logo: '/jurusan/dkv.svg',
    },
    {
        id: 'bdk',
        singkatan: 'BDK',
        nama: 'Bisnis Digital & Kreatif',
        logo: '/jurusan/bdk.svg',
    },
    {
        id: 'kuliner',
        singkatan: 'Kulineri',
        nama: 'Tata Boga & Kulineri',
        logo: '/jurusan/kuliner.svg',
    },
    {
        id: 'kecantikan',
        singkatan: 'Kecantikan',
        nama: 'Tata Rias & Kecantikan',
        logo: '/jurusan/kecantikan.svg',
    },
    {
        id: 'cnc',
        singkatan: 'Pemesinan',
        nama: 'Teknik Pemesinan (CNC)',
        logo: '/jurusan/cnc.svg',
    },
    {
        id: 'las',
        singkatan: 'Pengelasan',
        nama: 'Teknik Pengelasan (Welding)',
        logo: '/jurusan/las.svg',
    },
];

interface JurusanItem {
    id: string;
    singkatan: string;
    nama: string;
    logo: string;
}

export default function JurusanMarquee() {
    const [jurusanList, setJurusanList] = useState<JurusanItem[]>(DAFTAR_JURUSAN_FALLBACK);

    const getFullUrl = (url: string | null | undefined, fallback: string = '/logo.png') => {
        if (!url) return fallback;
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
        if (url.startsWith('/uploads/')) {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            return `${apiBase}${url}`;
        }
        return url;
    };

    // Ambil data logo jurusan langsung dari CMS/API agar sinkron dengan landing page
    useEffect(() => {
        fetch(API_ENDPOINTS.JURUSAN.LIST)
            .then((res) => {
                if (!res.ok) throw new Error('Gagal mengambil data jurusan');
                return res.json();
            })
            .then((data: Array<{ id?: string; singkatan?: string; nama?: string; iconUrl?: string }>) => {
                if (Array.isArray(data) && data.length > 0) {
                    const mapped: JurusanItem[] = data.map((p) => {
                        const defaultLocal = `/jurusan/${(p.singkatan || '').toLowerCase().replace(/[^a-z]/g, '')}.svg`;
                        const logo = p.iconUrl ? getFullUrl(p.iconUrl, defaultLocal) : defaultLocal;
                        return {
                            id: p.id || p.singkatan || 'jurusan',
                            singkatan: p.singkatan || 'Jurusan',
                            nama: p.nama || '',
                            logo,
                        };
                    });
                    setJurusanList(mapped);
                }
            })
            .catch((err) => {
                console.warn('Gagal memuat jurusan dari CMS, menggunakan fallback:', err);
            });
    }, []);

    // Duplikasi 3x agar loop animasi marquee kiri-ke-kanan berjalan mulus tanpa jeda
    const loopedJurusan = [...jurusanList, ...jurusanList, ...jurusanList];

    return (
        <div className="w-full space-y-3 pt-4 sm:pt-6 pb-2 group">
            {/* Marquee Scroller (Bergerak Halus dari Kiri ke Kanan, Berhenti saat di-Hover Cursor) */}
            <div className="relative w-full overflow-hidden py-1">
                {/* Masking Efek Fade Kiri & Kanan */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10" />

                {/* Looping Track dengan Hover Pause */}
                <div className="animate-marquee-reverse flex items-center gap-3 sm:gap-4 hover:[animation-play-state:paused]">
                    {loopedJurusan.map((j, idx) => (
                        <div
                            key={`${j.id}-${idx}`}
                            className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition duration-300 group/card shrink-0 cursor-default"
                        >
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-1.5 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover/card:scale-110 transition duration-300 shrink-0">
                                <img
                                    src={j.logo}
                                    alt={j.singkatan}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = '/logo.png';
                                    }}
                                />
                            </div>
                            <div className="text-left">
                                <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <span>{j.singkatan}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium max-w-[150px] sm:max-w-[180px] truncate">
                                    {j.nama}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
