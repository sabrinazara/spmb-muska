'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    UploadCloud,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    Info,
    Eye,
    ShieldCheck,
    CreditCard,
    Camera,
    RefreshCw,
    X,
} from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '@/lib/api';

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
    const [jenisDokumen, setJenisDokumen] = useState('KK');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // OCR preview state
    const [scanningOcr, setScanningOcr] = useState(false);
    const [ocrScanned, setOcrScanned] = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const [confirmedNik, setConfirmedNik] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Image Modal preview
    const [modalImage, setModalImage] = useState<string | null>(null);
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
            setAlert({ type: 'error', text: 'Pilih file gambar dokumen terlebih dahulu.' });
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
        } catch {
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
                    text: result.message || 'Dokumen berhasil diunggah dan tersimpan.',
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
        } catch {
            setAlert({
                type: 'error',
                text: 'Gagal terhubung ke backend saat mengunggah dokumen.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // SKELETON LOADING
    if (loading) {
        return (
            <div className="space-y-6 font-sans animate-pulse">
                <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-20 bg-emerald-100/60 rounded-2xl"></div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="h-12 bg-slate-100 rounded-xl"></div>
                        <div className="h-12 bg-slate-100 rounded-xl"></div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-32 bg-slate-100 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header Title */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                    Unggah Dokumen Persyaratan & Verifikasi AI OCR
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Unggah dokumen persyaratan calon siswa baru. Sistem dilengkapi pemindai AI OCR otomatis untuk mencocokkan NIK dan data siswa.
                </p>
            </div>

            {/* NOTIFIKASI PENDAFTARAN GRATIS & SOLUSI KTP SMP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Banner 1: Pendaftaran Gratis */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                            Pendaftaran Online 100% Gratis
                        </div>
                        <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
                            Pendaftaran online awal tidak dipungut biaya (Rp 0). Biaya administrasi daftar ulang (seragam & SPP) dibayarkan langsung secara offline saat siswa datang ke sekolah pada jadwal yang ditentukan.
                        </p>
                    </div>
                </div>

                {/* Banner 2: Solusi KTP Siswa SMP */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
                            Petunjuk Identitas Calon Siswa (SMP/MTs)
                        </div>
                        <p className="text-xs text-blue-800/90 mt-1 leading-relaxed">
                            Karena lulusan SMP/MTs belum memiliki e-KTP, gunakan <strong>Kartu Keluarga (KK)</strong> sebagai berkas utama untuk verifikasi NIK, atau gunakan <strong>Kartu Pelajar / KIA</strong> dan <strong>SKL</strong>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Alert Message */}
            {alert && (
                <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-2xs animate-in fade-in duration-200 ${
                        alert.type === 'success'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-rose-50 text-rose-900 border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${alert.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                            {alert.type === 'success' ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                                <AlertCircle className="w-3.5 h-3.5" />
                            )}
                        </span>
                        <span>{alert.text}</span>
                    </div>
                    <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* FORMULIR UPLOAD & SCAN AI OCR */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                    <div className="w-9 h-9 rounded-xl bg-emerald-700 text-amber-300 font-extrabold flex items-center justify-center shadow-xs">
                        <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Unggah Berkas & Ekstraksi AI OCR</h2>
                        <p className="text-xs text-slate-500">Pilih berkas Kartu Keluarga, Kartu Pelajar, SKL/Ijazah, atau Pas Foto Resmi</p>
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
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        >
                            <option value="KK">Kartu Keluarga (KK) - Utama Verifikasi NIK</option>
                            <option value="KIA_KARTU_PELAJAR">Kartu Pelajar SMP / KIA (Kartu Identitas Anak)</option>
                            <option value="SKL_IJAZAH">Surat Keterangan Lulus (SKL) / Ijazah SMP</option>
                            <option value="PAS_FOTO">Pas Foto Resmi Calon Siswa (3x4)</option>
                            <option value="AKTA">Akta Kelahiran Siswa</option>
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
                            className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-slate-300 rounded-xl"
                        />
                    </div>
                </div>

                {/* Preview & OCR Button */}
                {previewUrl && (
                    <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in duration-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                                    <img src={previewUrl} alt="Preview Dokumen" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">{file?.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        Ukuran: {((file?.size || 0) / 1024).toFixed(1)} KB • Tipe: {file?.type}
                                    </div>
                                    <div className="mt-2 text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Siap dipindai dengan teknologi Python OCR</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleRunOcr}
                                disabled={scanningOcr}
                                className="w-full sm:w-auto px-5 py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                            >
                                {scanningOcr ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                                        <span>AI Sedang Mengekstraksi Teks...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 text-amber-300" />
                                        <span>Jalankan Ekstraksi AI OCR</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* OCR RESULT / VERIFICATION */}
                        {ocrScanned ? (
                            <div className="pt-4 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Hasil Ekstraksi OCR (Bisa Dikoreksi Sebelum Simpan)
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Ekstraksi Selesai</span>
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
                                                <span className="text-emerald-700 font-bold ml-1 inline-flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>Cocok Otomatis</span>
                                                </span>
                                            ) : (
                                                <span className="text-amber-700 font-semibold ml-1">(Pastikan NIK sesuai)</span>
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
                                        className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                <span>Menyimpan Dokumen...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                                                <span>Konfirmasi & Simpan Dokumen</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="pt-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSubmitDokumen}
                                    disabled={submitting}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-4 h-4" />
                                            <span>Langsung Simpan Tanpa OCR</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* TABEL DOKUMEN YANG TELAH DIUNGGAH */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Daftar Dokumen yang Telah Diunggah</h2>
                        <p className="text-xs text-slate-500">Berkas yang diunggah akan diverifikasi secara teliti oleh panitia SPMB</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                        title="Segarkan data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <th className="pb-3">Jenis Dokumen</th>
                                <th className="pb-3">Waktu Unggah</th>
                                <th className="pb-3">Hasil AI OCR</th>
                                <th className="pb-3">Status Verifikasi</th>
                                <th className="pb-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dokumenList.length > 0 ? (
                                dokumenList.map((doc) => {
                                    const fullDocUrl = doc.fileUrl.startsWith('http')
                                        ? doc.fileUrl
                                        : `${API_BASE_URL}${doc.fileUrl.startsWith('/') ? '' : '/'}${doc.fileUrl}`;

                                    return (
                                        <tr key={doc.id} className="hover:bg-slate-50/50 transition">
                                            <td className="py-3.5 font-bold text-slate-800">
                                                {doc.jenisDokumen === 'KK'
                                                    ? 'Kartu Keluarga (KK)'
                                                    : doc.jenisDokumen === 'KIA_KARTU_PELAJAR'
                                                    ? 'Kartu Pelajar / KIA'
                                                    : doc.jenisDokumen === 'SKL_IJAZAH'
                                                    ? 'SKL / Ijazah SMP'
                                                    : doc.jenisDokumen === 'PAS_FOTO'
                                                    ? 'Pas Foto 3x4'
                                                    : doc.jenisDokumen}
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
                                                {doc.hasiltEkstraksi ? doc.hasiltEkstraksi.slice(0, 40) + '...' : '-'}
                                            </td>
                                            <td className="py-3.5">
                                                {doc.status === 'VALID' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Terverifikasi (Valid)</span>
                                                    </span>
                                                ) : doc.status === 'INVALID' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                                                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                                        <span>Perlu Perbaikan</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                                        <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                                                        <span>Menunggu Verifikasi</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 text-right">
                                                <button
                                                    onClick={() => setModalImage(fullDocUrl)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Lihat File</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                                        Belum ada dokumen persyaratan yang diunggah.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PREVIEW MODAL IMAGE */}
            {modalImage && (
                <div
                    onClick={() => setModalImage(null)}
                    className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl space-y-4"
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-800">Pratinjau Berkas Dokumen</h3>
                            <button
                                onClick={() => setModalImage(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-100 rounded-xl p-2">
                            <img
                                src={modalImage}
                                alt="Dokumen Pratinjau"
                                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-xs"
                                onError={(e) => {
                                    e.currentTarget.alt = 'File tidak dapat dimuat sebagai gambar.';
                                }}
                            />
                        </div>
                        <div className="flex justify-end">
                            <a
                                href={modalImage}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                            >
                                Buka di Tab Baru
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
