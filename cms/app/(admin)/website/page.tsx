'use client';

import { useState, useEffect } from 'react';
import {
    Globe,
    Sliders,
    UserCheck,
    Users,
    Newspaper,
    Briefcase,
    Plus,
    Edit2,
    Trash2,
    Save,
    RotateCcw,
    Check,
    X,
    Loader2,
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    Image as ImageIcon,
    Building2,
    BookOpen,
    GraduationCap,
    Calendar,
    Trophy,
    Award,
} from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS, USER_URL, getAuthHeaders } from '@/lib/api';
import ImageUploader from '@/components/ImageUploader';
import MultiImageUploader from '@/components/MultiImageUploader';
import { cmsToast, useToast } from '@/components/ToastProvider';

type TabKey = 'slider' | 'profil' | 'wks' | 'guru' | 'berita' | 'agenda' | 'prestasi' | 'galeri' | 'mitra';

export default function WebsiteManagerPage() {
    const { confirmAction } = useToast();
    const [activeTab, setActiveTab] = useState<TabKey>('slider');
    const [loading, setLoading] = useState(true);
    const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Helper untuk memformat URL gambar agar selalu terbaca baik dari API backend maupun lokal
    const getFullUrl = (url: string | null | undefined) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
        const clean = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${clean}`;
    };

    // Data States
    const [sliders, setSliders] = useState<any[]>([]);
    const [profil, setProfil] = useState<any>({});
    const [wksList, setWksList] = useState<any[]>([]);
    const [guruList, setGuruList] = useState<any[]>([]);
    const [beritaList, setBeritaList] = useState<any[]>([]);
    const [agendaList, setAgendaList] = useState<any[]>([]);
    const [prestasiList, setPrestasiList] = useState<any[]>([]);
    const [galeriList, setGaleriList] = useState<any[]>([]);
    const [mitraList, setMitraList] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);

    // Modals
    const [modalType, setModalType] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    // Fetch All Data
    const loadAllData = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_ENDPOINTS.WEBSITE.PUBLIC_DATA);
            if (res.ok) {
                const data = await res.json();
                setSliders(data.sliders || []);
                setProfil(data.profil || {});
                setWksList(data.wks || []);
                setGuruList(data.guru || []);
                setBeritaList(data.berita || []);
                setAgendaList(data.agenda || []);
                setPrestasiList(data.prestasi || []);
                setGaleriList(data.galeri || []);
                setMitraList(data.mitraIndustri || []);
                setPrograms(data.programKeahlian || []);
            }
        } catch (e) {
            setAlertMsg({ type: 'error', text: 'Gagal memuat data dari server' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // Save Profil Sekolahan
    const handleSaveProfil = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setAlertMsg(null);
        try {
            const res = await fetch(API_ENDPOINTS.WEBSITE.PROFIL, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(profil),
            });
            if (res.ok) {
                setAlertMsg({ type: 'success', text: 'Profil sekolah dan sambutan kepala sekolah berhasil diperbarui!' });
                cmsToast.update('Profil sekolah dan sambutan kepala sekolah berhasil disimpan ke landing page.', 'Pembaruan Profil Sekolah');
            } else {
                setAlertMsg({ type: 'error', text: 'Gagal memperbarui profil sekolah' });
                cmsToast.error('Gagal memperbarui profil sekolah.', 'Gagal Menyimpan');
            }
        } catch {
            setAlertMsg({ type: 'error', text: 'Terjadi kesalahan jaringan' });
            cmsToast.error('Terjadi kesalahan jaringan saat menyimpan profil.', 'Kesalahan Jaringan');
        } finally {
            setSaving(false);
        }
    };

    // Generic Delete with Animated Confirm and Toast
    const handleDeleteItem = async (url: string, successMsg: string) => {
        confirmAction({
            title: 'Hapus Konten Website',
            message: 'Apakah Anda yakin ingin menghapus data konten ini? Tindakan ini tidak dapat dibatalkan.',
            type: 'danger',
            confirmLabel: 'Ya, Hapus Data',
            cancelLabel: 'Batal',
            onConfirm: async () => {
                try {
                    const res = await fetch(url, {
                        method: 'DELETE',
                        headers: getAuthHeaders(),
                    });
                    if (res.ok) {
                        setAlertMsg({ type: 'success', text: successMsg });
                        cmsToast.delete(successMsg || 'Data konten berhasil dihapus dari landing page.', 'Penghapusan Data Berhasil');
                        loadAllData();
                    } else {
                        setAlertMsg({ type: 'error', text: 'Gagal menghapus data' });
                        cmsToast.error('Gagal menghapus data dari server.', 'Gagal Menghapus');
                    }
                } catch {
                    setAlertMsg({ type: 'error', text: 'Terjadi kesalahan jaringan' });
                    cmsToast.error('Terjadi kesalahan jaringan.', 'Kesalahan Jaringan');
                }
            },
        });
    };

    // Generic Submit for Slider, WKS, Berita, Mitra, Program
    const handleSaveModal = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setAlertMsg(null);

        let url = '';
        let method = formData.id ? 'PUT' : 'POST';

        if (modalType === 'slider') {
            url = formData.id ? API_ENDPOINTS.WEBSITE.SLIDER_BY_ID(formData.id) : API_ENDPOINTS.WEBSITE.SLIDERS;
        } else if (modalType === 'wks') {
            url = formData.id ? API_ENDPOINTS.WEBSITE.WKS_BY_ID(formData.id) : API_ENDPOINTS.WEBSITE.WKS;
        } else if (modalType === 'guru') {
            url = formData.id ? API_ENDPOINTS.WEBSITE.GURU_BY_ID(formData.id) : API_ENDPOINTS.WEBSITE.GURU;
        } else if (modalType === 'berita') {
            url = formData.id ? API_ENDPOINTS.WEBSITE.BERITA_BY_ID(formData.id) : API_ENDPOINTS.WEBSITE.BERITA;
        } else if (modalType === 'agenda') {
            url = formData.id ? API_ENDPOINTS.WEBSITE.AGENDA_BY_ID(formData.id) : API_ENDPOINTS.WEBSITE.AGENDA;
        } else if (modalType === 'prestasi') {
            url = formData.id ? API_ENDPOINTS.WEBSITE.PRESTASI_BY_ID(formData.id) : API_ENDPOINTS.WEBSITE.PRESTASI;
        } else if (modalType === 'galeri') {
            url = formData.id ? API_ENDPOINTS.WEBSITE.GALERI_BY_ID(formData.id) : API_ENDPOINTS.WEBSITE.GALERI;
        } else if (modalType === 'mitra') {
            url = formData.id ? API_ENDPOINTS.WEBSITE.MITRA_BY_ID(formData.id) : API_ENDPOINTS.WEBSITE.MITRA;
        } else if (modalType === 'program') {
            url = formData.id ? API_ENDPOINTS.WEBSITE.PROGRAM_BY_ID(formData.id) : API_ENDPOINTS.WEBSITE.PROGRAMS;
        }

        try {
            const res = await fetch(url, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                const isEdit = !!formData.id;
                setAlertMsg({ type: 'success', text: 'Data berhasil disimpan!' });
                if (isEdit) {
                    cmsToast.change('Data konten website berhasil diperbarui.', 'Perubahan Data Disimpan');
                } else {
                    cmsToast.update('Data konten baru berhasil ditambahkan ke landing page.', 'Pembaruan Data Berhasil');
                }
                setModalType(null);
                loadAllData();
            } else {
                const err = await res.json();
                setAlertMsg({ type: 'error', text: err.message || 'Gagal menyimpan data' });
                cmsToast.error(err.message || 'Gagal menyimpan data.', 'Gagal Menyimpan');
            }
        } catch {
            setAlertMsg({ type: 'error', text: 'Terjadi kesalahan jaringan' });
            cmsToast.error('Terjadi kesalahan jaringan.', 'Kesalahan Jaringan');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'slider', label: '1. Slider Hero Banner', icon: Sliders },
        { id: 'profil', label: '2. Profil & Identitas Sekolah', icon: UserCheck },
        { id: 'wks', label: '3. Wakil Kepala Sekolah', icon: Users },
        { id: 'guru', label: '4. Dewan Guru & Pendidik', icon: GraduationCap },
        { id: 'berita', label: '5. Berita & Pengumuman', icon: Newspaper },
        { id: 'agenda', label: '6. Agenda Sekolah', icon: Calendar },
        { id: 'prestasi', label: '7. Prestasi Siswa', icon: Trophy },
        { id: 'galeri', label: '8. Galeri Sekolah', icon: ImageIcon },
        { id: 'mitra', label: '9. Mitra DUDI & Jurusan', icon: Briefcase },
    ];

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-200">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Content Management System (CMS)</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                            Manajemen Landing Page & Website Publik
                        </h1>
                        <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
                            Kelola konten halaman depan sekolah: banner slider, sambutan kepala sekolah, profil WKS, kompetensi keahlian, mitra industri DUDI, dan berita terkini.
                        </p>
                    </div>

                    <a
                        href="http://localhost:3000"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>Pratinjau Landing Page</span>
                    </a>
                </div>
            </div>

            {/* ALERT */}
            {alertMsg && (
                <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-2xs ${
                        alertMsg.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        {alertMsg.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{alertMsg.text}</span>
                    </div>
                    <button onClick={() => setAlertMsg(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* TABS NAVIGATION */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabKey)}
                            className={`px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                                isActive
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* TAB CONTENTS */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-400 mt-3 font-semibold">Memuat Konten Website...</span>
                </div>
            ) : (
                <div>
                    {/* 1. SLIDER & HERO BANNER */}
                    {activeTab === 'slider' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Daftar Banner Slider Utama
                                    </h2>
                                    <p className="text-xs text-slate-500">Banner otomatis bergulir di bagian teratas website publik</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setFormData({ title: '', subtitle: '', imageUrl: '/banner-spmb.jpg', linkUrl: '/register', isActive: true, urutan: sliders.length + 1 });
                                        setModalType('slider');
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Banner Slider</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sliders.map((s) => (
                                    <div key={s.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                                        <div className="relative h-40 bg-slate-100 dark:bg-slate-900">
                                            <img src={getFullUrl(s.imageUrl)} alt={s.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
                                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                                                Urutan #{s.urutan}
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-2 flex-1">
                                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">{s.title}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{s.subtitle || '-'}</p>
                                            <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">Link: {s.linkUrl || '/'}</div>
                                        </div>
                                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/30">
                                            <button
                                                onClick={() => { setFormData(s); setModalType('slider'); }}
                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(API_ENDPOINTS.WEBSITE.SLIDER_BY_ID(s.id), 'Slider berhasil dihapus')}
                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. PROFIL & SAMBUTAN KEPALA SEKOLAH */}
                    {activeTab === 'profil' && (
                        <form onSubmit={handleSaveProfil} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                    Pengaturan Profil & Sambutan Kepala Sekolah
                                </h2>
                                <p className="text-xs text-slate-500">Perbarui identitas pimpinan, semboyan, sambutan resmi, dan kontak publik</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                                <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                        Identitas Brand & Logo Sekolah (Navbar & Footer)
                                    </h3>
                                    <ImageUploader
                                        label="Logo Resmi Sekolah / Yayasan"
                                        value={profil.logoUrl || '/logo.png'}
                                        onChange={(url) => setProfil({ ...profil, logoUrl: url })}
                                        aspectRatio="square"
                                        helperText="Disarankan file gambar logo format PNG transparan atau SVG resolusi tajam (tampil otomatis di header navbar dan footer)."
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Kepala Sekolah *</label>
                                    <input
                                        type="text"
                                        required
                                        value={profil.namaKepsek || ''}
                                        onChange={(e) => setProfil({ ...profil, namaKepsek: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-emerald-600"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <ImageUploader
                                        label="Foto Resmi Kepala Sekolah"
                                        value={profil.fotoKepsek || ''}
                                        onChange={(url) => setProfil({ ...profil, fotoKepsek: url })}
                                        aspectRatio="portrait"
                                        required
                                        helperText="Disarankan foto resmi pimpinan dengan pakaian formal rasio 3:4 atau 4:5"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block font-bold text-slate-700 dark:text-slate-300">
                                            Semboyan / Motto Sekolah *
                                        </label>
                                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                            Font: Dancing Script
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={profil.motto || ''}
                                        onChange={(e) => setProfil({ ...profil, motto: e.target.value })}
                                        placeholder="Contoh: Sukses · Jaya · Bermanfaat · Inspiratif"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-emerald-600"
                                    />
                                    {/* Pratinjau Font Dancing Script */}
                                    <div className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                                            Pratinjau Live:
                                        </span>
                                        <span className="font-dancing text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-300 tracking-wide truncate">
                                            &ldquo;{profil.motto || 'Sukses · Jaya · Bermanfaat · Inspiratif'}&rdquo;
                                        </span>
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Teks Sambutan Kepala Sekolah *</label>
                                    <textarea
                                        rows={6}
                                        required
                                        value={profil.sambutanKepsek || ''}
                                        onChange={(e) => setProfil({ ...profil, sambutanKepsek: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs leading-relaxed focus:outline-none focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap Sekolah</label>
                                    <input
                                        type="text"
                                        value={profil.alamatLengkap || ''}
                                        onChange={(e) => setProfil({ ...profil, alamatLengkap: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Resmi Sekolah</label>
                                    <input
                                        type="email"
                                        value={profil.emailResmi || ''}
                                        onChange={(e) => setProfil({ ...profil, emailResmi: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp Resmi</label>
                                    <input
                                        type="text"
                                        value={profil.whatsappResmi || ''}
                                        onChange={(e) => setProfil({ ...profil, whatsappResmi: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">URL Embed Google Maps</label>
                                    <input
                                        type="text"
                                        value={profil.mapsEmbedUrl || ''}
                                        onChange={(e) => setProfil({ ...profil, mapsEmbedUrl: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Simpan Perubahan Profil</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* 3. WAKIL KEPALA SEKOLAH (WKS) */}
                    {activeTab === 'wks' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Struktur Wakil Kepala Sekolah (WKS)
                                    </h2>
                                    <p className="text-xs text-slate-500">Ditampilkan dalam grid 4 kolom di halaman publik sekolah</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setFormData({ nama: '', jabatan: '', fotoUrl: '/avatar.png', urutan: wksList.length + 1 });
                                        setModalType('wks');
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah WKS</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {wksList.map((w) => (
                                    <div key={w.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-center space-y-3">
                                        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 overflow-hidden">
                                            <img src={getFullUrl(w.fotoUrl)} alt={w.nama} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{w.nama}</h3>
                                            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{w.jabatan}</div>
                                        </div>
                                        <div className="flex justify-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <button
                                                onClick={() => { setFormData(w); setModalType('wks'); }}
                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(API_ENDPOINTS.WEBSITE.WKS_BY_ID(w.id), 'Data WKS berhasil dihapus')}
                                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. DEWAN GURU & TENAGA PENDIDIK */}
                    {activeTab === 'guru' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Manajemen Dewan Guru & Tenaga Pendidik
                                    </h2>
                                    <p className="text-xs text-slate-500">Daftar dewan guru produktif & adaptif yang ditampilkan pada landing page</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setFormData({ nama: '', nip: '', mataPelajaran: '', pendidikan: '', fotoUrl: '', urutan: guruList.length + 1, isActive: true });
                                        setModalType('guru');
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Guru Baru</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {guruList.map((g) => (
                                    <div key={g.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 border-emerald-500/40 shrink-0">
                                                <img src={getFullUrl(g.fotoUrl || '/avatar.png')} alt={g.nama} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">{g.nama}</h3>
                                                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 line-clamp-1">{g.mataPelajaran}</div>
                                                <div className="text-[10px] text-slate-400">{g.pendidikan || '-'}</div>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                            <span className="text-[10px] font-mono text-slate-400">NIP: {g.nip || 'Non-NIP'}</span>
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => { setFormData(g); setModalType('guru'); }}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                    title="Edit Guru"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(API_ENDPOINTS.WEBSITE.GURU_BY_ID(g.id), 'Data Guru berhasil dihapus')}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                    title="Hapus Guru"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. BERITA & PENGUMUMAN */}
                    {activeTab === 'berita' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Manajemen Berita & Kegiatan Sekolah
                                    </h2>
                                    <p className="text-xs text-slate-500">Artikel publikasi seputar prestasi, jurusan, dan informasi pendaftaran</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setFormData({ judul: '', kategori: 'Umum', ringkasan: '', konten: '', thumbnail: '', penulis: 'Humas SMK MUSKA' });
                                        setModalType('berita');
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tulis Berita Baru</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {beritaList.map((b) => (
                                    <div key={b.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                                        <div className="relative h-44 bg-slate-100 dark:bg-slate-900">
                                            <img src={getFullUrl(b.thumbnail)} alt={b.judul} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/banner-spmb.jpg'; }} />
                                            <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                                                {b.kategori}
                                            </span>
                                        </div>
                                        <div className="p-4 space-y-2 flex-1">
                                            <div className="text-[10px] text-slate-400">{new Date(b.tanggalPublish).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">{b.judul}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">{b.ringkasan || b.konten}</p>
                                        </div>
                                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                                            <span className="text-[10px] font-medium text-slate-400">{b.penulis}</span>
                                            <div className="flex gap-1.5">
                                                <a
                                                    href={`${USER_URL}/berita/${b.slug || b.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                    title="Preview Berita di Web"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                                <button
                                                    onClick={() => { setFormData(b); setModalType('berita'); }}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                    title="Edit Berita"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(API_ENDPOINTS.WEBSITE.BERITA_BY_ID(b.id), 'Berita berhasil dihapus')}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                    title="Hapus Berita"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 6. AGENDA SEKOLAH */}
                    {activeTab === 'agenda' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Agenda & Jadwal Kegiatan Sekolah
                                    </h2>
                                    <p className="text-xs text-slate-500">Kelola jadwal sosialisasi, ujian, acara kesiswaan, dan agenda resmi SMK MUSKA</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setFormData({
                                            judul: '',
                                            tanggal: new Date().toISOString().slice(0, 10),
                                            waktu: '08:00 - 12:00 WIB',
                                            lokasi: 'Aula Utama SMK Muhammadiyah Sekampung',
                                            kategori: 'Umum',
                                            deskripsi: '',
                                            isActive: true,
                                            urutan: agendaList.length + 1,
                                        });
                                        setModalType('agenda');
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Agenda</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {agendaList.map((a) => (
                                    <div key={a.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                                    {a.kategori || 'Umum'}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.isActive ? 'bg-teal-500/10 text-teal-600' : 'bg-slate-500/10 text-slate-400'}`}>
                                                    {a.isActive ? 'Tayang' : 'Nonaktif'}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">{a.judul}</h3>
                                            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>
                                                        {new Date(a.tanggal).toLocaleDateString('id-ID', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                                {a.waktu && <div className="text-[11px] text-slate-400">⏰ {a.waktu}</div>}
                                                {a.lokasi && <div className="text-[11px] text-slate-400">📍 {a.lokasi}</div>}
                                            </div>
                                            {a.deskripsi && (
                                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{a.deskripsi}</p>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
                                            <span>Urutan: {a.urutan}</span>
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setFormData({
                                                            ...a,
                                                            tanggal: a.tanggal ? new Date(a.tanggal).toISOString().slice(0, 10) : '',
                                                        });
                                                        setModalType('agenda');
                                                    }}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                    title="Edit Agenda"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(API_ENDPOINTS.WEBSITE.AGENDA_BY_ID(a.id), 'Agenda berhasil dihapus')}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                    title="Hapus Agenda"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 7. PRESTASI SISWA */}
                    {activeTab === 'prestasi' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Prestasi Siswa & Siswi Sekolah
                                    </h2>
                                    <p className="text-xs text-slate-500">Capaian siswa SMK Muhammadiyah Sekampung di tingkat daerah hingga nasional</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setFormData({
                                            judul: '',
                                            kategoriJuara: 'JUARA',
                                            namaPeserta: '',
                                            namaLomba: '',
                                            tingkat: 'Kabupaten',
                                            fotoUrl: '',
                                            deskripsi: '',
                                            tanggal: new Date().toISOString().slice(0, 10),
                                            urutan: prestasiList.length + 1,
                                        });
                                        setModalType('prestasi');
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Prestasi</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {prestasiList.map((pr) => (
                                    <div key={pr.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group">
                                        <div className="relative h-44 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                            <img
                                                src={getFullUrl(pr.fotoUrl)}
                                                alt={pr.judul}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => { e.currentTarget.src = '/banner-spmb.jpg'; }}
                                            />
                                            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white shadow-md flex items-center gap-1">
                                                <Trophy className="w-3 h-3" />
                                                <span>{pr.kategoriJuara || 'JUARA'}</span>
                                            </span>
                                            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs">
                                                {pr.tingkat || 'Daerah'}
                                            </span>
                                        </div>

                                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                                            <div className="space-y-1.5">
                                                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                                                    {pr.judul}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    {pr.namaPeserta}
                                                </p>
                                                {pr.namaLomba && (
                                                    <p className="text-[11px] text-slate-400 line-clamp-1">
                                                        {pr.namaLomba}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                                                <span>
                                                    {new Date(pr.tanggal).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            setFormData({
                                                                ...pr,
                                                                tanggal: pr.tanggal ? new Date(pr.tanggal).toISOString().slice(0, 10) : '',
                                                            });
                                                            setModalType('prestasi');
                                                        }}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                        title="Edit Prestasi"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(API_ENDPOINTS.WEBSITE.PRESTASI_BY_ID(pr.id), 'Prestasi berhasil dihapus')}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                        title="Hapus Prestasi"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 8. GALERI SEKOLAH */}
                    {activeTab === 'galeri' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Galeri Foto & Album Dokumentasi Sekolah
                                    </h2>
                                    <p className="text-xs text-slate-500">Kelola album foto kegiatan, fasilitas kampus, dan ragam dokumentasi interaktif</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setFormData({
                                            judul: '',
                                            slug: '',
                                            kategori: 'Kegiatan',
                                            deskripsi: '',
                                            thumbnail: '',
                                            fotoUrls: [],
                                            tanggal: new Date().toISOString().slice(0, 10),
                                            urutan: galeriList.length + 1,
                                        });
                                        setModalType('galeri');
                                    }}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Album Galeri</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {galeriList.map((g) => (
                                    <div key={g.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group">
                                        <div className="relative h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                            <img
                                                src={getFullUrl(g.thumbnail)}
                                                alt={g.judul}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => { e.currentTarget.src = '/banner-spmb.jpg'; }}
                                            />
                                            <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white shadow-xs">
                                                {g.kategori || 'Kegiatan'}
                                            </span>
                                            <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1">
                                                <ImageIcon className="w-3 h-3" />
                                                <span>{(g.fotoUrls?.length || 0) + 1} Foto</span>
                                            </span>
                                        </div>

                                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                                                    {g.judul}
                                                </h3>
                                                {g.deskripsi && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                        {g.deskripsi}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                                                <span>
                                                    {new Date(g.tanggal).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                                <div className="flex gap-1.5">
                                                    <a
                                                        href={`${USER_URL}/galeri/${g.slug || g.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                        title="Pratinjau Halaman Galeri"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                    <button
                                                        onClick={() => {
                                                            setFormData({
                                                                ...g,
                                                                fotoUrls: Array.isArray(g.fotoUrls) ? g.fotoUrls : [],
                                                                tanggal: g.tanggal ? new Date(g.tanggal).toISOString().slice(0, 10) : '',
                                                            });
                                                            setModalType('galeri');
                                                        }}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                        title="Edit Galeri"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(API_ENDPOINTS.WEBSITE.GALERI_BY_ID(g.id), 'Album galeri berhasil dihapus')}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                        title="Hapus Galeri"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 9. MITRA DUDI & JURUSAN */}
                    {activeTab === 'mitra' && (
                        <div className="space-y-8">
                            {/* MITRA DUDI */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                            Mitra Dunia Usaha & Dunia Industri (DUDI)
                                        </h2>
                                        <p className="text-xs text-slate-500">Logo perusahaan mitra yang ditampilkan di carousel horizontal</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setFormData({ namaPerusahaan: '', logoUrl: '', bidangKerjasama: '', urutan: mitraList.length + 1 });
                                            setModalType('mitra');
                                        }}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Tambah Mitra DUDI</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                    {mitraList.map((m) => (
                                        <div key={m.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between text-center space-y-2">
                                            <div className="h-16 flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                                <img src={getFullUrl(m.logoUrl)} alt={m.namaPerusahaan} className="max-h-full max-w-full object-contain" onError={(e) => { e.currentTarget.src = '/logo.png'; }} />
                                            </div>
                                            <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{m.namaPerusahaan}</div>
                                            <div className="text-[10px] text-slate-400 line-clamp-1">{m.bidangKerjasama || '-'}</div>
                                            <div className="flex justify-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                                                <button
                                                    onClick={() => { setFormData(m); setModalType('mitra'); }}
                                                    className="p-1 rounded text-slate-400 hover:text-emerald-600 transition"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(API_ENDPOINTS.WEBSITE.MITRA_BY_ID(m.id), 'Mitra berhasil dihapus')}
                                                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PROGRAM KEAHLIAN / JURUSAN */}
                            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                            Kompetensi Keahlian (Program Jurusan)
                                        </h2>
                                        <p className="text-xs text-slate-500">8 program keahlian yang ditampilkan dalam kartu interaktif di landing page</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setFormData({ nama: '', singkatan: '', deskripsi: '', kuota: 72, iconUrl: '', fotoUrls: [], urutan: programs.length + 1 });
                                            setModalType('program');
                                        }}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Tambah Program</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {programs.map((p) => (
                                        <div key={p.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                        {p.singkatan}
                                                    </span>
                                                    {p.iconUrl && (
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center">
                                                            <img src={getFullUrl(p.iconUrl)} alt={p.singkatan} className="w-full h-full object-contain" />
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-1 leading-snug">{p.nama}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">{p.deskripsi}</p>
                                            </div>
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] font-mono text-slate-400">
                                                <span>Kuota: {p.kuota}</span>
                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                                    {p.fotoUrls?.length || 0}/5 Foto
                                                </span>
                                                <div className="flex gap-1.5">
                                                    <a
                                                        href={`${USER_URL}/jurusan/${p.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                        title="Preview Halaman Jurusan di Web"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                    <button
                                                        onClick={() => { setFormData({ ...p, fotoUrls: Array.isArray(p.fotoUrls) ? p.fotoUrls : [] }); setModalType('program'); }}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                        title="Edit Program"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(API_ENDPOINTS.WEBSITE.PROGRAM_BY_ID(p.id), 'Program berhasil dihapus')}
                                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:text-rose-600 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                                                        title="Hapus Program"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* GENERIC MODAL POPUP */}
            {modalType && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                {formData.id ? 'Edit Data' : 'Tambah Data Baru'} ({modalType})
                            </h3>
                            <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
                            {/* SLIDER FIELDS */}
                            {modalType === 'slider' && (
                                <>
                                    <div>
                                        <label className="block font-bold mb-1">Teks Badge Atas (cth: SPMB TA 2026/2027)</label>
                                        <input type="text" value={formData.badgeText || ''} onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Judul Utama Banner *</label>
                                        <input type="text" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Subjudul / Deskripsi Pendek</label>
                                        <input type="text" value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                    <ImageUploader
                                        label="Gambar Banner Utama"
                                        value={formData.imageUrl || ''}
                                        onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                        aspectRatio="banner"
                                        required
                                        helperText="Unggah gambar landscape resolusi tinggi (cth: 1920x1080 atau 1280x720)"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold mb-1">Teks Tombol CTA</label>
                                            <input type="text" placeholder="Daftar Sekarang" value={formData.ctaText || ''} onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-1">Tautan Tujuan CTA</label>
                                            <input type="text" placeholder="/register" value={formData.linkUrl || ''} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold mb-1">Nomor Urutan</label>
                                            <input type="number" min={1} value={formData.urutan || 1} onChange={(e) => setFormData({ ...formData, urutan: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                        </div>
                                        <div className="flex items-center gap-2 pt-5">
                                            <input type="checkbox" id="sliderActive" checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
                                            <label htmlFor="sliderActive" className="font-bold cursor-pointer">Aktif / Tayang</label>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* WKS FIELDS */}
                            {modalType === 'wks' && (
                                <>
                                    <div>
                                        <label className="block font-bold mb-1">Nama Lengkap & Gelar *</label>
                                        <input type="text" required value={formData.nama || ''} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Jabatan WKS *</label>
                                        <input type="text" required placeholder="Contoh: WKS 1 - Bidang Kurikulum" value={formData.jabatan || ''} onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                    <ImageUploader
                                        label="Foto Profil Wakil Kepala Sekolah"
                                        value={formData.fotoUrl || ''}
                                        onChange={(url) => setFormData({ ...formData, fotoUrl: url })}
                                        aspectRatio="square"
                                        required
                                        helperText="Unggah foto formal close-up rasio 1:1 (persegi)"
                                    />
                                </>
                            )}

                            {/* BERITA FIELDS */}
                            {modalType === 'berita' && (
                                <>
                                    <div>
                                        <label className="block font-bold mb-1">Judul Berita *</label>
                                        <input type="text" required value={formData.judul || ''} onChange={(e) => setFormData({ ...formData, judul: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Kategori Berita *</label>
                                        <select value={formData.kategori || 'Umum'} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs">
                                            <option value="Umum">Umum</option>
                                            <option value="Prestasi">Prestasi</option>
                                            <option value="Jurusan">Jurusan</option>
                                            <option value="Kegiatan">Kegiatan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Ringkasan Singkat</label>
                                        <textarea rows={2} value={formData.ringkasan || ''} onChange={(e) => setFormData({ ...formData, ringkasan: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Isi Konten Berita Lengkap *</label>
                                        <textarea rows={5} required value={formData.konten || ''} onChange={(e) => setFormData({ ...formData, konten: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs leading-relaxed" />
                                    </div>
                                    <ImageUploader
                                        label="Thumbnail Foto Berita & Kegiatan"
                                        value={formData.thumbnail || ''}
                                        onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                                        aspectRatio="banner"
                                        required
                                        helperText="Unggah foto landscape representatif untuk berita (16:9)"
                                    />
                                </>
                            )}

                            {/* MITRA FIELDS */}
                            {modalType === 'mitra' && (
                                <>
                                    <div>
                                        <label className="block font-bold mb-1">Nama Perusahaan Mitra *</label>
                                        <input type="text" required value={formData.namaPerusahaan || ''} onChange={(e) => setFormData({ ...formData, namaPerusahaan: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                    <ImageUploader
                                        label="Logo Perusahaan Mitra Industri"
                                        value={formData.logoUrl || ''}
                                        onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                                        aspectRatio="square"
                                        required
                                        helperText="Unggah logo perusahaan (disarankan file PNG transparan atau SVG)"
                                    />
                                    <div>
                                        <label className="block font-bold mb-1">Bidang Kerjasama / Jurusan</label>
                                        <input type="text" value={formData.bidangKerjasama || ''} onChange={(e) => setFormData({ ...formData, bidangKerjasama: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                </>
                            )}

                            {/* GURU FIELDS */}
                            {modalType === 'guru' && (
                                <>
                                    <div>
                                        <label className="block font-bold mb-1">Nama Lengkap & Gelar Guru *</label>
                                        <input type="text" required value={formData.nama || ''} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold mb-1">Mata Pelajaran / Bidang Keahlian *</label>
                                            <input type="text" required placeholder="Cth: Jaringan Komputer / TKJ" value={formData.mataPelajaran || ''} onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-1">NIP (Jika Ada)</label>
                                            <input type="text" placeholder="19800101 200501 1 001" value={formData.nip || ''} onChange={(e) => setFormData({ ...formData, nip: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Pendidikan / Gelar (Cth: S1 Pendidikan Komputer)</label>
                                        <input type="text" value={formData.pendidikan || ''} onChange={(e) => setFormData({ ...formData, pendidikan: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                    <ImageUploader
                                        label="Foto Guru / Tenaga Pendidik"
                                        value={formData.fotoUrl || ''}
                                        onChange={(url) => setFormData({ ...formData, fotoUrl: url })}
                                        aspectRatio="square"
                                        helperText="Unggah foto formal guru rasio 1:1 (persegi)"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold mb-1">Nomor Urutan</label>
                                            <input type="number" min={1} value={formData.urutan || 1} onChange={(e) => setFormData({ ...formData, urutan: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                        </div>
                                        <div className="flex items-center gap-2 pt-5">
                                            <input type="checkbox" id="guruActive" checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
                                            <label htmlFor="guruActive" className="font-bold cursor-pointer">Status Aktif</label>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* PROGRAM FIELDS */}
                            {modalType === 'program' && (
                                <>
                                    <div>
                                        <label className="block font-bold mb-1">Nama Kompetensi Keahlian *</label>
                                        <input type="text" required value={formData.nama || ''} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Singkatan / Kode Jurusan *</label>
                                        <input type="text" required value={formData.singkatan || ''} onChange={(e) => setFormData({ ...formData, singkatan: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                    <ImageUploader
                                        label="Logo / Lambang Resmi Kompetensi Keahlian"
                                        value={formData.iconUrl || ''}
                                        onChange={(url) => setFormData({ ...formData, iconUrl: url })}
                                        aspectRatio="square"
                                        required
                                        helperText="Unggah logo/lambang resmi jurusan (SVG atau PNG transparan)"
                                    />
                                    <MultiImageUploader
                                        label="Galeri Foto Kegiatan & Fasilitas Jurusan (Maksimal 5 Foto)"
                                        value={formData.fotoUrls || []}
                                        onChange={(urls) => setFormData({ ...formData, fotoUrls: urls })}
                                        maxPhotos={5}
                                        helperText="Unggah foto laboratorium, bengkel, atau kegiatan praktik siswa (maksimal 5 foto)"
                                    />
                                    <div>
                                        <label className="block font-bold mb-1">Deskripsi Jurusan *</label>
                                        <textarea rows={3} required value={formData.deskripsi || ''} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs leading-relaxed" />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Daya Tampung / Kuota Kursi</label>
                                        <input type="number" min={1} value={formData.kuota || 72} onChange={(e) => setFormData({ ...formData, kuota: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" />
                                    </div>
                                </>
                            )}

                            {/* AGENDA FIELDS */}
                            {modalType === 'agenda' && (
                                <>
                                    <div>
                                        <label className="block font-bold mb-1">Judul Agenda / Kegiatan *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Cth: Sosialisasi & Pendaftaran SPMB Gelombang 1"
                                            value={formData.judul || ''}
                                            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold mb-1">Tanggal Pelaksanaan *</label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.tanggal ? formData.tanggal.slice(0, 10) : ''}
                                                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-1">Waktu / Jam</label>
                                            <input
                                                type="text"
                                                placeholder="08:00 - 12:00 WIB"
                                                value={formData.waktu || ''}
                                                onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold mb-1">Lokasi / Tempat</label>
                                            <input
                                                type="text"
                                                placeholder="Aula Utama KH. Ahmad Dahlan"
                                                value={formData.lokasi || ''}
                                                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-1">Kategori Agenda</label>
                                            <select
                                                value={formData.kategori || 'Umum'}
                                                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                            >
                                                <option value="Umum">Umum</option>
                                                <option value="SPMB">SPMB / Pendaftaran</option>
                                                <option value="Akademik">Akademik & Ujian</option>
                                                <option value="Kesiswaan">Kesiswaan & Ekstra</option>
                                                <option value="Kejuruan">Kejuruan & DUDI</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Deskripsi & Rincian Agenda</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Uraian kegiatan atau panduan bagi calon peserta..."
                                            value={formData.deskripsi || ''}
                                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs leading-relaxed"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold mb-1">Nomor Urutan</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={formData.urutan || 1}
                                                onChange={(e) => setFormData({ ...formData, urutan: Number(e.target.value) })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-5">
                                            <input
                                                type="checkbox"
                                                id="agendaActive"
                                                checked={formData.isActive !== false}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="rounded"
                                            />
                                            <label htmlFor="agendaActive" className="font-bold cursor-pointer">
                                                Aktif / Tampilkan di Web
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* PRESTASI FIELDS */}
                            {modalType === 'prestasi' && (
                                <>
                                    <div>
                                        <label className="block font-bold mb-1">Judul Kejuaraan / Prestasi *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Cth: E-Sport Mobile Legends Pelajar Se-Sumbagsel"
                                            value={formData.judul || ''}
                                            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold mb-1">Badge Predikat Juara *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Cth: JUARA, JUARA 1, MEDALI EMAS"
                                                value={formData.kategoriJuara || 'JUARA'}
                                                onChange={(e) => setFormData({ ...formData, kategoriJuara: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs uppercase"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-1">Tingkat Kejuaraan</label>
                                            <select
                                                value={formData.tingkat || 'Kabupaten'}
                                                onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                            >
                                                <option value="Kabupaten">Kabupaten / Kota</option>
                                                <option value="Provinsi">Provinsi</option>
                                                <option value="Regional">Regional / Sumbagsel</option>
                                                <option value="Nasional">Nasional</option>
                                                <option value="Internasional">Internasional</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Nama Siswa / Tim Pemenang & Kelas *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Cth: Fikri Pratama · Kelas 12 TJKT"
                                            value={formData.namaPeserta || ''}
                                            onChange={(e) => setFormData({ ...formData, namaPeserta: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Nama Event / Penyelenggara Lomba</label>
                                        <input
                                            type="text"
                                            placeholder="Cth: OlympicAD 2026 di Universitas Muhammadiyah"
                                            value={formData.namaLomba || ''}
                                            onChange={(e) => setFormData({ ...formData, namaLomba: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                        />
                                    </div>
                                    <ImageUploader
                                        label="Foto Dokumentasi Prestasi / Penyerahan Piala *"
                                        value={formData.fotoUrl || ''}
                                        onChange={(url) => setFormData({ ...formData, fotoUrl: url })}
                                        aspectRatio="square"
                                        required
                                        helperText="Unggah foto dokumentasi juara memegang trofi atau piagam"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold mb-1">Tanggal Raihan</label>
                                            <input
                                                type="date"
                                                value={formData.tanggal ? formData.tanggal.slice(0, 10) : ''}
                                                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-1">Nomor Urutan</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={formData.urutan || 1}
                                                onChange={(e) => setFormData({ ...formData, urutan: Number(e.target.value) })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Keterangan / Cerita Prestasi</label>
                                        <textarea
                                            rows={2}
                                            value={formData.deskripsi || ''}
                                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs leading-relaxed"
                                        />
                                    </div>
                                </>
                            )}

                            {/* GALERI FIELDS */}
                            {modalType === 'galeri' && (
                                <>
                                    <div>
                                        <label className="block font-bold mb-1">Judul Album Galeri *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Cth: Gelar Karya Vokasi & Expo Jurusan SMK MUSKA"
                                            value={formData.judul || ''}
                                            onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold mb-1">Kategori Album</label>
                                            <select
                                                value={formData.kategori || 'Kegiatan'}
                                                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                            >
                                                <option value="Kegiatan">Kegiatan Sekolah</option>
                                                <option value="Pembelajaran">Praktik & Pembelajaran</option>
                                                <option value="Fasilitas">Fasilitas Kampus</option>
                                                <option value="Kesiswaan">Kesiswaan & Ekstra</option>
                                                <option value="Prestasi">Prestasi</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-1">Tanggal Dokumentasi</label>
                                            <input
                                                type="date"
                                                value={formData.tanggal ? formData.tanggal.slice(0, 10) : ''}
                                                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                            />
                                        </div>
                                    </div>
                                    <ImageUploader
                                        label="Foto Sampul / Thumbnail Album *"
                                        value={formData.thumbnail || ''}
                                        onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                                        aspectRatio="banner"
                                        required
                                        helperText="Unggah foto utama yang mewakili album ini (resolusi landscape)"
                                    />
                                    <MultiImageUploader
                                        label="Koleksi Foto Lainnya dalam Album (Maksimal 20 Foto)"
                                        value={formData.fotoUrls || []}
                                        onChange={(urls) => setFormData({ ...formData, fotoUrls: urls })}
                                        maxPhotos={20}
                                        helperText="Pengunjung dapat mengklik album untuk melihat seluruh foto lainnya secara lengkap"
                                    />
                                    <div>
                                        <label className="block font-bold mb-1">Deskripsi Album Galeri</label>
                                        <textarea
                                            rows={3}
                                            placeholder="Deskripsi singkat seputar kegiatan atau momen dokumentasi..."
                                            value={formData.deskripsi || ''}
                                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs leading-relaxed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Nomor Urutan</label>
                                        <input
                                            type="number"
                                                min={1}
                                            value={formData.urutan || 1}
                                            onChange={(e) => setFormData({ ...formData, urutan: Number(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs cursor-pointer">
                                    Batal
                                </button>
                                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Simpan Data</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
