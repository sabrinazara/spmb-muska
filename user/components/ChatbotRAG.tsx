'use client';

import { useState, useRef, useEffect } from 'react';
import {
    MessageSquare,
    X,
    Send,
    RotateCcw,
    Bot,
    User,
    HelpCircle,
    Sparkles,
} from 'lucide-react';
import { sendAiChatMessage } from '@/lib/api';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    source?: string;
    timestamp: string;
}

const QUICK_QUESTIONS = [
    'Apa saja 8 jurusan di SMK Muska?',
    'Apa saja syarat berkas yang harus diunggah?',
    'Bagaimana panduan memilih ukuran baju seragam?',
    'Kapan dan di mana jadwal ujian seleksi CBT?',
    'Apakah biaya pendaftaran awal gratis?',
];

export default function ChatbotRAG() {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome-1',
            sender: 'bot',
            text: 'Assalamu’alaikum Warahmatullahi Wabarakatuh.\n\nSelamat datang di Layanan Informasi Digital SPMB SMK Muhammadiyah Sekampung. Saya Asisten Virtual Sistem Informasi Pendaftaran yang siap membantu menjawab pertanyaan seputar program keahlian, berkas persyaratan, dan alur seleksi.',
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
                source: response.source || 'Asisten Informasi',
                timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch {
            const errorMsg: Message = {
                id: `bot-err-${Date.now()}`,
                sender: 'bot',
                text: 'Mohon maaf, terjadi kendala saat memproses pertanyaan Anda. Silakan coba kembali sesaat lagi.',
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
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* MINIMALIST ROUND FLOATING BUTTON WITH DISMISSIBLE "Tanya di sini" POPUP */}
            {!isOpen && (
                <div className="relative flex items-center gap-3">
                    {/* Tooltip bubble "Tanya di sini" */}
                    {showTooltip && (
                        <div className="flex items-center gap-2 bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-slate-200 animate-in fade-in slide-in-from-right-2 duration-300">
                            <span
                                onClick={() => setIsOpen(true)}
                                className="cursor-pointer hover:text-emerald-700 transition"
                            >
                                Tanya di sini
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowTooltip(false);
                                }}
                                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
                                aria-label="Tutup teks"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Circular Button */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-14 h-14 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-xl hover:shadow-emerald-900/40 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-emerald-600 cursor-pointer relative group"
                        aria-label="Buka Chatbot Layanan Informasi"
                    >
                        <MessageSquare className="w-6 h-6 text-amber-300 group-hover:scale-110 transition-transform" />
                        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border-2 border-emerald-800"></span>
                        </span>
                    </button>
                </div>
            )}

            {/* EXPANDED CHAT WINDOW */}
            {isOpen && (
                <div className="w-[92vw] sm:w-[400px] h-[560px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* CHAT HEADER */}
                    <div className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between border-b border-emerald-700 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-700 p-1.5 flex items-center justify-center text-amber-300">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white leading-tight">
                                    Layanan Informasi AI
                                </h3>
                                <p className="text-[10px] text-emerald-200">
                                    SMK Muhammadiyah Sekampung
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setMessages([messages[0]])}
                                title="Reset Percakapan"
                                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700 rounded-lg transition cursor-pointer"
                                aria-label="Bersihkan Percakapan"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700 rounded-lg transition cursor-pointer"
                                aria-label="Tutup Chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* QUICK QUESTIONS */}
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 overflow-x-auto whitespace-nowrap flex items-center gap-1.5 shrink-0 text-xs no-scrollbar">
                        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 shrink-0 pr-1">
                            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Pilihan:</span>
                        </div>
                        {QUICK_QUESTIONS.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(q)}
                                disabled={loading}
                                className="inline-block px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-[11px] font-medium rounded-full border border-slate-200 shadow-2xs transition shrink-0 cursor-pointer disabled:opacity-50"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* MESSAGE HISTORY */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs whitespace-pre-wrap ${
                                        msg.sender === 'user'
                                            ? 'bg-emerald-700 text-white rounded-br-2xs'
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-2xs'
                                    }`}
                                >
                                    {msg.text}
                                </div>

                                <div className="flex items-center gap-1.5 mt-1 px-1">
                                    {msg.source && (
                                        <span className="text-[9px] font-medium text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
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
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-2xs px-3.5 py-2.5 shadow-2xs flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-medium">
                                        Memproses jawaban...
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
                                placeholder="Ketik pertanyaan di sini..."
                                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition disabled:bg-slate-100"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || loading}
                                className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl shadow-xs transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
                                aria-label="Kirim Pesan"
                            >
                                <Send className="w-4 h-4 text-amber-300" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
