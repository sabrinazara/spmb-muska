'use client';

import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, CheckCircle2, AlertCircle, Loader2, Link2 } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS, getAuthUploadHeaders } from '@/lib/api';

interface ImageUploaderProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    aspectRatio?: 'banner' | 'square' | 'portrait' | 'auto';
    required?: boolean;
    helperText?: string;
    className?: string;
}

export default function ImageUploader({
    label,
    value,
    onChange,
    aspectRatio = 'auto',
    required = false,
    helperText,
    className = '',
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showManualUrl, setShowManualUrl] = useState(false);
    const [manualUrlInput, setManualUrlInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Format display URL: if relative path like /uploads/..., prepend API_BASE_URL for reliable rendering
    const getDisplayUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
        const clean = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${clean}`;
    };

    // Handle File Upload to NestJS API
    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Validasi tipe file
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
            setErrorMsg('Format file harus berupa gambar (JPG, PNG, WEBP, GIF, atau SVG)');
            return;
        }

        // Validasi ukuran maks 10MB
        if (file.size > 10 * 1024 * 1024) {
            setErrorMsg('Ukuran gambar maksimal 10MB');
            return;
        }

        setErrorMsg(null);
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(API_ENDPOINTS.WEBSITE.UPLOAD_IMAGE, {
                method: 'POST',
                headers: getAuthUploadHeaders(),
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.url) {
                onChange(data.url);
                setErrorMsg(null);
            } else {
                setErrorMsg(data.message || 'Gagal mengunggah gambar ke server');
            }
        } catch {
            setErrorMsg('Koneksi terputus saat mengunggah gambar. Pastikan backend aktif.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    // Container aspect ratio class
    const getAspectClass = () => {
        switch (aspectRatio) {
            case 'banner':
                return 'aspect-[21/9] sm:aspect-[16/7]';
            case 'square':
                return 'aspect-square max-w-[200px]';
            case 'portrait':
                return 'aspect-[4/5] max-w-[220px]';
            default:
                return 'aspect-[16/9] max-h-52';
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label & Optional Toggle */}
            <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
                <button
                    type="button"
                    onClick={() => {
                        setShowManualUrl(!showManualUrl);
                        if (!showManualUrl) setManualUrlInput(value || '');
                    }}
                    className="text-[11px] text-slate-400 hover:text-emerald-600 transition flex items-center gap-1 cursor-pointer"
                >
                    <Link2 className="w-3 h-3" />
                    <span>{showManualUrl ? 'Mode Upload File' : 'Gunakan URL Manual'}</span>
                </button>
            </div>

            {/* Hidden Native File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Manual URL Input (Optional Fallback) */}
            {showManualUrl ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={manualUrlInput}
                        onChange={(e) => {
                            setManualUrlInput(e.target.value);
                            onChange(e.target.value);
                        }}
                        placeholder="https://... atau /uploads/..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                        Pilih File
                    </button>
                </div>
            ) : (
                /* Primary Image Upload & Preview Interface */
                <div>
                    {value ? (
                        /* EXISTING IMAGE PREVIEW */
                        <div className="relative rounded-2xl border-2 border-emerald-500/30 dark:border-emerald-500/20 bg-slate-50 dark:bg-slate-900/50 p-2.5 overflow-hidden group shadow-xs">
                            <div className={`w-full ${getAspectClass()} rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative mx-auto`}>
                                <img
                                    src={getDisplayUrl(value)}
                                    alt="Pratinjau"
                                    className="w-full h-full object-cover rounded-xl"
                                    onError={(e) => {
                                        // Fallback ke logo jika gagal memuat
                                        e.currentTarget.src = '/logo.png';
                                    }}
                                />

                                {/* Uploading Overlay */}
                                {uploading && (
                                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 z-20">
                                        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                                        <span className="text-xs font-bold">Mengunggah gambar baru...</span>
                                    </div>
                                )}
                            </div>

                            {/* Info bar & Action Buttons */}
                            <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[240px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{value.split('/').pop() || 'Gambar Terpasang'}</span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        disabled={uploading}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${uploading ? 'animate-spin' : ''}`} />
                                        <span>Ganti Gambar</span>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={uploading}
                                        onClick={() => onChange('')}
                                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                        title="Hapus Gambar"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* DROPZONE KOSONG */
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => !uploading && fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                                isDragging
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 scale-[1.01]'
                                    : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-emerald-50/20'
                            }`}
                        >
                            {uploading ? (
                                <div className="py-4 space-y-2 flex flex-col items-center">
                                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                        Sedang mengunggah gambar ke server...
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                                        <UploadCloud className="w-6 h-6" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                                            Klik untuk memilih gambar atau seret (drag & drop) ke sini
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            {helperText || 'Format didukung: PNG, JPG, WEBP, SVG (Maks. 10MB)'}
                                        </p>
                                    </div>

                                    <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition">
                                        Pilih Gambar dari Komputer
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {errorMsg && (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}
        </div>
    );
}
