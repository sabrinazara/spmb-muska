'use client';

import { useState, useRef, useEffect } from 'react';
import {
    MessageSquare,
    X,
    Send,
    RotateCcw,
    Bot,
    User,
    Sparkles,
    HelpCircle,
    ChevronDown,
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
    'Apa saja 8 program keahlian di SMK Muska?',
    'Apa saja syarat berkas yang harus diunggah?',
    'Bagaimana panduan memilih ukuran baju seragam?',
    'Kapan dan di mana jadwal ujian seleksi CBT?',
    'Apakah pendaftaran awal ini dipungut biaya?',
];

export default function ChatbotRAG() {
    const [isOpen, setIsOpen] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome-1',
            sender: 'bot',
            text: 'Assalamu’alaikum Warahmatullahi Wabarakatuh.\n\nSelamat datang di Layanan Informasi SPMB SMK Muhammadiyah Sekampung. Silakan tanyakan seputar jurusan, berkas pendaftaran, jadwal ujian, atau panduan seragam sekolah.',
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
                source: response.source || 'Asisten AI Muska',
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
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-sans">
            {/* FLOATING LAUNCHER: LOGO CHATBOT DENGAN TULISAN TANYA DI SINI */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-950 dark:bg-slate-900 hover:bg-slate-900 dark:hover:bg-slate-800 text-white shadow-xl hover:shadow-2xl border border-emerald-500/50 hover:border-emerald-500 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
                    aria-label="Tanya di Sini - Asisten AI SPMB"
                    title="Tanya di Sini - Asisten AI SPMB"
                >
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 group-hover:bg-emerald-500 transition-colors shadow-xs">
                        <Bot className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                        Tanya di Sini
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </button>
            )}

            {/* EXPANDED MINIMALIST & SLEEK CHAT CARD */}
            {isOpen && (
                <div className="w-[calc(100vw-32px)] sm:w-[360px] max-w-[360px] h-[480px] max-h-[80vh] bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* MINIMALIST HEADER */}
                    <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span>MUSKA AI</span>
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    {/* <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span> */}
                                    <span>Mau nanya apa?</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setMessages([messages[0]])}
                                title="Mulai Ulang Percakapan"
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                aria-label="Reset Chat"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                                aria-label="Tutup Chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* QUICK PROMPTS */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto whitespace-nowrap flex items-center gap-1.5 shrink-0 text-xs no-scrollbar">
                        {QUICK_QUESTIONS.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(q)}
                                disabled={loading}
                                className="inline-block px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-600 dark:text-slate-300 text-[11px] font-medium rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs transition shrink-0 cursor-pointer disabled:opacity-50"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* MESSAGE HISTORY */}
                    <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/40 dark:bg-slate-950/40 scrollbar-thin">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs whitespace-pre-wrap ${msg.sender === 'user'
                                            ? 'bg-emerald-600 text-white rounded-br-2xs font-medium'
                                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-2xs'
                                        }`}
                                >
                                    {msg.text}
                                </div>

                                <div className="flex items-center gap-1.5 mt-1 px-1">
                                    {msg.source && (
                                        <span className="text-[9px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 rounded">
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
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-2xs px-3.5 py-2.5 shadow-2xs flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        Menganalisis jawaban...
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* CHAT INPUT BAR */}
                    <div className="p-2.5 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 focus-within:border-emerald-500 transition-colors">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                placeholder="Ketik pertanyaan di sini..."
                                className="flex-1 text-xs bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none disabled:opacity-50"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || loading}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-lg transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
                                aria-label="Kirim Pesan"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

