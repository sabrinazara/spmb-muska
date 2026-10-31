'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    Megaphone,
    Award,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    Search,
    Filter,
    Calendar,
    Save,
    ExternalLink,
    RefreshCw,
    Users,
    GraduationCap,
    Sliders,
    Edit3,
    Check,
    X,
    FileText,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders, USER_URL } from '@/lib/api';
import { cmsToast } from '@/components/ToastProvider';

interface SystemSettings {
    pengumumanDibuka: boolean;
    tanggalPengumuman: string;
    tahunAjaran: string;
    bukaPendaftaran: boolean;
    judulPengumuman?: string;
    pesanLulus?: string;
    pesanTidakLulus?: string;
}

interface Pendaftar {
    id: string;
    nomorPendaftaran: string | null;
    namaLengkap: string | null;
    nisn: string;
    jurusan: string;
    sekolahAsal: string | null;
    status: 'PENDING' | 'VALID' | 'INVALID';
    statusKelulusan: 'LULUS' | 'TIDAK_LULUS' | 'CADANGAN' | 'MENUNGGU';
    nilaiUjian: number | null;
    jadwalUjian: string | null;
    ruangUjian: string | null;
    catatanVerifikasi: string | null;
    user?: {
        nama: string | null;
        email: string;
    };
}

