'use client';

import { Compass, CheckCircle2, Award, Sparkles, GraduationCap } from 'lucide-react';

interface VisiMisiPanelProps {
    className?: string;
    compact?: boolean;
}

export default function VisiMisiPanel({ className = '', compact = false }: VisiMisiPanelProps) {
    const misiList = [
        'Mengembangkan pendidikan vokasi berbasis teknologi dan standar industri modern.',
        'Menanamkan nilai-nilai luhur Al-Islam dan Kemuhammadiyahan dalam setiap aspek pembelajaran.',
        'Menjalin kemitraan strategis dengan Dunia Usaha dan Dunia Industri (DUDI).',
        'Membekali lulusan dengan sertifikasi kompetensi nasional BNSP dan jiwa kewirausahaan.',
    ];

    return (
        <div
            className={`relative rounded-3xl overflow-hidden p-6 sm:p-7 lg:p-8 bg-gradient-to-br from-slate-950 via-emerald-950/80 to-slate-900 text-white flex flex-col justify-between border border-emerald-500/20 shadow-2xl ${className}`}
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
                {/* Header Brand */}
                <div className="flex items-center gap-3 pb-3.5 border-b border-white/10">
                    <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md border border-white/20 shrink-0 flex items-center justify-center">
                        <img
                            src="/logo.png"
                            alt="Logo SMK Muhammadiyah Sekampung"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                            {/* <Sparkles className="w-3 h-3 text-amber-300" /> */}
                            <span>Pusat Keunggulan Vokasi</span>
                        </div>
                        <h2 className="text-sm sm:text-base font-black tracking-tight text-white leading-tight">
                            SMK MUHAMMADIYAH SEKAMPUNG
                        </h2>
                        <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium">
                            Terakreditasi "A" Unggul · Lampung Timur
                        </p>
                    </div>
                </div>

                {/* Visi Section */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                        <Compass className="w-3.5 h-3.5 shrink-0" />
                        <span>Visi Sekolah</span>
                    </div>
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs relative group hover:border-emerald-500/40 transition duration-300">
                        <div className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed italic">
                            &ldquo;Menjadi Sekolah Menengah Kejuruan yang Unggul, Berkarakter Islami, dan Berdaya Saing Global.&rdquo;
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

            {/* Semboyan Footer in Dancing Script */}
            <div className="relative z-10 mt-4 pt-3.5 border-t border-white/10">
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
