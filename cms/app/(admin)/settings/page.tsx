'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Sliders,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Save,
    Clock,
    Sparkles,
    Archive,
    Power,
    RefreshCw,
    GraduationCap,
    Globe,
    FileText,
    HelpCircle,
    ArrowRight,
    Layers,
    Check,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api';
import { cmsToast } from '@/components/ToastProvider';

export default function SettingsPage() {
    const [bukaPendaftaran, setBukaPendaftaran] = useState(true);
    const [pengumumanDibuka, setPengumumanDibuka] = useState(false);
    const [tanggalPengumuman, setTanggalPengumuman] = useState('2026-06-20T08:00');
    const [tahunAjaran, setTahunAjaran] = useState('2026/2027');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Initial backup state to allow reset
    const [initialSettings, setInitialSettings] = useState<{
        bukaPendaftaran: boolean;
        pengumumanDibuka: boolean;
        tanggalPengumuman: string;
        tahunAjaran: string;
    } | null>(null);

    const TAHUN_SUGGESTIONS = [
        '2026/2027',
        '2027/2028',
        '2028/2029',
        '2029/2030',
        '2025/2026',
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.SETTINGS, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                const isBuka = data.bukaPendaftaran !== false;
                const isPengumuman = !!data.pengumumanDibuka;
                let formattedTanggal = '2026-06-20T08:00';
                if (data.tanggalPengumuman) {
                    const d = new Date(data.tanggalPengumuman);
                    formattedTanggal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16);
                }
                const activeTahun = data.tahunAjaran || '2026/2027';

                setBukaPendaftaran(isBuka);
                setPengumumanDibuka(isPengumuman);
                setTanggalPengumuman(formattedTanggal);
                setTahunAjaran(activeTahun);

                setInitialSettings({
                    bukaPendaftaran: isBuka,
                    pengumumanDibuka: isPengumuman,
                    tanggalPengumuman: formattedTanggal,
                    tahunAjaran: activeTahun,
                });
            }
        } catch {
            setMsg({ type: 'error', text: 'Gagal memuat pengaturan sistem.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);

        const cleanTahun = tahunAjaran.trim();
        if (!cleanTahun) {
            setMsg({ type: 'error', text: 'Tahun Ajaran wajib diisi. Contoh: 2026/2027' });
            setSaving(false);
            return;
        }

        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.SETTINGS, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    bukaPendaftaran,
                    pengumumanDibuka,
                    tanggalPengumuman: new Date(tanggalPengumuman).toISOString(),
                    tahunAjaran: cleanTahun,
                }),
            });
            const result = await res.json();

            if (res.ok) {
                setMsg({ type: 'success', text: result.message || 'Pengaturan SPMB & Tahun Ajaran berhasil diperbarui.' });
                cmsToast.update('Pengaturan SPMB dan Tahun Ajaran berhasil disimpan dan disinkronkan ke seluruh sistem.', 'Perubahan Pengaturan Disimpan');
                setInitialSettings({
                    bukaPendaftaran,
                    pengumumanDibuka,
                    tanggalPengumuman,
                    tahunAjaran: cleanTahun,
                });
            } else {
                setMsg({ type: 'error', text: result.message || 'Gagal menyimpan pengaturan.' });
                cmsToast.error(result.message || 'Gagal menyimpan pengaturan.', 'Gagal Menyimpan');
            }
        } catch {
            setMsg({ type: 'error', text: 'Terjadi kesalahan koneksi saat menyimpan pengaturan.' });
            cmsToast.error('Terjadi kesalahan koneksi saat menyimpan pengaturan.', 'Kesalahan Koneksi');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (!initialSettings) return;
        setBukaPendaftaran(initialSettings.bukaPendaftaran);
        setPengumumanDibuka(initialSettings.pengumumanDibuka);
        setTanggalPengumuman(initialSettings.tanggalPengumuman);
        setTahunAjaran(initialSettings.tahunAjaran);
        setMsg(null);
    };

    const getCountdownPreview = () => {
        if (!tanggalPengumuman) return 'Belum ditentukan';
        const target = new Date(tanggalPengumuman).getTime();
        const now = new Date().getTime();
        const diff = target - now;
        if (diff <= 0) return 'Jadwal telah tercapai (Pengumuman siap dilihat siswa)';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${days} Hari, ${hours} Jam, ${minutes} Menit lagi`;
    };

    const isDirty = initialSettings && (
        initialSettings.bukaPendaftaran !== bukaPendaftaran ||
        initialSettings.pengumumanDibuka !== pengumumanDibuka ||
        initialSettings.tanggalPengumuman !== tanggalPengumuman ||
        initialSettings.tahunAjaran !== tahunAjaran
    );

    if (loading) {
        return (
            <div className="space-y-6 font-sans animate-pulse">
                <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                    <div className="lg:col-span-4 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* HERO HEADER BANNER */}
            <div className="relative rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-md overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
                            <span>Sistem Kontrol SPMB</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                            Pengaturan SPMB & Jadwal Kelulusan
                        </h1>
                        <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 leading-relaxed">
                            Kelola tahun ajaran aktif, buka/tutup pendaftaran siswa, dan jadwal pengumuman kelulusan. Semua perubahan otomatis terhubung ke seluruh portal calon siswa.
                        </p>
                    </div>

                    <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-xs ${bukaPendaftaran
                            ? 'bg-emerald-400 text-slate-950 ring-2 ring-emerald-300/50'
                            : 'bg-rose-500 text-white ring-2 ring-rose-300/50'
                            }`}>
                            <Power className="w-3.5 h-3.5" />
                            <span>{bukaPendaftaran ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-amber-200 border border-white/20">
                            <Archive className="w-3.5 h-3.5 text-amber-300" />
                            <span>TA Aktif: <strong>{tahunAjaran}</strong></span>
                        </span>
                    </div>
                </div>
            </div>

            {/* ALERT NOTIFICATION */}
            {msg && (
                <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-2xs animate-in fade-in duration-200 ${msg.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                        }`}
                >
                    <div className="flex items-center gap-2.5">
                        {msg.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                        )}
                        <span>{msg.text}</span>
                    </div>
                    {isDirty && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-xs font-semibold underline hover:opacity-80 cursor-pointer"
                        >
                            Batal
                        </button>
                    )}
                </div>
            )}

            {/* 2-COLUMN BALANCED LAYOUT */}
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* KOLOM KIRI (FORM UTAMA) */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                    {/* CARD 1: PENERIMAAN SISWA & TAHUN AJARAN */}
                    <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Archive className="w-4 h-4 text-emerald-500" />
                                    <span>Penerimaan & Tahun Ajaran Aktif</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Kontrol akses formulir dan periode kalender akademik penerimaan siswa baru
                                </p>
                            </div>
                        </div>

                        {/* TOGGLE BUKA / TUTUP PENDAFTARAN */}
                        <div className={`p-4 rounded-2xl border transition-all ${bukaPendaftaran
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                            } flex items-center justify-between gap-4`}>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    {/* <Power className={`w-4 h-4 ${bukaPendaftaran ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} /> */}
                                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                        Status Akses Pendaftaran
                                    </span>
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${bukaPendaftaran
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-rose-500 text-white'
                                        }`}>
                                        {bukaPendaftaran ? 'DIBUKA' : 'DITUTUP'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                    {bukaPendaftaran
                                        ? 'Pendaftaran sedang aktif. Calon siswa baru dapat melakukan registrasi akun, memilih jurusan, dan melengkapi dokumen biodata.'
                                        : 'Pendaftaran ditutup sementara. Pengunjung portal siswa akan melihat pemberitahuan bahwa penerimaan siswa sedang ditutup.'}
                                </p>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={bukaPendaftaran}
                                    onChange={(e) => setBukaPendaftaran(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-12 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* INPUT MANUAL TAHUN AJARAN */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-emerald-500" />
                                        <span>Tahun Ajaran Aktif (Bisa Diisi Manual Sendiri)</span>
                                    </span>
                                    <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 lowercase">
                                        otomatis sync ke user
                                    </span>
                                </label>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                    Ketikkan tahun ajaran secara bebas saat berganti periode baru (contoh: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-emerald-600">2026/2027</code>, <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-emerald-600">2027/2028</code>).
                                </p>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={tahunAjaran}
                                    onChange={(e) => setTahunAjaran(e.target.value)}
                                    placeholder="Contoh: 2026/2027"
                                    className="w-full px-4 py-3 text-sm font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                                />
                                {tahunAjaran && (
                                    <span className="absolute right-3.5 top-3.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        <Check className="w-3 h-3" />
                                        <span>TA Aktif</span>
                                    </span>
                                )}
                            </div>

                            {/* SHORTCUT PILLS TAHUN AJARAN */}
                            <div className="space-y-1.5 pt-1">
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    Pilih cepat / rekomendasi tahun:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {TAHUN_SUGGESTIONS.map((sug) => {
                                        const isSelected = tahunAjaran.trim() === sug;
                                        return (
                                            <button
                                                key={sug}
                                                type="button"
                                                onClick={() => setTahunAjaran(sug)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${isSelected
                                                    ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                                    }`}
                                            >
                                                {sug}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: PENGUMUMAN KELULUSAN & JADWAL CBT */}
                    <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                                    <span>Pengumuman Kelulusan & Rilis Hasil Ujian</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Jadwalkan tanggal dan jam resmi pembukaan hasil seleksi ke siswa
                                </p>
                            </div>
                        </div>

                        {/* STATUS TOGGLE PENGUMUMAN LANGSUNG */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <div className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                        Rilis Pengumuman Kelulusan Langsung
                                    </div>
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${pengumumanDibuka
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-amber-500 text-white'
                                        }`}>
                                        {pengumumanDibuka ? 'DIBUKA SEKARANG' : 'MENUNGGU JADWAL'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Jika diaktifkan, portal siswa langsung membuka hasil kelulusan dan popup daftar ulang resmi tanpa menunggu hitung mundur waktu.
                                </p>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={pengumumanDibuka}
                                    onChange={(e) => setPengumumanDibuka(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-12 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* TANGGAL DAN JAM RILIS */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                <span>Waktu & Tanggal Rilis Pengumuman (Termasuk Jam & Menit WIB)</span>
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={tanggalPengumuman}
                                onChange={(e) => setTanggalPengumuman(e.target.value)}
                                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                            />
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span>Hitung Mundur:</span>
                                </span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    {getCountdownPreview()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ACTION SAVE BUTTON BAR */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 sm:flex-none px-7 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Menyimpan Pengaturan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Semua Pengaturan</span>
                                </>
                            )}
                        </button>

                        {isDirty && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* KOLOM KANAN (SIDEBAR MONITOR & LIVE PREVIEW) */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                    {/* CARD 3: LIVE MONITOR STATUS */}
                    <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-500" />
                                <span>Pertinjau</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                                REALTIME
                            </span>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Status Pendaftaran:</span>
                                <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${bukaPendaftaran
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                    }`}>
                                    {bukaPendaftaran ? 'SEDANG DIBUKA' : 'DITUTUP'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Tahun Ajaran Aktif:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                    TA {tahunAjaran || '-'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Status Pengumuman:</span>
                                <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${pengumumanDibuka
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                    }`}>
                                    {pengumumanDibuka ? 'Rilis Langsung' : 'Sesuai Jadwal'}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                                <span className="text-slate-500 dark:text-slate-400 font-medium block">Waktu Rilis Pengumuman:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white block">
                                    {tanggalPengumuman ? new Date(tanggalPengumuman).toLocaleString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }) + ' WIB' : '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* CARD 4: PENGARUH KE HALAMAN SISWA */}
                    <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Layers className="w-4 h-4 text-emerald-500" />
                            <span>Sinkronisasi Otomatis ke Siswa</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Saat pengaturan disimpan, seluruh komponen siswa di bawah ini otomatis menyesuaikan:
                        </p>

                        <div className="space-y-2.5 text-xs">
                            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <Globe className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">Landing Page Utama</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        Badge hero slider otomatis menampilkan <strong className="text-emerald-600">TA {tahunAjaran}</strong>.
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <Sliders className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">Dashboard Siswa</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        Banner sambutan menyapa calon siswa dengan <strong className="text-emerald-600">Tahun Ajaran {tahunAjaran}</strong>.
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <FileText className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">Cetak Kartu Ujian & Formulir</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        Judul kop dan QR Code verifikasi PDF memuat <strong className="text-emerald-600">TA {tahunAjaran}</strong>.
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <GraduationCap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">Pengumuman Kelulusan</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        Hitung mundur dan rilis hasil kelulusan siswa disinkronkan tepat waktu.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 5: PANDUAN PERGANTIAN TAHUN */}
                    <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Panduan Pergantian Tahun
                            </h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Ketika tahun ajaran baru tiba, panitia cukup mengetikkan tahun baru pada isian (misal: <strong>2027/2028</strong>) lalu simpan.
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-2">
                            Seluruh data pendaftar lama tetap aman tersimpan sebagai arsip dan dapat difilter di menu <Link href="/pendaftar" className="text-emerald-600 font-bold hover:underline">Data Pendaftar</Link>.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}

