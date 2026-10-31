'use client';

import { useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/api';

function updateFaviconElements(logoUrl: string) {
    if (!logoUrl || typeof document === 'undefined') return;

    const selectors = [
        "link[rel='icon']",
        "link[rel='shortcut icon']",
        "link[rel='apple-touch-icon']",
    ];

    let updated = false;
    selectors.forEach((selector) => {
        const elements = document.querySelectorAll<HTMLLinkElement>(selector);
        elements.forEach((el) => {
            el.href = logoUrl;
            updated = true;
        });
    });

    if (!updated) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = logoUrl;
        document.head.appendChild(link);
    }
}

export default function DynamicFavicon() {
    useEffect(() => {
        // 1. Terapkan dari cache localStorage terlebih dahulu (instant)
        try {
            const cachedLogo = localStorage.getItem('website_logo_url');
            if (cachedLogo) {
                updateFaviconElements(cachedLogo);
            }
        } catch {}

        // 2. Ambil data profil sekolah terbaru dari backend
        fetch(API_ENDPOINTS.WEBSITE.PUBLIC_DATA)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                const rawLogo = data?.profil?.logoUrl;
                if (rawLogo) {
                    const fullUrl = rawLogo.startsWith('/uploads/')
                        ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + rawLogo
                        : rawLogo;

                    try {
                        localStorage.setItem('website_logo_url', fullUrl);
                    } catch {}

                    updateFaviconElements(fullUrl);
                }
            })
            .catch(() => {});

        // 3. Listener jika admin mengunggah/mengubah logo di form CMS
        const handleLogoUpdate = (e: CustomEvent<{ url: string }>) => {
            if (e.detail?.url) {
                const fullUrl = e.detail.url.startsWith('/uploads/')
                    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + e.detail.url
                    : e.detail.url;
                try {
                    localStorage.setItem('website_logo_url', fullUrl);
                } catch {}
                updateFaviconElements(fullUrl);
            }
        };

        window.addEventListener('website_logo_updated' as any, handleLogoUpdate as any);
        return () => {
            window.removeEventListener('website_logo_updated' as any, handleLogoUpdate as any);
        };
    }, []);

    return null;
}
