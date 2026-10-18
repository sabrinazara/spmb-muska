'use client';

import { Sparkles } from 'lucide-react';

export const DAFTAR_JURUSAN = [
    {
        id: 'tjkt',
        singkatan: 'TJKT',
        nama: 'Teknik Jaringan Komputer & Telekomunikasi',
        logo: '/jurusan/tkj.svg',
        accent: 'border-blue-500/40 text-blue-600 dark:text-blue-400',
    },
    {
        id: 'to',
        singkatan: 'TO (TSM)',
        nama: 'Teknik Sepeda Motor & Otomotif',
        logo: '/jurusan/tsm.svg',
        accent: 'border-red-500/40 text-red-600 dark:text-red-400',
    },
    {
        id: 'dkv',
        singkatan: 'DKV',
        nama: 'Desain Komunikasi Visual',
        logo: '/jurusan/dkv.svg',
        accent: 'border-purple-500/40 text-purple-600 dark:text-purple-400',
    },
    {
        id: 'bdk',
        singkatan: 'BDK',
        nama: 'Bisnis Digital & Kreatif',
        logo: '/jurusan/bdk.svg',
        accent: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
    },
    {
        id: 'kuliner',
        singkatan: 'Kulineri',
        nama: 'Tata Boga & Kulineri',
        logo: '/jurusan/kuliner.svg',
        accent: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
    },
    {
        id: 'kecantikan',
        singkatan: 'Kecantikan',
        nama: 'Tata Rias & Kecantikan',
        logo: '/jurusan/kecantikan.svg',
        accent: 'border-pink-500/40 text-pink-600 dark:text-pink-400',
    },
    {
        id: 'cnc',
        singkatan: 'Pemesinan',
        nama: 'Teknik Pemesinan (CNC)',
        logo: '/jurusan/cnc.svg',
        accent: 'border-slate-500/40 text-slate-700 dark:text-slate-300',
    },
    {
        id: 'las',
        singkatan: 'Pengelasan',
        nama: 'Teknik Pengelasan (Welding)',
        logo: '/jurusan/las.svg',
        accent: 'border-orange-500/40 text-orange-600 dark:text-orange-400',
    },
];

export default function JurusanMarquee() {
    // Duplikasi 3x agar loop animasi marquee kiri-ke-kanan berjalan tanpa jeda
    const loopedJurusan = [...DAFTAR_JURUSAN, ...DAFTAR_JURUSAN, ...DAFTAR_JURUSAN];

    return (
        <div className="w-full space-y-3 pt-6 pb-2">
            {/* Header Mini Label */}
            {/* <div className="flex items-center justify-center gap-2">
                <span className="h-px w-10 sm:w-16 bg-slate-200 dark:bg-slate-800" />
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>8 Program Keahlian / Jurusan SMK MUSKA</span>
                </div>
                <span className="h-px w-10 sm:w-16 bg-slate-200 dark:bg-slate-800" />
            </div> */}

            {/* Marquee Scroller (Bergerak Halus dari Kiri ke Kanan) */}
            <div className="relative w-full overflow-hidden py-1">
                {/* Masking Efek Fade Kiri & Kanan */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10" />

                {/* Looping Track */}
                <div className="animate-marquee-reverse flex items-center gap-4">
                    {loopedJurusan.map((j, idx) => (
                        <div
                            key={`${j.id}-${idx}`}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition duration-300 group shrink-0 cursor-default"
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-1.5 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition duration-300 shrink-0">
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
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium max-w-[170px] truncate">
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
