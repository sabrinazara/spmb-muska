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
    Archive,
    Power,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api';

export default function SettingsPage() {
    const [bukaPendaftaran, setBukaPendaftaran] = useState(true);
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
                setBukaPendaftaran(data.bukaPendaftaran !== false);
                setPengumumanDibuka(!!data.pengumumanDibuka);
                if (data.tanggalPengumuman) {
                    const d = new Date(data.tanggalPengumuman);
                    const formatted = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16);
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
                    bukaPendaftaran,
                    pengumumanDibuka,
                    tanggalPengumuman: new Date(tanggalPengumuman).toISOString(),
                    tahunAjaran,
                }),
            });
            const result = await res.json();

            if (res.ok) {
                setMsg({ type: 'success', text: result.message || 'Pengaturan SPMB & Kelulusan berhasil diperbarui.' });
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
                    <span>Pengaturan Pendaftaran & Jadwal Kelulusan</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Kelola buka/tutup pendaftaran, tahun ajaran aktif, sistem arsip tahunan, serta rilis pengumuman kelulusan siswa.
                </p>
            </div>

            {msg && (
                <div
                    className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-2xs animate-in fade-in duration-200 ${
                        msg.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
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

            <form onSubmit={handleSave} className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 max-w-3xl">
                {/* BUKA / TUTUP PENDAFTARAN */}
                <div className={`p-4 rounded-2xl border transition ${
                    bukaPendaftaran
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                } flex items-center justify-between`}>
                    <div className="pr-4">
                        <div className="flex items-center gap-2">
                            <Power className={`w-4 h-4 ${bukaPendaftaran ? 'text-emerald-600' : 'text-rose-600'}`} />
                            <div className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                                Status Pendaftaran SPMB
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                bukaPendaftaran
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-rose-500 text-white'
                            }`}>
                                {bukaPendaftaran ? 'SEDANG DIBUKA' : 'DITUTUP'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {bukaPendaftaran
                                ? 'Pendaftaran sedang dibuka. Calon siswa baru dapat membuat akun dan melengkapi formulir.'
                                : 'Pendaftaran ditutup sementara. Pengunjung portal siswa akan melihat pemberitahuan penutupan pendaftaran.'}
                        </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                            type="checkbox"
                            checked={bukaPendaftaran}
                            onChange={(e) => setBukaPendaftaran(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                </div>

                {/* TAHUN AJARAN AKTIF & ARSIP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Archive className="w-4 h-4 text-emerald-500" />
                            <span>Tahun Ajaran Aktif</span>
                        </label>
                        <select
                            value={tahunAjaran}
                            onChange={(e) => setTahunAjaran(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold cursor-pointer"
                        >
                            <option value="2026/2027">Tahun Ajaran 2026/2027 (Berjalan)</option>
                            <option value="2027/2028">Tahun Ajaran 2027/2028 (Mendatang)</option>
                            <option value="2025/2026">Tahun Ajaran 2025/2026 (Arsip)</option>
                            <option value="2024/2025">Tahun Ajaran 2024/2025 (Arsip)</option>
                        </select>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Data pendaftar baru akan otomatis tercatat pada tahun ajaran ini.
                        </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Sistem Arsip Otomatis</span>
                        </div>
                        <p>
                            Data pendaftar tahun sebelumnya tersimpan rapi dan dapat difilter di menu <strong>Data Pendaftar</strong> menggunakan filter Tahun Ajaran tanpa menumpuk.
                        </p>
                    </div>
                </div>

                {/* STATUS TOGGLE PENGUMUMAN */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                            Status Pengumuman Kelulusan
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Jika diaktifkan, portal siswa langsung membuka hasil kelulusan dan popup daftar ulang resmi
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

                {/* TANGGAL DAN JAM RILIS */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span>Waktu & Tanggal Rilis Pengumuman (Termasuk Jam & Menit)</span>
                    </label>
                    <input
                        type="datetime-local"
                        required
                        value={tanggalPengumuman}
                        onChange={(e) => setTanggalPengumuman(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hitung mundur di dashboard siswa akan berhenti tepat pada jam & menit ini.</span>
                    </p>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
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
                </div>
            </form>
        </div>
    );
}