export default function PengumumanKelulusanAdminPage() {
    // State Pengaturan Pengumuman
    const [settings, setSettings] = useState<SystemSettings>({
        pengumumanDibuka: false,
        tanggalPengumuman: '2026-06-01T10:00:00',
        tahunAjaran: '2026/2027',
        bukaPendaftaran: true,
        judulPengumuman: 'Pengumuman Hasil Seleksi PPDB SMK Muhammadiyah Sekampung',
        pesanLulus: 'Selamat! Anda dinyatakan LULUS dalam seleksi Penerimaan Peserta Didik Baru (PPDB) SMK Muhammadiyah Sekampung. Silakan segera lakukan daftar ulang sesuai petunjuk yang diberikan.',
        pesanTidakLulus: 'Mohon maaf, Anda belum dinyatakan lulus pada kompetensi keahlian pilihan utama. Anda dapat berkonsultasi dengan panitia mengenai pilihan kompetensi keahlian lainnya.',
    });
    const [savingSettings, setSavingSettings] = useState(false);

    // State Data Siswa
    const [pendaftarList, setPendaftarList] = useState<Pendaftar[]>([]);
    const [loadingPendaftar, setLoadingPendaftar] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
    const [filterJurusan, setFilterJurusan] = useState<string>('SEMUA');

    // Multi-select untuk bulk action
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkUpdating, setBulkUpdating] = useState(false);

    // Modal Edit Siswa Individual
    const [editingStudent, setEditingStudent] = useState<Pendaftar | null>(null);
    const [editForm, setEditForm] = useState({
        statusKelulusan: 'MENUNGGU' as 'LULUS' | 'TIDAK_LULUS' | 'CADANGAN' | 'MENUNGGU',
        nilaiUjian: '' as string | number,
        jadwalUjian: '',
        ruangUjian: '',
        catatan: '',
    });
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoadingPendaftar(true);
        try {
            // 1. Fetch Pengaturan Sistem
            const resSettings = await fetch(API_ENDPOINTS.ADMIN.SETTINGS, {
                headers: getAuthHeaders(),
            });
            if (resSettings.ok) {
                const settingsData = await resSettings.json();
                setSettings({
                    pengumumanDibuka: settingsData.pengumumanDibuka ?? false,
                    tanggalPengumuman: settingsData.tanggalPengumuman || '2026-06-01T10:00:00',
                    tahunAjaran: settingsData.tahunAjaran || '2026/2027',
                    bukaPendaftaran: settingsData.bukaPendaftaran ?? true,
                    judulPengumuman: settingsData.judulPengumuman || 'Pengumuman Hasil Seleksi PPDB SMK Muhammadiyah Sekampung',
                    pesanLulus: settingsData.pesanLulus || 'Selamat! Anda dinyatakan LULUS dalam seleksi Penerimaan Peserta Didik Baru (PPDB) SMK Muhammadiyah Sekampung.',
                    pesanTidakLulus: settingsData.pesanTidakLulus || 'Mohon maaf, Anda belum dinyatakan lulus pada kompetensi keahlian pilihan utama.',
                });
            }

            // 2. Fetch Seluruh Pendaftar untuk Manajemen Kelulusan
            const resPendaftar = await fetch(`${API_ENDPOINTS.ADMIN.PENDAFTAR}?limit=1000`, {
                headers: getAuthHeaders(),
            });

            if (resPendaftar.status === 401 || resPendaftar.status === 403) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                window.location.href = '/login?expired=1';
                return;
            }

            if (resPendaftar.ok) {
                const pendaftarData = await resPendaftar.json();
                const list = pendaftarData.items || pendaftarData.data || [];
                setPendaftarList(list);
            } else {
                cmsToast.error('Gagal mengambil data pendaftar dari server');
            }
        } catch (err) {
            console.error('Error fetching announcement data:', err);
            cmsToast.error('Gagal memuat data pengumuman dan pendaftar');
        } finally {
            setLoadingPendaftar(false);
        }
    };

    // Simpan Pengaturan Jadwal & Publikasi Pengumuman
    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.SETTINGS, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(settings),
            });

            if (!res.ok) throw new Error('Gagal menyimpan pengaturan');
            cmsToast.success('Pengaturan publikasi pengumuman berhasil disimpan');
        } catch {
            cmsToast.error('Gagal memperbarui pengaturan pengumuman');
        } finally {
            setSavingSettings(false);
        }
    };

    // Bulk Update Status Kelulusan
    const handleBulkUpdate = async (status: 'LULUS' | 'TIDAK_LULUS' | 'CADANGAN' | 'MENUNGGU') => {
        if (selectedIds.length === 0) {
            cmsToast.error('Pilih minimal satu calon siswa terlebih dahulu', 'Peringatan');
            return;
        }

        setBulkUpdating(true);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.UPDATE_KELULUSAN_BATCH, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    pendaftaranIds: selectedIds,
                    statusKelulusan: status,
                }),
            });

            if (!res.ok) throw new Error('Gagal update batch');

            cmsToast.success(`Berhasil memperbarui status ${selectedIds.length} siswa menjadi ${status}`);

            // Update local state
            setPendaftarList((prev) =>
                prev.map((p) =>
                    selectedIds.includes(p.id) ? { ...p, statusKelulusan: status } : p
                )
            );
            setSelectedIds([]);
        } catch {
            cmsToast.error('Gagal memperbarui status kelulusan siswa terpilih');
        } finally {
            setBulkUpdating(false);
        }
    };

    // Buka Modal Edit Siswa
    const openEditModal = (student: Pendaftar) => {
        setEditingStudent(student);
        setEditForm({
            statusKelulusan: student.statusKelulusan || 'MENUNGGU',
            nilaiUjian: student.nilaiUjian ?? '',
            jadwalUjian: student.jadwalUjian || '',
            ruangUjian: student.ruangUjian || '',
            catatan: student.catatanVerifikasi || '',
        });
    };

    // Simpan Edit Siswa Individual
    const handleSaveEdit = async () => {
        if (!editingStudent) return;
        setSavingEdit(true);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.UPDATE_NILAI(editingStudent.id), {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    statusKelulusan: editForm.statusKelulusan,
                    nilaiUjian: editForm.nilaiUjian === '' ? null : Number(editForm.nilaiUjian),
                    jadwalUjian: editForm.jadwalUjian,
                    ruangUjian: editForm.ruangUjian,
                    catatan: editForm.catatan,
                }),
            });

            if (!res.ok) throw new Error('Gagal menyimpan nilai');

            cmsToast.success(`Status kelulusan ${editingStudent.namaLengkap || 'siswa'} berhasil diperbarui`);

            setPendaftarList((prev) =>
                prev.map((p) =>
                    p.id === editingStudent.id
                        ? {
                            ...p,
                            statusKelulusan: editForm.statusKelulusan,
                            nilaiUjian: editForm.nilaiUjian === '' ? null : Number(editForm.nilaiUjian),
                            jadwalUjian: editForm.jadwalUjian,
                            ruangUjian: editForm.ruangUjian,
                            catatanVerifikasi: editForm.catatan,
                        }
                        : p
                )
            );
            setEditingStudent(null);
        } catch {
            cmsToast.error('Gagal menyimpan perubahan siswa');
        } finally {
            setSavingEdit(false);
        }
    };

    // Dynamic Available Jurusan
    const availableJurusan = useMemo(() => {
        const set = new Set<string>();
        pendaftarList.forEach((p) => {
            if (p.jurusan) set.add(p.jurusan);
        });
        const defaults = [
            'Teknik Jaringan Komputer dan Telekomunikasi',
            'Teknik Otomotif',
            'Desain Komunikasi Visual',
            'Bisnis Digital dan Kreatif',
            'Kulineri',
            'Kecantikan dan Tata Rias',
            'Teknik Pemesinan',
            'Teknik Pengelasan',
        ];
        defaults.forEach((d) => set.add(d));
        return Array.from(set).sort();
    }, [pendaftarList]);

    // Filter list pendaftar
    const filteredList = useMemo(() => {
        const searchLower = search.toLowerCase().trim();
        return pendaftarList.filter((p) => {
            const matchSearch =
                !searchLower ||
                (p.namaLengkap && p.namaLengkap.toLowerCase().includes(searchLower)) ||
                (p.nisn && p.nisn.toLowerCase().includes(searchLower)) ||
                (p.nomorPendaftaran && p.nomorPendaftaran.toLowerCase().includes(searchLower)) ||
                (p.sekolahAsal && p.sekolahAsal.toLowerCase().includes(searchLower)) ||
                (p.jurusan && p.jurusan.toLowerCase().includes(searchLower));

            const st = (p.statusKelulusan || 'MENUNGGU').toUpperCase();
            const matchStatus =
                filterStatus === 'SEMUA' || st === filterStatus;

            const matchJurusan =
                filterJurusan === 'SEMUA' || p.jurusan === filterJurusan;

            return matchSearch && matchStatus && matchJurusan;
        });
    }, [pendaftarList, search, filterStatus, filterJurusan]);

    // Summary Counter
    const stats = useMemo(() => {
        let lulus = 0;
        let tidakLulus = 0;
        let cadangan = 0;
        let menunggu = 0;

        pendaftarList.forEach((p) => {
            const st = (p.statusKelulusan || 'MENUNGGU').toUpperCase();
            if (st === 'LULUS') lulus++;
            else if (st === 'TIDAK_LULUS') tidakLulus++;
            else if (st === 'CADANGAN') cadangan++;
            else menunggu++;
        });

        return { total: pendaftarList.length, lulus, tidakLulus, cadangan, menunggu };
    }, [pendaftarList]);

    // Select all handler
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredList.map((p) => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((item) => item !== id));
        }
    };

    // Format datetime-local string
    const formatDateTimeForInput = (isoString: string) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        } catch {
            return '';
        }
    };

    return (
        <div className="space-y-8 font-sans pb-16">
            {/* TOP HEADER & ACTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                        <Megaphone className="w-6 h-6 text-emerald-600" />
                        <span>Manajemen Pengumuman & Kelulusan</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Kelola publikasi hitung mundur pengumuman, status kelulusan peserta, dan pesan resmi kelulusan SPMB.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={loadData}
                        disabled={loadingPendaftar}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingPendaftar ? 'animate-spin' : ''}`} />
                        <span>Refresh Data</span>
                    </button>

                    <a
                        href={`${USER_URL}/pengumuman`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                        <span>Lihat Halaman Publik</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>

            {/* RINGKASAN STATISTIK KELULUSAN */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                <button
                    onClick={() => setFilterStatus('SEMUA')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${filterStatus === 'SEMUA'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400'
                        }`}
                >
                    <div className="text-[11px] font-bold opacity-75 uppercase tracking-wider">Total Pendaftar</div>
                    <div className="text-2xl font-black mt-1">{stats.total}</div>
                </button>

                <button
                    onClick={() => setFilterStatus('LULUS')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${filterStatus === 'LULUS'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:border-emerald-500'
                        }`}
                >
                    <div className="text-[11px] font-bold opacity-75 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dinyatakan Lulus</span>
                    </div>
                    <div className="text-2xl font-black mt-1">{stats.lulus}</div>
                </button>

                <button
                    onClick={() => setFilterStatus('TIDAK_LULUS')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${filterStatus === 'TIDAK_LULUS'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                        : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 hover:border-rose-500'
                        }`}
                >
                    <div className="text-[11px] font-bold opacity-75 uppercase tracking-wider flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tidak Lolos</span>
                    </div>
                    <div className="text-2xl font-black mt-1">{stats.tidakLulus}</div>
                </button>

                <button
                    onClick={() => setFilterStatus('CADANGAN')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${filterStatus === 'CADANGAN'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                        : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:border-amber-500'
                        }`}
                >
                    <div className="text-[11px] font-bold opacity-75 uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Cadangan</span>
                    </div>
                    <div className="text-2xl font-black mt-1">{stats.cadangan}</div>
                </button>

                <button
                    onClick={() => setFilterStatus('MENUNGGU')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${filterStatus === 'MENUNGGU'
                        ? 'bg-slate-600 text-white border-slate-600 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                        }`}
                >
                    <div className="text-[11px] font-bold opacity-75 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Menunggu</span>
                    </div>
                    <div className="text-2xl font-black mt-1">{stats.menunggu}</div>
                </button>
            </div>

            {/* CARD 1: PENGATURAN PUBLIKASI & HITUNG MUNDUR PENGUMUMAN */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                Pengaturan Jadwal & Publikasi Pengumuman
                            </h2>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Atur kapan pengumuman kelulusan dapat diakses oleh publik dan calon siswa
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* TOGGLE PENGUMUMAN DIBUKA */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="font-bold text-xs text-slate-900 dark:text-white">Status Buka Pengumuman</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {settings.pengumumanDibuka
                                        ? 'Pengumuman SEDANG DIBUKA untuk umum'
                                        : 'Pengumuman DITUTUP (Menampilkan Hitung Mundur)'}
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.pengumumanDibuka}
                                    onChange={(e) => setSettings({ ...settings, pengumumanDibuka: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* TANGGAL & WAKTU PENGUMUMAN */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                            <label className="font-bold text-xs text-slate-900 dark:text-white block">
                                Tanggal & Jam Buka Pengumuman Resmi (WIB)
                            </label>
                            <input
                                type="datetime-local"
                                value={formatDateTimeForInput(settings.tanggalPengumuman)}
                                onChange={(e) => setSettings({ ...settings, tanggalPengumuman: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                            />
                        </div>

                        {/* TAHUN AJARAN */}
                        <div className="space-y-1">
                            <label className="font-bold text-xs text-slate-700 dark:text-slate-300">Tahun Ajaran SPMB</label>
                            <input
                                type="text"
                                value={settings.tahunAjaran}
                                onChange={(e) => setSettings({ ...settings, tahunAjaran: e.target.value })}
                                placeholder="Contoh: 2026/2027"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                            />
                        </div>

                        {/* JUDUL PENGUMUMAN */}
                        <div className="space-y-1">
                            <label className="font-bold text-xs text-slate-700 dark:text-slate-300">Judul Pengumuman</label>
                            <input
                                type="text"
                                value={settings.judulPengumuman || ''}
                                onChange={(e) => setSettings({ ...settings, judulPengumuman: e.target.value })}
                                placeholder="Pengumuman Hasil Seleksi PPDB"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                            />
                        </div>

                        {/* PESAN UNTUK YANG LULUS */}
                        <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-xs text-slate-700 dark:text-slate-300">Pesan Pengantar Bagi Siswa yang LULUS</label>
                            <textarea
                                rows={2}
                                value={settings.pesanLulus || ''}
                                onChange={(e) => setSettings({ ...settings, pesanLulus: e.target.value })}
                                placeholder="Pesan ucapan selamat dan instruksi daftar ulang..."
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                            />
                        </div>

                        {/* PESAN UNTUK YANG TIDAK LULUS */}
                        <div className="space-y-1 md:col-span-2">
                            <label className="font-bold text-xs text-slate-700 dark:text-slate-300">Pesan Bagi Siswa yang TIDAK LULUS</label>
                            <textarea
                                rows={2}
                                value={settings.pesanTidakLulus || ''}
                                onChange={(e) => setSettings({ ...settings, pesanTidakLulus: e.target.value })}
                                placeholder="Pesan penyemangat dan arahan jurusan lain..."
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={savingSettings}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            <span>Simpan Pengaturan Pengumuman</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* CARD 2: MANAJEMEN KELULUSAN SISWA */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-600" />
                            <span>Daftar & Penentuan Status Kelulusan Calon Siswa</span>
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Tetapkan status kelulusan peserta secara massal atau individual
                        </p>
                    </div>

                    {/* BULK ACTION TOOLBAR (JIKA ADA SISWA DICENTANG) */}
                    {selectedIds.length > 0 && (
                        <div className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-wrap items-center gap-2 animate-in fade-in duration-200">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
                                {selectedIds.length} Terpilih:
                            </span>
                            <button
                                onClick={() => handleBulkUpdate('LULUS')}
                                disabled={bulkUpdating}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Luluskan</span>
                            </button>
                            <button
                                onClick={() => handleBulkUpdate('CADANGAN')}
                                disabled={bulkUpdating}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Cadangan</span>
                            </button>
                            <button
                                onClick={() => handleBulkUpdate('TIDAK_LULUS')}
                                disabled={bulkUpdating}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tidak Lulus</span>
                            </button>
                            <button
                                onClick={() => handleBulkUpdate('MENUNGGU')}
                                disabled={bulkUpdating}
                                className="px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Reset Menunggu</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* SEARCH & FILTER BAR */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari berdasarkan Nama, NISN, No. Pendaftaran, atau Asal Sekolah..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={filterJurusan}
                            onChange={(e) => setFilterJurusan(e.target.value)}
                            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 cursor-pointer max-w-xs truncate"
                        >
                            <option value="SEMUA">Semua Jurusan ({availableJurusan.length})</option>
                            {availableJurusan.map((j) => (
                                <option key={j} value={j}>
                                    {j}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* TABEL SISWA */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-3 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={filteredList.length > 0 && selectedIds.length === filteredList.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                </th>
                                <th className="p-3">No. Pendaftaran / NISN</th>
                                <th className="p-3">Nama Lengkap & Sekolah Asal</th>
                                <th className="p-3">Pilihan Jurusan</th>
                                <th className="p-3">Nilai CBT</th>
                                <th className="p-3">Verifikasi</th>
                                <th className="p-3">Status Kelulusan</th>
                                <th className="p-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loadingPendaftar ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-400">
                                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                                        <span>Memuat data pendaftar...</span>
                                    </td>
                                </tr>
                            ) : filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-400">
                                        Tidak ada data pendaftar yang cocok dengan filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((p) => {
                                    const isSelected = selectedIds.includes(p.id);
                                    return (
                                        <tr
                                            key={p.id}
                                            className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                                                }`}
                                        >
                                            <td className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                />
                                            </td>
                                            <td className="p-3 font-mono">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {p.nomorPendaftaran || '-'}
                                                </div>
                                                <div className="text-[10px] text-slate-400">{p.nisn}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {p.namaLengkap || p.user?.nama || 'Calon Siswa'}
                                                </div>
                                                <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                                    {p.sekolahAsal || '-'}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {p.jurusan}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {p.nilaiUjian !== null && p.nilaiUjian !== undefined ? (
                                                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                                        {p.nilaiUjian}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">-</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'VALID'
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        : p.status === 'INVALID'
                                                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                                        }`}
                                                >
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${p.statusKelulusan === 'LULUS'
                                                        ? 'bg-emerald-600 text-white shadow-xs'
                                                        : p.statusKelulusan === 'TIDAK_LULUS'
                                                            ? 'bg-rose-600 text-white shadow-xs'
                                                            : p.statusKelulusan === 'CADANGAN'
                                                                ? 'bg-amber-500 text-white shadow-xs'
                                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                        }`}
                                                >
                                                    {p.statusKelulusan === 'LULUS' && <CheckCircle2 className="w-3 h-3" />}
                                                    {p.statusKelulusan === 'TIDAK_LULUS' && <XCircle className="w-3 h-3" />}
                                                    {p.statusKelulusan === 'CADANGAN' && <AlertCircle className="w-3 h-3" />}
                                                    {p.statusKelulusan === 'MENUNGGU' && <Clock className="w-3 h-3" />}
                                                    <span>{p.statusKelulusan || 'MENUNGGU'}</span>
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => openEditModal(p)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition flex items-center gap-1 ml-auto cursor-pointer"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    <span>Kelulusan</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <div>Menampilkan {filteredList.length} dari {pendaftarList.length} pendaftar</div>
                </div>
            </div>

            {/* MODAL EDIT STATUS KELULUSAN INDIVIDUAL */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                    Penetapan Kelulusan Calon Siswa
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {editingStudent.namaLengkap} ({editingStudent.nisn})
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingStudent(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            {/* PILIH STATUS KELULUSAN */}
                            <div className="space-y-1.5">
                                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                                    Status Kelulusan Siswa *
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditForm({ ...editForm, statusKelulusan: 'LULUS' })}
                                        className={`p-3 rounded-xl border text-center font-bold transition cursor-pointer ${editForm.statusKelulusan === 'LULUS'
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        LULUS (DITERIMA)
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setEditForm({ ...editForm, statusKelulusan: 'TIDAK_LULUS' })}
                                        className={`p-3 rounded-xl border text-center font-bold transition cursor-pointer ${editForm.statusKelulusan === 'TIDAK_LULUS'
                                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        TIDAK LULUS
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setEditForm({ ...editForm, statusKelulusan: 'CADANGAN' })}
                                        className={`p-3 rounded-xl border text-center font-bold transition cursor-pointer ${editForm.statusKelulusan === 'CADANGAN'
                                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        CADANGAN
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setEditForm({ ...editForm, statusKelulusan: 'MENUNGGU' })}
                                        className={`p-3 rounded-xl border text-center font-bold transition cursor-pointer ${editForm.statusKelulusan === 'MENUNGGU'
                                            ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        MENUNGGU
                                    </button>
                                </div>
                            </div>

                            {/* NILAI CBT */}
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700 dark:text-slate-300">
                                    Nilai Ujian Seleksi / CBT (Skala 0 - 100)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={editForm.nilaiUjian}
                                    onChange={(e) => setEditForm({ ...editForm, nilaiUjian: e.target.value })}
                                    placeholder="Contoh: 85.5"
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700 dark:text-slate-300">Jadwal Ujian</label>
                                    <input
                                        type="text"
                                        value={editForm.jadwalUjian}
                                        onChange={(e) => setEditForm({ ...editForm, jadwalUjian: e.target.value })}
                                        placeholder="Contoh: Gelombang 1 - Sesi 1"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-bold text-slate-700 dark:text-slate-300">Ruang Ujian</label>
                                    <input
                                        type="text"
                                        value={editForm.ruangUjian}
                                        onChange={(e) => setEditForm({ ...editForm, ruangUjian: e.target.value })}
                                        placeholder="Contoh: Lab Komputer 1"
                                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>

                            {/* CATATAN PANITIA */}
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700 dark:text-slate-300">Catatan Khusus Panitia untuk Siswa</label>
                                <textarea
                                    rows={2}
                                    value={editForm.catatan}
                                    onChange={(e) => setEditForm({ ...editForm, catatan: e.target.value })}
                                    placeholder="Catatan verifikasi atau pesan khusus kelulusan..."
                                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setEditingStudent(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveEdit}
                                disabled={savingEdit}
                                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {savingEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                <span>Simpan Perubahan</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
