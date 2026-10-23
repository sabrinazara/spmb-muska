'use client';

import { useEffect, useRef, useState } from 'react';

interface DashboardHeroLottieProps {
    className?: string;
}

export default function DashboardHeroLottie({ className = '' }: DashboardHeroLottieProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let anim: any = null;
        let isMounted = true;

        // Dynamic import lottie-web agar SSR-safe di Next.js App Router
        import('lottie-web')
            .then((lottieModule) => {
                const lottie = lottieModule.default || lottieModule;
                if (containerRef.current && isMounted) {
                    containerRef.current.innerHTML = '';
                    anim = lottie.loadAnimation({
                        container: containerRef.current,
                        renderer: 'svg',
                        loop: true,
                        autoplay: true,
                        path: '/lottie/herosection.json',
                    });

                    anim.addEventListener('DOMLoaded', () => {
                        if (isMounted) setIsLoaded(true);
                    });
                }
            })
            .catch((err) => {
                console.error('Gagal memuat animasi hero Lottie:', err);
            });

        return () => {
            isMounted = false;
            if (anim) {
                anim.destroy();
            }
        };
    }, []);

    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                </div>
            )}
            <div
                ref={containerRef}
                className={`w-full h-full flex items-center justify-center transition-opacity duration-300 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            />
        </div>
    );
}
