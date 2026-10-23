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
    ChevronDown,
    Check,
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

interface ParsedOcrData {
    nik?: string;
    nama?: string;
    tempat_tanggal_lahir?: string;
    jenis_kelamin?: string;
    alamat?: string;
    rt_rw?: string;
    kel_desa?: string;
    kecamatan?: string;
    agama?: string;
    pekerjaan?: string;
    no_kk?: string;
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
    const [parsedFields, setParsedFields] = useState<ParsedOcrData>({});
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

    const executeOcrScan = async (targetFile?: File | null) => {
        const fileToScan = targetFile || file;
        if (!fileToScan) {
            setAlert({ type: 'error', text: 'Pilih file gambar dokumen terlebih dahulu.' });
            return;
        }

        setScanningOcr(true);
        setAlert(null);

        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', fileToScan);
        if (studentNik) {
            formData.append('studentNik', studentNik);
        }

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
                const rawText = result.text || '';
                const rawParsed = result.parsed || result.parsedData || {};
                const detectedNik = result.detectedNik || rawParsed.nik || studentNik || '';

                const normalizedFields: ParsedOcrData = {
                    nik: detectedNik,
                    nama: rawParsed.nama && rawParsed.nama !== '-' ? rawParsed.nama : '',
                    tempat_tanggal_lahir: rawParsed.tempat_tanggal_lahir && rawParsed.tempat_tanggal_lahir !== '-'
                        ? rawParsed.tempat_tanggal_lahir
                        : [rawParsed.tempat_lahir, rawParsed.tanggal_lahir].filter((v: any) => v && v !== '-').join(', '),
                    jenis_kelamin: rawParsed.jenis_kelamin && rawParsed.jenis_kelamin !== '-' ? rawParsed.jenis_kelamin : '',
                    alamat: rawParsed.alamat && rawParsed.alamat !== '-' ? rawParsed.alamat : '',
                    rt_rw: rawParsed.rt_rw && rawParsed.rt_rw !== '-' ? rawParsed.rt_rw : '',
                    kel_desa: rawParsed.kel_desa && rawParsed.kel_desa !== '-' ? rawParsed.kel_desa : '',
                    kecamatan: rawParsed.kecamatan && rawParsed.kecamatan !== '-' ? rawParsed.kecamatan : '',
                    agama: rawParsed.agama && rawParsed.agama !== '-' ? rawParsed.agama : '',
                    pekerjaan: rawParsed.pekerjaan && rawParsed.pekerjaan !== '-' ? rawParsed.pekerjaan : 'PELAJAR / MAHASISWA',
                    no_kk: rawParsed.no_kk && rawParsed.no_kk !== '-' ? rawParsed.no_kk : (rawParsed.nomor_kk && rawParsed.nomor_kk !== '-' ? rawParsed.nomor_kk : ''),
                };

                setExtractedText(rawText);
                setConfirmedNik(detectedNik);
                setParsedFields(normalizedFields);
                setOcrScanned(true);

                setAlert({
                    type: 'success',
                    text: 'Ekstraksi AI OCR selesai. Seluruh data identitas dokumen berhasil diekstraksi ke formulir.',
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
            setOcrScanned(false);
            setExtractedText('');
            setConfirmedNik('');
            setParsedFields({});
            setAlert(null);

            // Jalankan ekstraksi AI OCR otomatis segera saat user mengunggah berkas
            executeOcrScan(selected);
        }
    };

    const handleRunOcr = async () => {
        await executeOcrScan(file);
    };

    const handleParsedFieldChange = (key: keyof ParsedOcrData, value: string) => {
        setParsedFields((prev) => ({
            ...prev,
            [key]: value,
        }));
        if (key === 'nik') {
            setConfirmedNik(value);
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
        formData.append('confirmedParsedData', JSON.stringify(parsedFields));
        formData.append('parsedData', JSON.stringify(parsedFields));

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
                    text: result.message || 'Dokumen berhasil diunggah dan disimpan ke database panitia.',
                });
                setFile(null);
                setPreviewUrl(null);
                setOcrScanned(false);
                setExtractedText('');
                setConfirmedNik('');
                setParsedFields({});
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
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                <div className="h-20 bg-emerald-100/60 dark:bg-emerald-950/40 rounded-2xl"></div>
                <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded-xl"></div>
                        <div className="h-12 bg-slate-100 dark:bg-slate-900 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header Title */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Unggah Dokumen Persyaratan
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Unggah dokumen persyaratan calon siswa baru. Sistem dilengkapi pemindai AI OCR otomatis untuk mengekstraksi seluruh data identitas dokumen.
                </p>
            </div>

            {/* NOTIFIKASI PENDAFTARAN GRATIS & SOLUSI KTP SMP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Banner 1: Pendaftaran Gratis */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                            Pendaftaran Online 100% Gratis
                        </div>
                        <p className="text-xs text-emerald-800/90 dark:text-emerald-300/80 mt-1 leading-relaxed">
                            Pendaftaran online awal tidak dipungut biaya (Rp 0). Biaya administrasi daftar ulang (seragam & SPP) dibayarkan langsung secara offline saat siswa datang ke sekolah pada jadwal yang ditentukan.
                        </p>
                    </div>
                </div>

                {/* Banner 2: Solusi KTP Siswa SMP */}
                <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                            Petunjuk Identitas Calon Siswa (SMP/MTs)
                        </div>
                        <p className="text-xs text-blue-800/90 dark:text-blue-300/80 mt-1 leading-relaxed">
                            Karena lulusan SMP/MTs belum memiliki e-KTP, gunakan <strong>Kartu Keluarga (KK)</strong> sebagai berkas utama untuk verifikasi NIK, atau gunakan <strong>Kartu Pelajar / KIA</strong> dan <strong>SKL</strong>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Alert Message */}
            {alert && (
                <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-2xs animate-in fade-in duration-200 ${alert.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
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
                    <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* FORMULIR UPLOAD & SCAN AI OCR */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center shadow-xs">
                        <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Unggah Berkas & Ekstraksi AI OCR</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Pilih berkas Kartu Keluarga, Kartu Pelajar, SKL/Ijazah, atau Pas Foto Resmi</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            Jenis Dokumen Persyaratan *
                        </label>
                        <div className="relative">
                            <select
                                value={jenisDokumen}
                                onChange={(e) => setJenisDokumen(e.target.value)}
                                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                            >
                                <option value="KK">Kartu Keluarga (KK) - Utama Verifikasi NIK</option>
                                <option value="KIA_KARTU_PELAJAR">Kartu Pelajar SMP / KIA (Kartu Identitas Anak)</option>
                                <option value="SKL_IJAZAH">Surat Keterangan Lulus (SKL) / Ijazah SMP</option>
                                <option value="PAS_FOTO">Pas Foto Resmi Calon Siswa (3x4)</option>
                                <option value="AKTA">Akta Kelahiran Siswa</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            Pilih Foto / Scan Dokumen *
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950/60 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100 dark:hover:file:bg-emerald-900/60 cursor-pointer border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl"
                        />
                    </div>
                </div>

                {/* Preview & OCR Button */}
                {previewUrl && (
                    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shrink-0 shadow-xs flex items-center justify-center">
                                    <img src={previewUrl} alt="Preview Dokumen" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{file?.name}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Ukuran: {((file?.size || 0) / 1024).toFixed(1)} KB • Tipe: {file?.type}
                                    </div>
                                    <div className="mt-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                                        <span>Berhasil Upload</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleRunOcr}
                                disabled={scanningOcr}
                                className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                            >
                                {scanningOcr ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                                        <span>AI Sedang Mengekstraksi Seluruh Data...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Jalankan Ekstraksi</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* FULL STRUCTURED OCR RESULT / VERIFICATION */}
                        {ocrScanned ? (
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <span>Seluruh Data Hasil Ekstraksi AI OCR</span>
                                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                                                Lengkap
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            Semua teks dan data identitas yang berhasil dibaca. Anda dapat mengoreksi sebelum konfirmasi simpan.
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Ekstraksi Sukses</span>
                                    </span>
                                </div>

                                {/* STRUCTURED IDENTITY FIELDS GRID */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                                    {/* NIK */}
                                    <div className="sm:col-span-2 lg:col-span-1">
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                                            NIK (16 Digit)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={16}
                                            value={confirmedNik}
                                            onChange={(e) => handleParsedFieldChange('nik', e.target.value)}
                                            placeholder="16 Digit NIK"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        />
                                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                            <span>Akun: {studentNik || '-'}</span>
                                            {confirmedNik && confirmedNik === studentNik ? (
                                                <span className="text-emerald-600 font-bold ml-1 inline-flex items-center gap-0.5">
                                                    <Check className="w-3 h-3" /> Cocok
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 font-semibold ml-1">(Pastikan NIK sesuai)</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Nama */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                                            Nama Lengkap
                                        </label>
                                        <input
                                            type="text"
                                            value={parsedFields.nama || ''}
                                            onChange={(e) => handleParsedFieldChange('nama', e.target.value)}
                                            placeholder="Nama lengkap di berkas"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                                        />
                                    </div>

                                    {/* Tempat / Tgl Lahir */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                                            Tempat / Tgl Lahir
                                        </label>
                                        <input
                                            type="text"
                                            value={parsedFields.tempat_tanggal_lahir || ''}
                                            onChange={(e) => handleParsedFieldChange('tempat_tanggal_lahir', e.target.value)}
                                            placeholder="Contoh: Lampung, 15-05-2010"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    {/* Jenis Kelamin */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                                            Jenis Kelamin
                                        </label>
                                        <input
                                            type="text"
                                            value={parsedFields.jenis_kelamin || ''}
                                            onChange={(e) => handleParsedFieldChange('jenis_kelamin', e.target.value)}
                                            placeholder="Laki-laki / Perempuan"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    {/* Alamat */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                                            Alamat Tempat Tinggal
                                        </label>
                                        <input
                                            type="text"
                                            value={parsedFields.alamat || ''}
                                            onChange={(e) => handleParsedFieldChange('alamat', e.target.value)}
                                            placeholder="Jalan/Dusun"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    {/* RT / RW */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                                            RT / RW
                                        </label>
                                        <input
                                            type="text"
                                            value={parsedFields.rt_rw || ''}
                                            onChange={(e) => handleParsedFieldChange('rt_rw', e.target.value)}
                                            placeholder="001/002"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    {/* Kelurahan / Desa */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                                            Kelurahan / Desa
                                        </label>
                                        <input
                                            type="text"
                                            value={parsedFields.kel_desa || ''}
                                            onChange={(e) => handleParsedFieldChange('kel_desa', e.target.value)}
                                            placeholder="Nama Desa"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    {/* Kecamatan */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                                            Kecamatan
                                        </label>
                                        <input
                                            type="text"
                                            value={parsedFields.kecamatan || ''}
                                            onChange={(e) => handleParsedFieldChange('kecamatan', e.target.value)}
                                            placeholder="Nama Kecamatan"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    {/* Agama */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                                            Agama
                                        </label>
                                        <input
                                            type="text"
                                            value={parsedFields.agama || ''}
                                            onChange={(e) => handleParsedFieldChange('agama', e.target.value)}
                                            placeholder="Islam / Kristen / dll"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    {/* Pekerjaan */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                                            Pekerjaan / Status
                                        </label>
                                        <input
                                            type="text"
                                            value={parsedFields.pekerjaan || ''}
                                            onChange={(e) => handleParsedFieldChange('pekerjaan', e.target.value)}
                                            placeholder="Pelajar / Mahasiswa"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    {/* No KK */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                                            No. Kartu Keluarga (KK)
                                        </label>
                                        <input
                                            type="text"
                                            value={parsedFields.no_kk || ''}
                                            onChange={(e) => handleParsedFieldChange('no_kk', e.target.value)}
                                            placeholder="16 Digit No KK"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* Raw OCR Text in Collapsible Details */}
                                <details className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                                    <summary className="font-semibold cursor-pointer text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition">
                                        Lihat Transkripsi Teks Mentah Hasil Scan AI
                                    </summary>
                                    <textarea
                                        rows={3}
                                        value={extractedText}
                                        onChange={(e) => setExtractedText(e.target.value)}
                                        className="mt-2 w-full p-2.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                                    />
                                </details>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleSubmitDokumen}
                                        disabled={submitting}
                                        className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                                <span>Menyimpan Dokumen & Data Ekstraksi...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                                                <span>Konfirmasi & Simpan Berkas</span>
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
            <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Daftar Dokumen yang Telah Diunggah</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Berkas yang diunggah akan diverifikasi secara teliti oleh panitia SPMB</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition cursor-pointer"
                        title="Segarkan data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                <th className="pb-3">Jenis Dokumen</th>
                                <th className="pb-3">Waktu Unggah</th>
                                <th className="pb-3">Hasil AI OCR</th>
                                <th className="pb-3">Status Verifikasi</th>
                                <th className="pb-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {dokumenList.length > 0 ? (
                                dokumenList.map((doc) => {
                                    const fullDocUrl = doc.fileUrl.startsWith('http')
                                        ? doc.fileUrl
                                        : `${API_BASE_URL}${doc.fileUrl.startsWith('/') ? '' : '/'}${doc.fileUrl}`;

                                    return (
                                        <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                                            <td className="py-3.5 font-bold text-slate-900 dark:text-white">
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
                                            <td className="py-3.5 text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(doc.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="py-3.5 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                {doc.hasiltEkstraksi ? doc.hasiltEkstraksi.slice(0, 40) + '...' : '-'}
                                            </td>
                                            <td className="py-3.5">
                                                {doc.status === 'VALID' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>Terverifikasi (Valid)</span>
                                                    </span>
                                                ) : doc.status === 'INVALID' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                                        <span>Perlu Perbaikan</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                        <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                                                        <span>Menunggu Verifikasi</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 text-right">
                                                <button
                                                    onClick={() => setModalImage(fullDocUrl)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition cursor-pointer"
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
                                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
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
                        className="bg-white dark:bg-slate-950 rounded-2xl max-w-2xl w-full p-4 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pratinjau Berkas Dokumen</h3>
                            <button
                                onClick={() => setModalImage(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-xl p-2">
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
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
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
