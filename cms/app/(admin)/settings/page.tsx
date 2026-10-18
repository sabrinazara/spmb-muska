'use client';

import { useState, useEffect } from 'react';
import {
    Sliders,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Save,
    Clock,
    Sparkles,
    ShieldAlert,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api';

export default function SettingsPage() {
    const [pengumumanDibuka, setPengumumanDibuka] = useState(false);
    const [tanggalPengumuman, setTanggalPengumuman] = useState('2026-06-20T08:00');
    const [tahunAjaran, setTahunAjaran] = useState('2026/2027');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
                setPengumumanDibuka(!!data.pengumumanDibuka);
                if (data.tanggalPengumuman) {
                    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
                    const d = new Date(data.tanggalPengumuman);
                    const formatted = d.toISOString().slice(0, 16);
                    setTanggalPengumuman(formatted);
                }
                if (data.tahunAjaran) {
                    setTahunAjaran(data.tahunAjaran);
                }
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

        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.SETTINGS, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    pengumumanDibuka,
                    tanggalPengumuman: new Date(tanggalPengumuman).toISOString(),
                    tahunAjaran,
                }),
            });
            const result = await res.json();

            if (res.ok) {
                setMsg({ type: 'success', text: result.message || 'Pengaturan kelulusan berhasil diperbarui.' });
            } else {
                setMsg({ type: 'error', text: result.message || 'Gagal menyimpan pengaturan.' });
            }
        } catch {
            setMsg({ type: 'error', text: 'Terjadi kesalahan koneksi saat menyimpan.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 font-sans animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-500" />
                    <span>Pengaturan Pengumuman & Jadwal Kelulusan</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Kelola tanggal rilis kelulusan dan aktifkan hitung mundur (countdown) di portal siswa
                </p>
            </div>

            {msg && (
                <div
                    className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-2xs animate-in fade-in duration-200 ${
                        msg.type === 'success'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {msg.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span>{msg.text}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSave} className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl">
                {/* STATUS TOGGLE */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                            Status Pengumuman Kelulusan
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Jika diaktifkan, portal siswa langsung membuka hasil kelulusan dan popup daftar ulang
                        </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={pengumumanDibuka}
                            onChange={(e) => setPengumumanDibuka(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                </div>

                {/* TANGGAL DAN WAKTU PENGUMUMAN */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                        Target Tanggal & Jam Pengumuman (Hitung Mundur Siswa) *
                    </label>
                    <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="datetime-local"
                            required
                            value={tanggalPengumuman}
                            onChange={(e) => setTanggalPengumuman(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-mono font-medium focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                        Sebelum tanggal ini tiba, siswa akan melihat waktu mundur detik/menit/jam/hari secara realtime di dashboard mereka.
                    </p>
                </div>

                {/* TAHUN AJARAN */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                        Tahun Ajaran PPDB *
                    </label>
                    <input
                        type="text"
                        required
                        value={tahunAjaran}
                        onChange={(e) => setTahunAjaran(e.target.value)}
                        placeholder="2026/2027"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                <span>Menyimpan Pengaturan...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Simpan Pengaturan</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
