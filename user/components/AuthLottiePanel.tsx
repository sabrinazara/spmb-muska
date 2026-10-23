'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface AuthLottiePanelProps {
    type: 'login' | 'register';
    className?: string;
}

export default function AuthLottiePanel({ type, className = '' }: AuthLottiePanelProps) {
    const lottieContainerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let anim: any = null;
        let isMounted = true;

        // Dynamic import lottie-web agar SSR-safe di Next.js
        import('lottie-web').then((lottieModule) => {
            const lottie = lottieModule.default || lottieModule;
            if (lottieContainerRef.current && isMounted) {
                lottieContainerRef.current.innerHTML = '';

                anim = lottie.loadAnimation({
                    container: lottieContainerRef.current,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: '/lottie/login.json',
                });

                anim.addEventListener('DOMLoaded', () => {
                    if (isMounted) setIsLoaded(true);
                });
            }
        }).catch((err) => {
            console.error('Gagal memuat animasi Lottie:', err);
        });

        return () => {
            isMounted = false;
            if (anim) {
                anim.destroy();
            }
        };
    }, []);

    const isLogin = type === 'login';

    return (
        <div
            className={`relative p-6 sm:p-8 lg:p-10 bg-emerald-600 dark:bg-emerald-700 text-white flex flex-col justify-between overflow-hidden ${className}`}
        >
            {/* Top: Branding Sekolah */}
            <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white p-1.5 shadow-md shrink-0 flex items-center justify-center">
                        <img
                            src="/logo.png"
                            alt="Logo SMK Muhammadiyah Sekampung"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.currentTarget.src = '/logo.svg';
                            }}
                        />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-black tracking-tight text-white uppercase leading-tight">
                            SMK MUHAMMADIYAH SEKAMPUNG
                        </h2>
                        <p className="text-[10px] sm:text-[11px] text-emerald-100 font-semibold tracking-wide">
                            Pusat Keunggulan Vokasi • Akreditasi A
                        </p>
                    </div>
                </div>

                <p className="text-xs sm:text-[13px] text-emerald-100/90 leading-relaxed max-w-md pt-1">
                    {isLogin
                        ? 'Selamat datang di Portal SPMB Online. Akses akun Anda untuk melengkapi berkas, melihat jadwal tes CBT, dan status seleksi.'
                        : 'Mulai langkah awal masa depan Anda. Daftarkan diri secara online dengan mudah, cepat, dan transparan.'}
                </p>
            </div>

            {/* Center: Lottie Animation */}
            <div className="relative z-10 my-4 sm:my-6 flex items-center justify-center min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]">
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                )}
                <div
                    ref={lottieContainerRef}
                    className="w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[380px] h-auto aspect-square flex items-center justify-center pointer-events-none drop-shadow-md"
                />
            </div>

            {/* Bottom: Switch Link (Sesuai Referensi Desain) */}
            <div className="relative z-10 pt-4 border-t border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-100">
                <span>
                    {isLogin
                        ? 'Belum punya akun pendaftaran?'
                        : 'Sudah memiliki akun pendaftaran?'}
                </span>
                <Link
                    href={isLogin ? '/register' : '/login'}
                    className="font-extrabold text-white hover:text-amber-300 underline underline-offset-4 transition inline-flex items-center gap-1"
                >
                    <span>{isLogin ? 'Daftar Sekarang' : 'Masuk di Sini'}</span>
                </Link>
            </div>
        </div>
    );
}
