'use client';

import { useState, useRef, useEffect } from 'react';
import { sendAiChatMessage } from '@/lib/api';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    source?: string;
    timestamp: string;
}

const QUICK_QUESTIONS = [
    'Apa saja 8 pilihan jurusan di SMK Muska?',
    'Apa saja syarat berkas yang harus diunggah?',
    'Bagaimana panduan memilih ukuran baju seragam?',
    'Kapan dan di mana jadwal ujian seleksi CBT?',
    'Bagaimana alur verifikasi berkas oleh panitia?',
];

export default function ChatbotRAG() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome-1',
            sender: 'bot',
            text: 'Assalamu’alaikum Warahmatullahi Wabarakatuh! 👋\n\nSelamat datang di Layanan Informasi Digital SPMB SMK Muhammadiyah Sekampung. Saya Asisten AI Berbasis RAG yang siap membantu Anda menjawab pertanyaan seputar pendaftaran, 8 program keahlian, berkas dokumen, dan ujian seleksi.',
            source: 'Sistem RAG SPMB MUSKA',
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (questionText?: string) => {
        const textToSend = (questionText || input).trim();
        if (!textToSend || loading) return;

        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: textToSend,
            timestamp: timeNow,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await sendAiChatMessage(textToSend);
            const botMsg: Message = {
                id: `bot-${Date.now()}`,
                sender: 'bot',
                text: response.answer,
                source: response.source || 'Asisten AI RAG',
                timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch {
            const errorMsg: Message = {
                id: `bot-err-${Date.now()}`,
                sender: 'bot',
                text: 'Mohon maaf, terjadi gangguan jaringan saat memproses pertanyaan Anda. Silakan coba sesaat lagi.',
                source: 'Sistem Error Handler',
                timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 font-sans">
            {/* FLOATING ACTION BUTTON */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white rounded-full shadow-2xl hover:shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-amber-400"
                    aria-label="Buka Chatbot AI SPMB"
                >
                    <span className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400"></span>
                    </span>

                    <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 text-amber-300 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="text-xs sm:text-sm font-bold tracking-wide">Tanya Asisten AI (RAG)</span>
                    </div>

                    <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-emerald-950 rounded-full shadow-xs">
                        MUSKA BOT
                    </span>
                </button>
            )}

            {/* EXPANDED CHAT WINDOW */}
            {isOpen && (
                <div className="w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-emerald-900/20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
                    {/* CHAT HEADER */}
                    <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-4 py-3.5 flex items-center justify-between border-b border-amber-400/30 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-white/10 p-1 border border-amber-400/50 flex items-center justify-center overflow-hidden">
                                    <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-800 rounded-full"></span>
                            </div>

                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-sm font-bold tracking-tight text-white leading-tight">
                                        Asisten AI SPMB Muska
                                    </h3>
                                    <span className="text-[9px] font-bold bg-amber-400 text-emerald-950 px-1.5 py-0.2 rounded font-mono">
                                        RAG
                                    </span>
                                </div>
                                <p className="text-[11px] text-emerald-200/90 leading-tight">
                                    SMK Muhammadiyah Sekampung
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setMessages([messages[0]])}
                                title="Bersihkan Percakapan"
                                className="p-1.5 text-emerald-200 hover:text-amber-300 hover:bg-white/10 rounded-lg transition"
                                aria-label="Bersihkan Percakapan"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition"
                                aria-label="Tutup Chat"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* QUICK SUGGESTIONS CAROUSEL / CHIPS */}
                    <div className="bg-emerald-50/80 px-3 py-2 border-b border-emerald-100 overflow-x-auto whitespace-nowrap flex gap-1.5 shrink-0 text-xs no-scrollbar">
                        <span className="text-[11px] font-semibold text-emerald-900/80 self-center shrink-0 pr-1">
                            💡 Contoh:
                        </span>
                        {QUICK_QUESTIONS.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(q)}
                                disabled={loading}
                                className="inline-block px-2.5 py-1 bg-white hover:bg-emerald-100 hover:border-emerald-400 text-emerald-800 text-[11px] font-medium rounded-full border border-emerald-200 shadow-2xs transition shrink-0 cursor-pointer disabled:opacity-50"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* MESSAGE HISTORY */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs whitespace-pre-wrap ${
                                        msg.sender === 'user'
                                            ? 'bg-emerald-700 text-white rounded-br-2xs'
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-2xs'
                                    }`}
                                >
                                    {msg.text}
                                </div>

                                <div className="flex items-center gap-1.5 mt-1 px-1">
                                    {msg.source && (
                                        <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                                            {msg.source}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                                </div>
                            </div>
                        ))}

                        {/* TYPING INDICATOR */}
                        {loading && (
                            <div className="flex flex-col items-start">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-2xs px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]"></div>
                                    <span className="text-[11px] text-slate-500 font-medium ml-1">
                                        Mencari pengetahuan RAG...
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* CHAT INPUT FORM */}
                    <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                placeholder="Tanyakan seputar jurusan, biaya, atau syarat..."
                                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition disabled:bg-slate-100"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || loading}
                                className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl shadow-md transition shrink-0 active:scale-95 disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed"
                                aria-label="Kirim Pesan"
                            >
                                <svg className="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400">
                            <span>Tekan Enter untuk mengirim</span>
                            <span className="text-emerald-700 font-medium">SMK Muhammadiyah Sekampung</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
