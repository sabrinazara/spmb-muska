'use client';

import { useState } from 'react';
import { Compass, Award, GraduationCap, ChevronDown } from 'lucide-react';

interface VisiMisiPanelProps {
    className?: string;
    compact?: boolean;
}

export default function VisiMisiPanel({ className = '', compact: _compact = false }: VisiMisiPanelProps) {
    const [isMinimizedMobile, setIsMinimizedMobile] = useState(false);

    const misiList = [
        'Mengembangkan pendidikan vokasi berbasis teknologi dan standar industri modern.',
        'Menanamkan nilai-nilai luhur Al-Islam dan Kemuhammadiyahan dalam setiap aspek pembelajaran.',
        'Menjalin kemitraan strategis dengan Dunia Usaha dan Dunia Industri (DUDI).',
        'Membekali lulusan dengan sertifikasi kompetensi nasional BNSP dan jiwa kewirausahaan.',
    ];

    return (
        <div
            className={`relative rounded-3xl overflow-hidden p-5 sm:p-7 lg:p-8 bg-gradient-to-br from-slate-950 via-emerald-950/80 to-slate-900 text-white flex flex-col justify-between border border-emerald-500/20 shadow-2xl transition-all duration-300 ${className}`}
        >
            {/* Ambient Background Glows */}
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

            {/* Subtle Grid Accent */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '20px 20px',
                }}
            />

            <div className="relative z-10 space-y-4 sm:space-y-5">
                {/* Header Brand with Mobile Minimize Toggle */}
                <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/10">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white p-1.5 shadow-md border border-white/20 shrink-0 flex items-center justify-center">
                            <img
                                src="/logo.png"
                                alt="Logo SMK Muhammadiyah Sekampung"
                                className="w-full h-full object-contain"
                            />  
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xs sm:text-base font-black tracking-tight text-white leading-tight truncate">
                                SMK MUHAMMADIYAH SEKAMPUNG
                            </h2>
                            <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium">
                                Terakreditasi &ldquo;A&rdquo; Unggul {isMinimizedMobile && <span className="lg:hidden text-amber-400 font-semibold">• Visi & Misi</span>}
                            </p>
                        </div>
                    </div>

                    {/* Tombol Minimize / Expand Khusus Tampilan Mobile */}
                    <button
                        type="button"
                        onClick={() => setIsMinimizedMobile(!isMinimizedMobile)}
                        className="lg:hidden shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-[11px] font-bold text-white transition-all cursor-pointer shadow-sm"
                        aria-label={isMinimizedMobile ? 'Buka Visi & Misi' : 'Perkecil Visi & Misi'}
                    >
                        <span>{isMinimizedMobile ? 'Buka Visi Misi' : 'Perkecil'}</span>
                        <ChevronDown
                            className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-300 ${
                                isMinimizedMobile ? '-rotate-90' : 'rotate-0'
                            }`}
                        />
                    </button>
                </div>

                {/* Body Content (Collapsible di Mobile, Selalu Terbuka di Desktop) */}
                <div className={`${isMinimizedMobile ? 'hidden lg:block' : 'block'} space-y-4 sm:space-y-5 transition-all duration-300`}>
                    {/* Visi Section */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                            <Compass className="w-3.5 h-3.5 shrink-0" />
                            <span>Visi Sekolah</span>
                        </div>
                        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs relative group hover:border-emerald-500/40 transition duration-300">
                            <div className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
                                &ldquo;Mewujudkan lulusan yang Islami, berjiwa Nasionalis, berintelektualitas tinggi, berorientasi nasional dan berwawasan lingkungan.&rdquo;
                            </div>
                        </div>
                    </div>

                    {/* Misi Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                            <span>Misi Strategis</span>
                        </div>
                        <div className="space-y-1.5">
                            {misiList.map((misi, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition text-[11px] sm:text-xs text-slate-200 leading-relaxed"
                                >
                                    <span className="w-4.5 h-4.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <span>{misi}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Semboyan Footer in Dancing Script (Collapsible di Mobile) */}
            <div className={`${isMinimizedMobile ? 'hidden lg:block' : 'block'} relative z-10 mt-4 pt-3.5 border-t border-white/10`}>
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-amber-500/15 border border-emerald-500/30">
                    <Award className="w-5 h-5 text-amber-300 shrink-0" />
                    <div>
                        <div className="font-dancing text-base sm:text-lg font-bold text-amber-200 tracking-wide">
                            &ldquo;Sukses · Jaya · Bermanfaat · Inspiratif&rdquo;
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
