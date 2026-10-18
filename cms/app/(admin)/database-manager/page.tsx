'use client';

import { useState, useRef } from 'react';
import {
    Database,
    Download,
    Upload,
    FileJson,
    CheckCircle2,
    AlertCircle,
    ShieldAlert,
    Clock,
    RotateCcw,
    Check,
    X,
    Loader2,
    HardDrive,
    FileCheck,
    AlertTriangle,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api';

interface BackupMeta {
    aplikasi: string;
    versi: string;
    tanggalBackup: string;
    jumlahData: {
        users: number;
        pendaftaran: number;
        dokumen: number;
        jurusan: number;
        knowledgeBase: number;
    };
}

export default function DatabaseManagerPage() {
    const [downloading, setDownloading] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

    // File restore state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewMeta, setPreviewMeta] = useState<any | null>(null);
    const [fileContent, setFileContent] = useState<any | null>(null);
    const [showConfirmRestore, setShowConfirmRestore] = useState(false);
    const [restoreResult, setRestoreResult] = useState<any | null>(null);

    // 1. BACKUP DATA (.json)
    const handleDownloadBackup = async () => {
        setDownloading(true);
        setAlertMsg(null);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.DB_BACKUP, {
                headers: getAuthHeaders(),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Gagal mengekspor data cadangan');
            }

            const backupData = await res.json();
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
            const downloadAnchor = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            downloadAnchor.setAttribute('href', dataStr);
            downloadAnchor.setAttribute('download', `backup_spmb_muska_${timestamp}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            setAlertMsg({
                type: 'success',
                text: 'Cadangan database berhasil diunduh dalam format .json lengkap!',
            });
        } catch (err: any) {
            setAlertMsg({
                type: 'error',
                text: err.message || 'Terjadi kesalahan saat mengunduh cadangan database.',
            });
        } finally {
            setDownloading(false);
        }
    };

    // 2. FILE SELECTION & PREVIEW
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            setAlertMsg({
                type: 'error',
                text: 'Format file tidak didukung! Harap unggah file cadangan berekstensi .json',
            });
            return;
        }

        setSelectedFile(file);
        setAlertMsg(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                if (!parsed || !parsed.data) {
                    throw new Error('Struktur file cadangan tidak valid (objek data tidak ditemukan).');
                }
                setFileContent(parsed);
                setPreviewMeta(parsed.meta || {
                    tanggalBackup: 'Tidak tercatat',
                    jumlahData: {
                        pendaftaran: Array.isArray(parsed.data.pendaftaran) ? parsed.data.pendaftaran.length : 0,
                        jurusan: Array.isArray(parsed.data.jurusan) ? parsed.data.jurusan.length : 0,
                    },
                });
            } catch (err: any) {
                setSelectedFile(null);
                setFileContent(null);
                setPreviewMeta(null);
                setAlertMsg({
                    type: 'error',
                    text: `Gagal membaca isi file JSON: ${err.message}`,
                });
            }
        };
        reader.readAsText(file);
    };

    // 3. RESTORE DATA VIA PRISMA TRANSACTION
    const handleExecuteRestore = async () => {
        if (!fileContent) return;

        setRestoring(true);
        setAlertMsg(null);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.DB_RESTORE, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(fileContent),
            });

            const result = await res.json();

            if (res.ok) {
                setRestoreResult(result);
                setShowConfirmRestore(false);
                setSelectedFile(null);
                setFileContent(null);
                setPreviewMeta(null);
                if (fileInputRef.current) fileInputRef.current.value = '';

                setAlertMsg({
                    type: 'success',
                    text: `Pemulihan data berhasil! ${result.hasilRestore?.pendaftaranRestored || 0} pendaftar dan ${result.hasilRestore?.jurusanRestored || 0} jurusan berhasil dipulihkan.`,
                });
            } else {
                throw new Error(result.message || 'Gagal memulihkan database.');
            }
        } catch (err: any) {
            setAlertMsg({
                type: 'error',
                text: err.message || 'Terjadi kesalahan server saat pemulihan transaksi database.',
            });
        } finally {
            setRestoring(false);
        }
    };

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-200">
            {/* HEADER BANNER */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Disaster Recovery & Database Manager</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                        Pusat Cadangan & Pemulihan Database
                    </h1>
                    <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
                        Simpan salinan data pendaftar, nilai seleksi, pengaturan kuota, dan audit sistem ke format JSON atau pulihkan data dari file cadangan sebelumnya secara aman melalui transaksi atomic database.
                    </p>
                </div>
            </div>

            {/* ALERT NOTIFICATION */}
            {alertMsg && (
                <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-2xs animate-in fade-in duration-200 ${
                        alertMsg.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                            : alertMsg.type === 'warning'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        {alertMsg.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        )}
                        <span>{alertMsg.text}</span>
                    </div>
                    <button
                        onClick={() => setAlertMsg(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* TWO COLUMNS: BACKUP & RESTORE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. KARTU BACKUP DATA */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Download className="w-6 h-6" />
                        </div>

                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                1. Cadangkan Seluruh Data (Backup)
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Ekspor seluruh arsip pendaftar, nilai seleksi, dokumen terunggah, kuota jurusan, dan konfigurasi sistem ke dalam satu berkas terenkripsi <code>.json</code>.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                            <div className="font-bold text-slate-700 dark:text-slate-300">
                                Berkas Backup Mencakup:
                            </div>
                            <ul className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                                <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Akun User & Role</span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Biodata & Form Pendaftar</span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Koordinat GIS Peta</span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Nilai & Jadwal Ujian</span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Kuota 8 Jurusan</span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>System Settings & Audit</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleDownloadBackup}
                            disabled={downloading}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {downloading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Mengekspor Database...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    <span>Backup Data Sekarang (.json)</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* 2. KARTU RESTORE DATA */}
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Upload className="w-6 h-6" />
                        </div>

                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                2. Pulihkan Data dari Cadangan (Restore)
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Masukkan berkas cadangan <code>.json</code> yang pernah diunduh. Sistem akan melakukan sinkronisasi atomic melalui <code>prisma.$transaction</code>.
                            </p>
                        </div>

                        {/* File Upload Box */}
                        <div className="relative">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,application/json"
                                onChange={handleFileChange}
                                className="hidden"
                                id="json-file-input"
                            />
                            <label
                                htmlFor="json-file-input"
                                className="w-full p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition cursor-pointer flex flex-col items-center justify-center text-center gap-2 group"
                            >
                                <FileJson className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition" />
                                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {selectedFile ? selectedFile.name : 'Pilih atau Seret Berkas .json Cadangan'}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    {selectedFile
                                        ? `${(selectedFile.size / 1024).toFixed(1)} KB • Siap diproses`
                                        : 'Maksimum ukuran 50 MB'}
                                </div>
                            </label>
                        </div>

                        {/* Pratinjau Metadata File Cadangan */}
                        {previewMeta && (
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2 animate-in fade-in duration-200">
                                <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                    <FileCheck className="w-4 h-4" />
                                    <span>Pratinjau Berkas Cadangan Terdeteksi:</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                                    <div>
                                        Waktu Cadangan:{' '}
                                        <strong className="block text-slate-900 dark:text-white">
                                            {previewMeta.tanggalBackup !== 'Tidak tercatat'
                                                ? new Date(previewMeta.tanggalBackup).toLocaleString('id-ID')
                                                : '-'}
                                        </strong>
                                    </div>
                                    <div>
                                        Data Pendaftar:{' '}
                                        <strong className="block text-emerald-600 dark:text-emerald-400">
                                            {previewMeta.jumlahData?.pendaftaran || 0} Siswa
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={() => setShowConfirmRestore(true)}
                            disabled={!selectedFile || !fileContent || restoring}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {restoring ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Memulihkan Database Transaksi...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    <span>Restore Data ke Database</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* SAFETY NOTICE BANNER */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                    <ShieldAlert className="w-4 h-4 text-emerald-500" />
                    <span>Panduan Keamanan Disaster Recovery SPMB MUSKA</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600 dark:text-slate-400">
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">Prisma Atomic Transaction</div>
                        <p>
                            Proses restore dijalankan dalam satu blok <code>prisma.$transaction</code>. Jika terjadi gangguan pada salah satu baris data, perubahan otomatis di-rollback tanpa merusak data lain.
                        </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">Mekanisme Upsert Pintar</div>
                        <p>
                            Sistem menggunakan metode upsert berdasarkan NISN pendaftar dan nama jurusan, sehingga data yang sudah ada akan diperbarui tanpa membuat duplikasi entitas.
                        </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">Audit Trail Otomatis</div>
                        <p>
                            Setiap aktivitas Backup dan Restore secara transparan dicatat dalam tabel Audit Log lengkap dengan identitas administrator dan waktu eksekusi.
                        </p>
                    </div>
                </div>
            </div>

            {/* CONFIRMATION RESTORE MODAL */}
            {showConfirmRestore && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6" />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                Konfirmasi Pemulihan Database
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Apakah Anda yakin ingin memulihkan data dari berkas <strong>{selectedFile?.name}</strong>?
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 space-y-2">
                            <div className="font-bold flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>Peringatan Administrator:</span>
                            </div>
                            <p className="leading-relaxed">
                                Data yang berbenturan akan diperbarui (upsert) sesuai konten berkas cadangan. Pastikan berkas yang diunggah adalah cadangan resmi yang valid.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowConfirmRestore(false)}
                                disabled={restoring}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteRestore}
                                disabled={restoring}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {restoring ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Memulihkan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Ya, Lakukan Restore</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
