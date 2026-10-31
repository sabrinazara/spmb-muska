'use client';

import { useEffect, useRef, useState } from 'react';

interface ChatbotLottieProps {
    className?: string;
}

export default function ChatbotLottie({ className = '' }: ChatbotLottieProps) {
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
                        path: '/lottie/chatbot.json',
                    });

                    const adjustViewBox = () => {
                        const svg = containerRef.current?.querySelector('svg');
                        if (svg) {
                            // Potong transparent margin berlebih (150px kanan & 50px atas)
                            // agar karakter robot dan balon 'Hello!' pas dan proporsional
                            svg.setAttribute('viewBox', '0 50 350 310');
                        }
                        if (isMounted) setIsLoaded(true);
                    };

                    anim.addEventListener('DOMLoaded', adjustViewBox);
                }
            })
            .catch((err) => {
                console.error('Gagal memuat animasi Lottie chatbot:', err);
            });

        return () => {
            isMounted = false;
            if (anim) {
                anim.destroy();
            }
        };
    }, []);

    return (
        <div className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}>
            <div
                ref={containerRef}
                className={`w-full h-full flex items-center justify-center transition-opacity duration-200 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            />
        </div>
    );
}
