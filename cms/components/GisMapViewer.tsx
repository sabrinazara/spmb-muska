'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink, School, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface GisMapViewerProps {
    latitude?: number | null;
    longitude?: number | null;
    namaLengkap?: string | null;
    alamat?: string | null;
}

// Pusat Acuan: SMK Muhammadiyah Sekampung, Lampung Timur
const SEKOLAH_COORDS: [number, number] = [-5.1973, 105.4414];
const SEKOLAH_NAMA = 'SMK Muhammadiyah Sekampung';

// Hitung jarak haversine sederhana (dalam km)
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // radius bumi dalam km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
}

export default function GisMapViewer({
    latitude,
    longitude,
    namaLengkap = 'Calon Siswa',
    alamat,
}: GisMapViewerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [distanceKm, setDistanceKm] = useState<number | null>(null);

    const hasCoords =
        typeof latitude === 'number' &&
        !isNaN(latitude) &&
        typeof longitude === 'number' &&
        !isNaN(longitude);

    const studentLat = hasCoords ? latitude : SEKOLAH_COORDS[0];
    const studentLng = hasCoords ? longitude : SEKOLAH_COORDS[1];

    useEffect(() => {
        let isMounted = true;

        const initMap = async () => {
            if (!mapContainerRef.current || mapInstanceRef.current) return;

            const L = (await import('leaflet')).default;

            if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;

            // Reset _leaflet_id jika container pernah dipakai oleh instance sebelumnya
            const container = mapContainerRef.current as any;
            if (container._leaflet_id != null) {
                container._leaflet_id = null;
            }

            // Pin Ikon Calon Siswa (Emerald)
            const studentIcon = L.divIcon({
                className: 'student-pin-marker',
                html: `
                    <div style="
                        width: 36px;
                        height: 36px;
                        background: #059669;
                        border: 3px solid #ffffff;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
                    ">
                        <div style="
                            width: 12px;
                            height: 12px;
                            background: #fbbf24;
                            border-radius: 50%;
                            transform: rotate(45deg);
                        "></div>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -36],
            });

            // Pin Ikon Sekolah (Amber/Gold)
            const schoolIcon = L.divIcon({
                className: 'school-pin-marker',
                html: `
                    <div style="
                        width: 36px;
                        height: 36px;
                        background: #d97706;
                        border: 3px solid #ffffff;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
                    ">
                        <div style="
                            width: 12px;
                            height: 12px;
                            background: #ffffff;
                            border-radius: 50%;
                            transform: rotate(45deg);
                        "></div>
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -36],
            });

            const centerLat = hasCoords ? (studentLat + SEKOLAH_COORDS[0]) / 2 : SEKOLAH_COORDS[0];
            const centerLng = hasCoords ? (studentLng + SEKOLAH_COORDS[1]) / 2 : SEKOLAH_COORDS[1];

            const map = L.map(container, {
                center: [centerLat, centerLng],
                zoom: hasCoords ? 13 : 14,
                zoomControl: true,
            });

            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            // Tambahkan Marker Sekolah
            const schoolMarker = L.marker(SEKOLAH_COORDS, { icon: schoolIcon }).addTo(map);
            schoolMarker.bindPopup(`
                <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
                    <strong style="color: #d97706;">[Kampus] ${SEKOLAH_NAMA}</strong><br/>
                    <span>Pusat Kampus Pelaksanaan SPMB</span>
                </div>
            `);

            // Jika ada koordinat siswa
            if (hasCoords) {
                const studentMarker = L.marker([studentLat, studentLng], { icon: studentIcon }).addTo(map);
                studentMarker.bindPopup(`
                    <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
                        <strong style="color: #059669;">[Lokasi Siswa] ${namaLengkap || 'Calon Siswa'}</strong><br/>
                        <span>${alamat || 'Titik Koordinat Terpilih'}</span>
                    </div>
                `).openPopup();

                // Hubungkan garis putus-putus
                const polyline = L.polyline(
                    [
                        [studentLat, studentLng],
                        SEKOLAH_COORDS,
                    ],
                    {
                        color: '#059669',
                        weight: 3,
                        dashArray: '6, 8',
                        opacity: 0.8,
                    }
                ).addTo(map);

                // Auto fit bounds
                const bounds = L.latLngBounds([
                    [studentLat, studentLng],
                    SEKOLAH_COORDS,
                ]);
                map.fitBounds(bounds, { padding: [50, 50] });

                const dist = calculateDistanceKm(
                    studentLat,
                    studentLng,
                    SEKOLAH_COORDS[0],
                    SEKOLAH_COORDS[1]
                );
                if (isMounted) setDistanceKm(dist);
            }
        };

        initMap();

        return () => {
            isMounted = false;
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (e) {
                    console.error('Error removing leaflet map in CMS:', e);
                }
                mapInstanceRef.current = null;
            }
            if (mapContainerRef.current) {
                try {
                    (mapContainerRef.current as any)._leaflet_id = null;
                } catch {}
            }
        };
    }, [studentLat, studentLng, hasCoords, namaLengkap, alamat]);

    const googleMapsUrl = hasCoords
        ? `https://www.google.com/maps?q=${studentLat},${studentLng}`
        : `https://www.google.com/maps?q=${SEKOLAH_COORDS[0]},${SEKOLAH_COORDS[1]}`;

    return (
        <div className="space-y-3 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Peta Titik Koordinat Rumah Siswa (Visualisasi Zonasi GIS)
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Informasi geografis tempat tinggal pendaftar terhadap kampus sekolah
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {hasCoords && distanceKm !== null && (
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Jarak ke Sekolah: ~{distanceKm} km</span>
                        </div>
                    )}
                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Google Maps</span>
                    </a>
                </div>
            </div>

            {!hasCoords && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                        Pendaftar belum menandai titik koordinat rumah di formulir online. Peta di bawah memusatkan tampilan pada kampus SMK Muhammadiyah Sekampung.
                    </span>
                </div>
            )}

            {/* PETA CONTAINER */}
            <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner z-0">
                <div ref={mapContainerRef} className="w-full h-full" />

                {/* Info Card Overlay */}
                <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-xs space-y-1.5 pointer-events-auto z-1000">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                            <span>Koordinat GPS Siswa</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                            {hasCoords ? 'Valid Pin' : 'Default Pusat'}
                        </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        Lat: {studentLat.toFixed(6)} • Lng: {studentLng.toFixed(6)}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> Rumah Calon Siswa
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" /> Kampus SMK MUSKA
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
