'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Plus, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS, getAuthUploadHeaders } from '@/lib/api';

interface MultiImageUploaderProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  maxPhotos?: number;
  helperText?: string;
  className?: string;
}

export default function MultiImageUploader({
  label,
  value = [],
  onChange,
  maxPhotos = 5,
  helperText = 'Unggah foto dokumentasi / fasilitas jurusan (maks. 5 foto)',
  className = '',
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDisplayUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
    const clean = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL}${clean}`;
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (value.length >= maxPhotos) {
      setErrorMsg(`Maksimal ${maxPhotos} foto telah tercapai.`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
      setErrorMsg('Format file harus berupa gambar (JPG, PNG, WEBP, GIF, atau SVG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran gambar maksimal 10MB per foto');
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
        const nextList = [...value, data.url].slice(0, maxPhotos);
        onChange(nextList);
        setErrorMsg(null);
      } else {
        setErrorMsg(data.message || 'Gagal mengunggah gambar');
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

  const handleRemovePhoto = (index: number) => {
    const nextList = value.filter((_, i) => i !== index);
    onChange(nextList);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header Label & Counter */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
            {label}
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
            value.length >= maxPhotos
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {value.length} / {maxPhotos} Foto
        </span>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Photos Grid & Add Trigger */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {value.map((url, idx) => (
          <div
            key={idx}
            className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group shadow-2xs"
          >
            <img
              src={getDisplayUrl(url)}
              alt={`Foto ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              onError={(e) => {
                e.currentTarget.src = '/banner-spmb.jpg';
              }}
            />

            {/* Badge urutan foto */}
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-mono font-bold backdrop-blur-xs">
              #{idx + 1}
            </div>

            {/* Tombol Hapus */}
            <button
              type="button"
              onClick={() => handleRemovePhoto(idx)}
              className="absolute top-2 right-2 p-1.5 rounded-xl bg-rose-600/90 text-white hover:bg-rose-600 transition shadow-md cursor-pointer opacity-90 group-hover:opacity-100"
              title="Hapus foto ini"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Upload Button Box if < maxPhotos */}
        {value.length < maxPhotos && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-4/3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 flex flex-col items-center justify-center p-3 text-center transition cursor-pointer disabled:opacity-50 space-y-1.5"
          >
            {uploading ? (
              <div className="flex flex-col items-center space-y-1">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-[10px] font-bold text-slate-500">Mengunggah...</span>
              </div>
            ) : (
              <>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Tambah Foto
                </div>
                <div className="text-[9px] text-slate-400 font-medium">
                  Sisa {maxPhotos - value.length} slot
                </div>
              </>
            )}
          </button>
        )}
      </div>

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
