'use client';

import { useState, useEffect } from 'react';
import {
    UserCog,
    UserPlus,
    Trash2,
    Shield,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Mail,
    Lock,
    User,
    RefreshCw,
    X,
} from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '@/lib/api';

interface AdminAccount {
    id: string;
    nama: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [admins, setAdmins] = useState<AdminAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Modal state for adding admin
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Current logged in user ID to prevent self-deletion
    const [currentUserId, setCurrentUserId] = useState<string>('');

    const fetchAdmins = async () => {
        setLoading(true);
        setActionMsg(null);
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.USERS, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const data = await res.json();
                setAdmins(data || []);
            } else {
                setActionMsg({ type: 'error', text: 'Gagal mengambil daftar administrator.' });
            }
        } catch {
            setActionMsg({ type: 'error', text: 'Gagal terhubung ke backend server.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setCurrentUserId(parsed.userId || parsed.id || '');
            } catch {}
        }
        fetchAdmins();
    }, []);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nama.trim() || !email.trim() || !password.trim()) {
            setActionMsg({ type: 'error', text: 'Lengkapi semua isian form.' });
            return;
        }

        setSubmitting(true);
        setActionMsg(null);

        try {
            const res = await fetch(API_ENDPOINTS.ADMIN.USERS, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nama, email, password }),
            });
            const result = await res.json();

            if (res.ok) {
                setActionMsg({ type: 'success', text: result.message || 'Administrator baru berhasil ditambahkan.' });
                setNama('');
                setEmail('');
                setPassword('');
                setIsModalOpen(false);
                fetchAdmins();
            } else {
                setActionMsg({ type: 'error', text: result.message || 'Gagal menambahkan administrator.' });
            }
        } catch {
            setActionMsg({ type: 'error', text: 'Gagal menghubungi server backend.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAdmin = async (id: string, adminNama: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus administrator "${adminNama}"?`)) return;

        try {
            const res = await fetch(`${API_ENDPOINTS.ADMIN.USERS}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            const result = await res.json();

            if (res.ok) {
                setActionMsg({ type: 'success', text: result.message || 'Administrator berhasil dihapus.' });
                fetchAdmins();
            } else {
                setActionMsg({ type: 'error', text: result.message || 'Gagal menghapus administrator.' });
            }
        } catch {
            setActionMsg({ type: 'error', text: 'Gagal menghubungi server backend.' });
        }
    };

    // SKELETON LOADING
    if (loading) {
        return (
            <div className="space-y-6 font-sans animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-lg w-64"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
                    </div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-36"></div>
                </div>
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans pb-12 animate-in fade-in duration-300">
            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-emerald-500" />
                        <span>Manajemen Administrator & Panitia SPMB</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Kelola akun panitia yang memiliki hak akses ke panel CMS MUSKA
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchAdmins}
                        className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition cursor-pointer"
                        title="Segarkan data"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Tambah Administrator</span>
                    </button>
                </div>
            </div>

            {/* Notification alert */}
            {actionMsg && (
                <div
                    className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-2xs animate-in fade-in duration-200 ${
                        actionMsg.type === 'success'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {actionMsg.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span>{actionMsg.text}</span>
                    </div>
                    <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Table of Admins */}
            <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                            <tr>
                                <th className="py-3 px-4">Nama Lengkap</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Peran</th>
                                <th className="py-3 px-4">Tanggal Dibuat</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {admins.length > 0 ? (
                                admins.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                                                {item.nama.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span>{item.nama}</span>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                                            {item.email}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                <Shield className="w-3 h-3" />
                                                <span>{item.role}</span>
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            {item.id === currentUserId ? (
                                                <span className="text-[11px] font-semibold text-slate-400 italic">
                                                    (Akun Anda)
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteAdmin(item.id, item.nama)}
                                                    className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg transition cursor-pointer"
                                                    title={`Hapus ${item.nama}`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                                        Tidak ada akun administrator yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL TAMBAH ADMINISTRATOR */}
            {isModalOpen && (
                <div
                    onClick={() => setIsModalOpen(false)}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-emerald-500" />
                                <span>Tambah Administrator Baru</span>
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Nama Lengkap *
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="text"
                                        required
                                        value={nama}
                                        onChange={(e) => setNama(e.target.value)}
                                        placeholder="Nama Panitia PPDB"
                                        className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Email Akun *
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="panitia@muska.sch.id"
                                        className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Password *
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimal 6 karakter"
                                        className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <span>Simpan Akun</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
