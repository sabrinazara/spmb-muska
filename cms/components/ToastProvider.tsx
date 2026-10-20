'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
    CheckCircle2,
    Trash2,
    AlertTriangle,
    XCircle,
    Info,
    X,
    Sparkles,
    AlertCircle,
    RefreshCw,
    Clock,
} from 'lucide-react';

export type ToastType = 'update' | 'change' | 'delete' | 'success' | 'error' | 'info';

export interface ToastItem {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    isClosing?: boolean;
    timestamp: string;
}

export interface ConfirmDialogOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
}

interface ToastContextType {
    showToast: (options: {
        type?: ToastType;
        title: string;
        message?: string;
        duration?: number;
    }) => void;
    notifyUpdate: (message: string, title?: string) => void;
    notifyChange: (message: string, title?: string) => void;
    notifyDelete: (message: string, title?: string) => void;
    notifySuccess: (message: string, title?: string) => void;
    notifyError: (message: string, title?: string) => void;
    confirmAction: (options: ConfirmDialogOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone event-based dispatcher for anywhere in the app
export const cmsToast = {
    show: (options: { type?: ToastType; title: string; message?: string; duration?: number }) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cms:toast', { detail: options }));
        }
    },
    update: (message: string, title: string = 'Pembaruan Data Berhasil') => {
        cmsToast.show({ type: 'update', title, message });
    },
    change: (message: string, title: string = 'Perubahan Data Disimpan') => {
        cmsToast.show({ type: 'change', title, message });
    },
    delete: (message: string, title: string = 'Data Berhasil Dihapus') => {
        cmsToast.show({ type: 'delete', title, message });
    },
    success: (message: string, title: string = 'Berhasil Disimpan') => {
        cmsToast.show({ type: 'success', title, message });
    },
    error: (message: string, title: string = 'Terjadi Kesalahan') => {
        cmsToast.show({ type: 'error', title, message });
    },
    confirm: (options: ConfirmDialogOptions) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cms:confirm', { detail: options }));
        }
    },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [confirmState, setConfirmState] = useState<ConfirmDialogOptions | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    // Dismiss a toast with top-sliding exit animation
    const dismissToast = useCallback((id: string) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, isClosing: true } : t))
        );

        // Remove from DOM after exit animation completes (320ms)
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 320);
    }, []);

    const showToast = useCallback(
        ({
            type = 'update',
            title,
            message,
            duration = 4200,
        }: {
            type?: ToastType;
            title: string;
            message?: string;
            duration?: number;
        }) => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const timeStr = new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
            });

            const newToast: ToastItem = {
                id,
                type,
                title,
                message,
                duration,
                isClosing: false,
                timestamp: timeStr,
            };

            // Limit to max 4 concurrent toasts
            setToasts((prev) => [newToast, ...prev.slice(0, 3)]);

            // Auto dismiss timer
            setTimeout(() => {
                dismissToast(id);
            }, duration);
        },
        [dismissToast]
    );

    const notifyUpdate = useCallback(
        (message: string, title: string = 'Pembaruan Data Berhasil') => {
            showToast({ type: 'update', title, message });
        },
        [showToast]
    );

    const notifyChange = useCallback(
        (message: string, title: string = 'Perubahan Data Disimpan') => {
            showToast({ type: 'change', title, message });
        },
        [showToast]
    );

    const notifyDelete = useCallback(
        (message: string, title: string = 'Data Berhasil Dihapus') => {
            showToast({ type: 'delete', title, message });
        },
        [showToast]
    );

    const notifySuccess = useCallback(
        (message: string, title: string = 'Berhasil Disimpan') => {
            showToast({ type: 'success', title, message });
        },
        [showToast]
    );

    const notifyError = useCallback(
        (message: string, title: string = 'Gagal Menyimpan Data') => {
            showToast({ type: 'error', title, message });
        },
        [showToast]
    );

    const confirmAction = useCallback((options: ConfirmDialogOptions) => {
        setConfirmState(options);
    }, []);

    // Listen to custom window events for global cross-component dispatch
    useEffect(() => {
        const handleToastEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail) {
                showToast(customEvent.detail);
            }
        };

        const handleConfirmEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail) {
                confirmAction(customEvent.detail);
            }
        };

        window.addEventListener('cms:toast', handleToastEvent);
        window.addEventListener('cms:confirm', handleConfirmEvent);

        return () => {
            window.removeEventListener('cms:toast', handleToastEvent);
            window.removeEventListener('cms:confirm', handleConfirmEvent);
        };
    }, [showToast, confirmAction]);

    const handleConfirmSubmit = async () => {
        if (!confirmState) return;
        setConfirmLoading(true);
        try {
            await confirmState.onConfirm();
            setConfirmState(null);
        } catch (error) {
            console.error('Confirmation error:', error);
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleConfirmCancel = () => {
        if (confirmState?.onCancel) {
            confirmState.onCancel();
        }
        setConfirmState(null);
    };

    return (
        <ToastContext.Provider
            value={{
                showToast,
                notifyUpdate,
                notifyChange,
                notifyDelete,
                notifySuccess,
                notifyError,
                confirmAction,
            }}
        >
            {children}

            {/* ========================================================
                TOP-RIGHT FLOATING TOAST CONTAINER (SUDUT KANAN ATAS)
                ANIMASI DARI ATAS KE BAWAH, CLOSE KE ATAS
            ======================================================== */}
            <div
                aria-live="polite"
                className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
            >
                {toasts.map((toast) => {
                    const isUpdate = toast.type === 'update';
                    const isChange = toast.type === 'change';
                    const isDelete = toast.type === 'delete';
                    const isError = toast.type === 'error';
                    const isSuccess = toast.type === 'success';

                    // Color Schemes
                    let accentGradient = 'from-emerald-500 to-teal-400';
                    let iconBg = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
                    let badgeBg = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
                    let badgeLabel = 'PEMBARUAN DATA';
                    let IconComponent = CheckCircle2;

                    if (isDelete) {
                        accentGradient = 'from-rose-500 via-rose-600 to-amber-500';
                        iconBg = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25';
                        badgeBg = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
                        badgeLabel = 'PENGHAPUSAN DATA';
                        IconComponent = Trash2;
                    } else if (isChange) {
                        accentGradient = 'from-teal-500 to-cyan-400';
                        iconBg = 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/25';
                        badgeBg = 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20';
                        badgeLabel = 'PERUBAHAN DATA';
                        IconComponent = RefreshCw;
                    } else if (isError) {
                        accentGradient = 'from-rose-600 to-red-500';
                        iconBg = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25';
                        badgeBg = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
                        badgeLabel = 'GAGAL / ERROR';
                        IconComponent = XCircle;
                    } else if (isSuccess) {
                        accentGradient = 'from-emerald-500 via-teal-500 to-green-400';
                        iconBg = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
                        badgeBg = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
                        badgeLabel = 'BERHASIL DISIMPAN';
                        IconComponent = CheckCircle2;
                    }

                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto relative w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-950/25 dark:shadow-slate-950/60 overflow-hidden transition-all duration-300 ${
                                toast.isClosing ? 'animate-toast-out' : 'animate-toast-in'
                            }`}
                            style={{
                                transformOrigin: 'top center',
                            }}
                        >
                            {/* Top Strip Accent Gradient */}
                            <div className={`h-1.5 w-full bg-gradient-to-r ${accentGradient}`} />

                            <div className="p-3.5 sm:p-4">
                                <div className="flex items-start gap-3">
                                    {/* Icon Badge */}
                                    <div
                                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconBg} shadow-xs`}
                                    >
                                        <IconComponent className="w-5 h-5 animate-pulse" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badgeBg}`}
                                            >
                                                {badgeLabel}
                                            </span>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
                                                <Clock className="w-3 h-3" />
                                                <span>{toast.timestamp}</span>
                                            </span>
                                        </div>

                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                            {toast.title}
                                        </h4>

                                        {toast.message && (
                                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed break-words">
                                                {toast.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Close Button (X) - Closes to Top */}
                                    <button
                                        type="button"
                                        onClick={() => dismissToast(toast.id)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                                        aria-label="Tutup notifikasi"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Animated Auto-dismiss Progress Bar */}
                            <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${accentGradient}`}
                                    style={{
                                        animation: `toast-progress ${toast.duration || 4200}ms linear forwards`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ========================================================
                GLOBAL CONFIRMATION MODAL
                Untuk mengonfirmasi pembaruan/penghapusan sebelum diproses
            ======================================================== */}
            {confirmState && (
                <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div
                        onClick={handleConfirmCancel}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
                    />

                    <div
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 z-10 animate-in zoom-in-95 duration-200 overflow-hidden"
                    >
                        <div
                            className={`h-1.5 absolute top-0 left-0 right-0 ${
                                confirmState.type === 'danger'
                                    ? 'bg-rose-500'
                                    : confirmState.type === 'warning'
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                            }`}
                        />

                        <div className="flex items-start gap-4">
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                    confirmState.type === 'danger'
                                        ? 'bg-rose-500/15 text-rose-500 border border-rose-500/25'
                                        : confirmState.type === 'warning'
                                        ? 'bg-amber-500/15 text-amber-500 border border-amber-500/25'
                                        : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                                }`}
                            >
                                {confirmState.type === 'danger' ? (
                                    <Trash2 className="w-6 h-6" />
                                ) : confirmState.type === 'warning' ? (
                                    <AlertTriangle className="w-6 h-6" />
                                ) : (
                                    <AlertCircle className="w-6 h-6" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
                                    {confirmState.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                                    {confirmState.message}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                disabled={confirmLoading}
                                onClick={handleConfirmCancel}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                            >
                                {confirmState.cancelLabel || 'Batal'}
                            </button>
                            <button
                                type="button"
                                disabled={confirmLoading}
                                onClick={handleConfirmSubmit}
                                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                                    confirmState.type === 'danger'
                                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                                        : confirmState.type === 'warning'
                                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                }`}
                            >
                                {confirmLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                <span>{confirmState.confirmLabel || 'Ya, Konfirmasi'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        // Fallback to event-based dispatcher if used outside provider
        return {
            showToast: cmsToast.show,
            notifyUpdate: cmsToast.update,
            notifyChange: cmsToast.change,
            notifyDelete: cmsToast.delete,
            notifySuccess: cmsToast.success,
            notifyError: cmsToast.error,
            confirmAction: cmsToast.confirm,
        };
    }
    return context;
}
