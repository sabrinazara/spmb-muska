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

    // Jika belum ada elemen link icon di head, tambahkan baru
    if (!updated) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = logoUrl;
        document.head.appendChild(link);
    }
}

export default function DynamicFavicon() {
    useEffect(() => {
        // 1. Terapkan logo dari cache localStorage terlebih dahulu (instant tanpa kedip)
        try {
            const cachedLogo = localStorage.getItem('website_logo_url');
            if (cachedLogo) {
                updateFaviconElements(cachedLogo);
            }
        } catch {
            // Ignore localStorage error
        }

        // 2. Ambil data profil sekolah terbaru dari API backend yang dikelola admin di CMS
        fetch(API_ENDPOINTS.LANDING_PAGE)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                const rawLogo = data?.profil?.logoUrl;
                if (rawLogo) {
                    const fullUrl = rawLogo.startsWith('/uploads/')
                        ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + rawLogo
                        : rawLogo;

                    try {
                        localStorage.setItem('website_logo_url', fullUrl);
                    } catch {
                        // Ignore localStorage error
                    }

                    updateFaviconElements(fullUrl);
                }
            })
            .catch(() => {
                // Gunakan default jika API gagal
            });
    }, []);

    return null;
}
