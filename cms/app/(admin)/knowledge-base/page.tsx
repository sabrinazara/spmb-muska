'use client';

import { useState, useEffect } from 'react';
import {
    BookOpen,
    UploadCloud,
    Trash2,
    FileText,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ExternalLink,
    RefreshCw,
    X,
    Sparkles,
} from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL, getAuthHeaders, getAuthToken } from '@/lib/api';
import { cmsToast, useToast } from '@/components/ToastProvider';

interface KBItem {
    id: string;
    judul: string;
    kategori: string | null;
    deskripsi: string | null;
    fileUrl: string;
    embedded: boolean;
    createdAt: string;
}

export default function KnowledgeBaseManagementPage() {
    const { confirmAction } = useToast();
    const [items, setItems] = useState<KBItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form states
    const [judul, setJudul] = useState('');
    const [kategori, setKategori] = useState('Brosur');
    const [deskripsi, setDeskripsi] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchKB = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.KNOWLEDGE_BASE, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Gagal memuat dokumen knowledge base');
            const data = await res.json();
            setItems(data);
        } catch (err: any) {
            console.error('Error fetching knowledge base:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKB();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            if (!judul) {
                setJudul(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setAlert({ type: 'error', text: 'Pilih file PDF dokumen terlebih dahulu' });
            return;
        }

        setUploading(true);
        setAlert(null);

        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('judul', judul.trim());
            formData.append('kategori', kategori);
            if (deskripsi) formData.append('deskripsi', deskripsi.trim());

            const res = await fetch(API_ENDPOINTS.ADMIN.KNOWLEDGE_BASE, {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal mengunggah dokumen');

            setAlert({ type: 'success', text: 'Dokumen berhasil diunggah dan disinkronkan ke Vector Store AI RAG' });
            cmsToast.update(`Dokumen "${judul.trim()}" berhasil diunggah dan diindeks ke AI Vector Store.`, 'Pembaruan Dokumen AI');
            setJudul('');
            setDeskripsi('');
            setSelectedFile(null);
            fetchKB();
        } catch (err: any) {
            setAlert({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
            cmsToast.error(err.message || 'Gagal mengunggah dokumen.', 'Gagal Unggah');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, judulDoc: string) => {
        confirmAction({
            title: 'Hapus Dokumen Knowledge Base',
            message: `Apakah Anda yakin ingin menghapus dokumen "${judulDoc}"? Dokumen ini akan dihilangkan dari basis data AI RAG.`,
            type: 'danger',
            confirmLabel: 'Ya, Hapus Dokumen',
            cancelLabel: 'Batal',
            onConfirm: async () => {
                try {
                    const res = await fetch(`${API_ENDPOINTS.ADMIN.KNOWLEDGE_BASE}/${id}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders(),
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setAlert({ type: 'success', text: 'Dokumen berhasil dihapus' });
                        cmsToast.delete(`Dokumen "${judulDoc}" berhasil dihapus dari sistem.`, 'Penghapusan Data Berhasil');
                        fetchKB();
                    } else {
                        setAlert({ type: 'error', text: data.message || 'Gagal menghapus dokumen' });
                        cmsToast.error(data.message || 'Gagal menghapus dokumen.', 'Gagal Menghapus');
                    }
                } catch {
                    setAlert({ type: 'error', text: 'Gagal menghubungi server' });
                    cmsToast.error('Gagal menghubungi server.', 'Kesalahan Server');
                }
            },
        });
    };

    const getFullUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const clean = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${clean}`;
    };

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-500" />
                        <span>Manajemen AI Knowledge Base (RAG)</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Unggah brosur, kurikulum, dan tata tertib untuk melatih model Chatbot RAG SPMB
                    </p>
                </div>

                <button
                    onClick={fetchKB}
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition cursor-pointer self-start sm:self-auto"
                    title="Segarkan data"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Notification alert */}
            {alert && (
                <div
                    className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-2xs animate-in fade-in duration-200 ${
                        alert.type === 'success'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {alert.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span>{alert.text}</span>
                    </div>
                    <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Form Upload PDF */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-emerald-500" />
                        <span>Unggah Dokumen PDF untuk Pelatihan Chatbot RAG</span>
                    </h3>
                </div>

                <form onSubmit={handleUpload} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Judul Dokumen *
                            </label>
                            <input
                                type="text"
                                required
                                value={judul}
                                onChange={(e) => setJudul(e.target.value)}
                                placeholder="Contoh: Brosur Jurusan TKJ TA 2026"
                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Kategori Dokumen *
                            </label>
                            <select
                                value={kategori}
                                onChange={(e) => setKategori(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs cursor-pointer"
                            >
                                <option value="Brosur">Brosur & Profil Sekolah</option>
                                <option value="Jurusan">Program Keahlian (8 Jurusan)</option>
                                <option value="Biaya">Rincian Biaya & Seragam</option>
                                <option value="Jadwal">Jadwal Seleksi & Ujian CBT</option>
                                <option value="Syarat">Persyaratan Berkas (KK/SKL)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Pilih Berkas PDF *
                        </label>
                        <input
                            type="file"
                            accept="application/pdf"
                            required
                            onChange={handleFileChange}
                            className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950 dark:file:text-emerald-300 hover:file:bg-emerald-100 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Deskripsi Singkat (Opsional)
                        </label>
                        <input
                            type="text"
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            placeholder="Catatan ringkas mengenai isi dokumen..."
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Mengunggah & Mengekstraksi Vector...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 text-amber-300" />
                                    <span>Unggah & Sinkronkan Dokumen</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* List of Active Knowledge Base Documents */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Dokumen Knowledge Base Aktif ({items.length})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Dokumen yang menjadi basis rujukan AI RAG saat menjawab pertanyaan calon siswa
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                            <tr>
                                <th className="p-3.5">Judul Dokumen</th>
                                <th className="p-3.5">Kategori</th>
                                <th className="p-3.5">Status AI Vector</th>
                                <th className="p-3.5">Waktu Sinkronisasi</th>
                                <th className="p-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                                        Memuat daftar dokumen...
                                    </td>
                                </tr>
                            ) : items.length > 0 ? (
                                items.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                                        <td className="p-3.5">
                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                                                <span>{doc.judul}</span>
                                            </div>
                                            {doc.deskripsi && (
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-md">
                                                    {doc.deskripsi}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-3.5">
                                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                                                {doc.kategori || 'UMUM'}
                                            </span>
                                        </td>
                                        <td className="p-3.5">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                <span>Tersinkronisasi</span>
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                            {new Date(doc.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="p-3.5 text-right space-x-2">
                                            <a
                                                href={getFullUrl(doc.fileUrl)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition"
                                                title="Lihat PDF"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                <span>PDF</span>
                                            </a>

                                            <button
                                                onClick={() => handleDelete(doc.id, doc.judul)}
                                                className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg transition cursor-pointer"
                                                title="Hapus Dokumen"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-xs text-slate-400">
                                        Belum ada dokumen knowledge base yang diunggah.
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
