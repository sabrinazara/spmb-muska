'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/api';

interface DokumenItem {
    id: string;
    jenisDokumen: string;
    fileUrl: string;
    status: 'PENDING' | 'VALID' | 'INVALID';
    createdAt: string;
    hasiltEkstraksi?: string;
}

export default function UploadDokumenPage() {
    const router = useRouter();
    const [dokumenList, setDokumenList] = useState<DokumenItem[]>([]);
    const [studentNik, setStudentNik] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // Form upload & OCR state
    const [jenisDokumen, setJenisDokumen] = useState('KTP');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // OCR preview state
    const [scanningOcr, setScanningOcr] = useState(false);
    const [ocrScanned, setOcrScanned] = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const [confirmedNik, setConfirmedNik] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(API_ENDPOINTS.PENDAFTARAN.SAYA, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setStudentNik(data.nik || '');
                    setDokumenList(data.dokumen || []);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
            setOcrScanned(false);
            setExtractedText('');
            setConfirmedNik('');
            setAlert(null);
        }
    };

    const handleRunOcr = async () => {
        if (!file) {
            setAlert({ type: 'error', text: 'Pilih file gambar KTP/KK/Ijazah terlebih dahulu.' });
            return;
        }

        setScanningOcr(true);
        setAlert(null);

        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(API_ENDPOINTS.DOKUMEN.SCAN_PREVIEW, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await res.json();

            if (res.ok) {
                setExtractedText(result.text || '');
                setConfirmedNik(result.detectedNik || studentNik || '');
                setOcrScanned(true);
                setAlert({
                    type: 'success',
                    text: 'Ekstraksi AI OCR selesai. Silakan periksa atau koreksi teks di formulir sebelum konfirmasi simpan.',
                });
            } else {
                setAlert({
                    type: 'error',
                    text: result.detail || result.message || 'Gagal menjalankan OCR pada berkas.',
                });
            }
        } catch (err) {
            setAlert({
                type: 'error',
                text: 'Terjadi kesalahan saat menghubungi server OCR Python (port 8000).',
            });
        } finally {
            setScanningOcr(false);
        }
    };

    const handleSubmitDokumen = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setAlert({ type: 'error', text: 'Pilih file gambar terlebih dahulu.' });
            return;
        }

        setSubmitting(true);
        setAlert(null);

        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('jenisDokumen', jenisDokumen);
        formData.append('confirmedNik', confirmedNik);
        formData.append('confirmedText', extractedText);

        try {
            const res = await fetch(API_ENDPOINTS.DOKUMEN.UPLOAD, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await res.json();

            if (res.ok) {
                setAlert({
                    type: 'success',
                    text: result.message || 'Dokumen berhasil diunggah dan disimpan.',
                });
                setFile(null);
                setPreviewUrl(null);
                setOcrScanned(false);
                setExtractedText('');
                setConfirmedNik('');
                await fetchData();
            } else {
                setAlert({
                    type: 'error',
                    text: result.message || 'Gagal menyimpan dokumen.',
                });
            }
        } catch (err) {
            setAlert({
                type: 'error',
                text: 'Gagal terhubung ke backend saat mengunggah dokumen.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    Unggah Dokumen & Otomatisasi AI OCR
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Unggah foto KTP, Kartu Keluarga, atau Ijazah. Sistem AI akan mengekstrak data teks secara otomatis untuk mempercepat proses verifikasi.
                </p>
            </div>

            {/* Alert */}
            {alert && (
                <div
                    className={`p-4 rounded-2xl text-sm font-medium transition-all ${
                        alert.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {alert.type === 'success' ? (
                            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                        <span>{alert.text}</span>
                    </div>
                </div>
            )}

            {/* Main Form Upload */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-amber-300 font-extrabold flex items-center justify-center text-xs shadow-xs">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Formulir Upload & Scan Berkas</h2>
                        <p className="text-xs text-slate-500">Pilih dokumen yang ingin diunggah</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Jenis Dokumen Persyaratan *
                        </label>
                        <select
                            value={jenisDokumen}
                            onChange={(e) => setJenisDokumen(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        >
                            <option value="KTP">KTP Calon Siswa / KTP Orang Tua</option>
                            <option value="KK">Kartu Keluarga (KK)</option>
                            <option value="Ijazah">Ijazah / SKL SMP/MTs</option>
                            <option value="Akta">Akta Kelahiran</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Pilih Foto / Scan Dokumen *
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-slate-200 rounded-xl"
                        />
                    </div>
                </div>

                {/* Preview & OCR Button */}
                {previewUrl && (
                    <div className="p-4 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">{file?.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        Ukuran: {((file?.size || 0) / 1024).toFixed(1)} KB • Tipe: {file?.type}
                                    </div>
                                    <div className="mt-2 text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md inline-block">
                                        Siap dipindai oleh AI OCR
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleRunOcr}
                                disabled={scanningOcr}
                                className="w-full sm:w-auto px-5 py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
                            >
                                {scanningOcr ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        <span>AI Sedang Membaca Teks OCR...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span>Jalankan Ekstraksi AI OCR</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Hasil Ekstraksi OCR yang dapat diedit */}
                        {ocrScanned && (
                            <div className="pt-4 border-t border-slate-200/90 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Hasil Ekstraksi OCR (Bisa Diedit / Validasi Awal)
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Pembacaan Selesai</span>
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            NIK Terdeteksi / Hasil Koreksi:
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={16}
                                            value={confirmedNik}
                                            onChange={(e) => setConfirmedNik(e.target.value)}
                                            placeholder="16 digit NIK"
                                            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                        />
                                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                                            <span>NIK Pendaftaran:</span>
                                            <span className="font-mono font-semibold text-slate-700">{studentNik}</span>
                                            {confirmedNik && confirmedNik === studentNik ? (
                                                <span className="text-emerald-700 font-bold ml-1 inline-flex items-center gap-0.5">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Cocok
                                                </span>
                                            ) : (
                                                <span className="text-amber-700 font-semibold ml-1">(Pastikan sesuai)</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                            Teks Mentah Hasil Scan AI:
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={extractedText}
                                            onChange={(e) => setExtractedText(e.target.value)}
                                            placeholder="Teks hasil scan OCR..."
                                            className="w-full px-4 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleSubmitDokumen}
                                        disabled={submitting}
                                        className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                                </svg>
                                                <span>Menyimpan Dokumen...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span>Konfirmasi & Simpan Dokumen</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tabel Dokumen Tersimpan */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-amber-300 font-extrabold flex items-center justify-center text-xs shadow-xs">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Daftar Dokumen yang Telah Diunggah</h2>
                        <p className="text-xs text-slate-500">Status verifikasi dokumen persyaratan SPMB</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <th className="pb-3">Jenis Dokumen</th>
                                <th className="pb-3">Waktu Unggah</th>
                                <th className="pb-3">Hasil Teks OCR</th>
                                <th className="pb-3">Status Verifikasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dokumenList.length > 0 ? (
                                dokumenList.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50/50">
                                        <td className="py-3.5 font-bold text-slate-800">
                                            {doc.jenisDokumen}
                                        </td>
                                        <td className="py-3.5 text-xs text-slate-500">
                                            {new Date(doc.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="py-3.5 max-w-xs truncate text-xs text-slate-500 font-mono">
                                            {doc.hasiltEkstraksi ? doc.hasiltEkstraksi.slice(0, 50) + '...' : '-'}
                                        </td>
                                        <td className="py-3.5">
                                            {doc.status === 'VALID' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    Terverifikasi (Valid)
                                                </span>
                                            ) : doc.status === 'INVALID' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                    Perlu Perbaikan
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                                    Menunggu Verifikasi
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                                        Belum ada dokumen yang diunggah. Silakan pilih jenis berkas di atas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
