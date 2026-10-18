'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Crosshair, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface GisMapPickerProps {
    latitude?: number | null;
    longitude?: number | null;
    onChange: (coords: { latitude: number; longitude: number }) => void;
}

// Koordinat Pusat Default: SMK Muhammadiyah Sekampung, Lampung Timur
const DEFAULT_LAT = -5.1973;
const DEFAULT_LNG = 105.4414;

export default function GisMapPicker({ latitude, longitude, onChange }: GisMapPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);

    const currentLat = latitude ?? DEFAULT_LAT;
    const currentLng = longitude ?? DEFAULT_LNG;

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

            // Fix default marker icon Leaflet di Next.js bundler
            const customIcon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: `
                    <div style="
                        width: 36px;
                        height: 36px;
                        background: #047857;
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
                // popupAnchor: [0, -36],
            });

            // Inisialisasi peta Leaflet
            const map = L.map(container, {
                center: [currentLat, currentLng],
                zoom: latitude ? 15 : 13,
                zoomControl: true,
            });

            mapInstanceRef.current = map;

            // Gunakan OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kontributor',
                maxZoom: 19,
            }).addTo(map);

            // Tambahkan marker yang dapat digeser (draggable)
            const marker = L.marker([currentLat, currentLng], {
                draggable: true,
                icon: customIcon,
            }).addTo(map);

            markerRef.current = marker;

            marker.bindPopup('<b>Lokasi Rumah Anda</b><br>Geser pin atau klik peta untuk menandai titik tepat.').openPopup();

            // Event geser marker
            marker.on('dragend', () => {
                const pos = marker.getLatLng();
                onChange({ latitude: Number(pos.lat.toFixed(6)), longitude: Number(pos.lng.toFixed(6)) });
            });

            // Event klik di area peta
            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                map.panTo([lat, lng]);
                marker.openPopup();
                onChange({ latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) });
            });
        };

        initMap();

        return () => {
            isMounted = false;
            if (mapInstanceRef.current) {
                try {
                    mapInstanceRef.current.remove();
                } catch (e) {
                    console.error('Error removing leaflet map:', e);
                }
                mapInstanceRef.current = null;
            }
            if (mapContainerRef.current) {
                try {
                    (mapContainerRef.current as any)._leaflet_id = null;
                } catch { }
            }
            markerRef.current = null;
        };
    }, []);

    // Perbarui posisi marker jika koordinat berubah dari luar
    useEffect(() => {
        if (markerRef.current && mapInstanceRef.current && latitude && longitude) {
            const currentMarkerPos = markerRef.current.getLatLng();
            if (Math.abs(currentMarkerPos.lat - latitude) > 0.0001 || Math.abs(currentMarkerPos.lng - longitude) > 0.0001) {
                markerRef.current.setLatLng([latitude, longitude]);
                mapInstanceRef.current.panTo([latitude, longitude]);
            }
        }
    }, [latitude, longitude]);

    // Ambil lokasi GPS perangkat user
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setGeoError('Perangkat Anda tidak mendukung fitur geolokasi GPS.');
            return;
        }

        setIsLocating(true);
        setGeoError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setIsLocating(false);
                const lat = Number(pos.coords.latitude.toFixed(6));
                const lng = Number(pos.coords.longitude.toFixed(6));

                if (markerRef.current && mapInstanceRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                    mapInstanceRef.current.setView([lat, lng], 16);
                    markerRef.current.openPopup();
                }

                onChange({ latitude: lat, longitude: lng });
            },
            (err) => {
                setIsLocating(false);
                setGeoError(`Gagal mendeteksi lokasi GPS: ${err.message}. Silakan tandai langsung pada peta.`);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className="space-y-3">
            {/* Header Kontrol Peta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Titik Koordinat Rumah (Peta GIS)</span>
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Klik pada peta atau geser pin merah-hijau untuk menandai lokasi tempat tinggal Anda
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Mencari GPS...' : 'Gunakan Lokasi Saya Saat Ini'}</span>
                </button>
            </div>

            {geoError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{geoError}</span>
                </div>
            )}

            {/* Container Canvas Leaflet Map */}
            <div className="relative w-full h-72 sm:h-80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs z-0">
                <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            {/* Readout Koordinat Terpilih */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5 text-slate-400" />
                        <span>Latitude:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">
                        {latitude !== null && latitude !== undefined ? latitude.toFixed(6) : '-'}
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5 text-slate-400" />
                        <span>Longitude:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">
                        {longitude !== null && longitude !== undefined ? longitude.toFixed(6) : '-'}
                    </span>
                </div>
            </div>
        </div>
    );
}
