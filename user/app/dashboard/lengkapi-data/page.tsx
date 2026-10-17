'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/api';

export default function LengkapiDataPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        // 1. Data Diri
        namaLengkap: '',
        jenisKelamin: 'Laki-laki',
        agama: 'Islam',
        tempatLahir: '',
        tanggalLahir: '',
        alamat: '',
        noHpWa: '',
        sekolahAsal: '',
        nisn: '',
        nik: '',

        // 2. Data Fisik
        beratBadan: '',
        tinggiBadan: '',

        // 3. Data Orang Tua & Wali
        namaAyah: '',
        pekerjaanAyah: '',
        namaIbu: '',
        namaIbuKandung: '',
        pekerjaanIbu: '',
        alamatOrtu: '',
        noHpOrtu: '',
        namaWali: '',
        alamatWali: '',
        noHpWali: '',

        // 4. Pilihan Jurusan
        jurusan: '1. TKJ (Teknik Komputer & Jaringan)',

        // 4. Ukuran Baju
        ukuranBaju: 'M (40-45 kg)',
        ukuranBajuLainnya: '',

        // 5. Intra & Ekstrakurikuler
        intrakurikuler: 'IPM',
        ekstrakurikuler: [] as string[],
    });

    const JURUSAN_OPTIONS = [
        '1. TKJ (Teknik Komputer & Jaringan)',
        '2. TSM (Teknik Sepeda Motor)',
        '3. DKV (Desain Komunikasi Visual)',
        '4. Bisnis Digital',
        '5. Tata Boga',
        '6. Kecantikan',
        '7. Pemesinan (CNC)',
        '8. Pengelasan (Welding)',
    ];

    const UKURAN_BAJU_OPTIONS = [
        'S (30-40 kg)',
        'M (40-45 kg)',
        'L (45-50 kg)',
        'XL (50-55 kg)',
        'XXL (55-60 kg)',
        'XXXL (60-65 kg)',
        '4XL (65-70 kg)',
        'Lainnya',
    ];

    const INTRAKURIKULER_OPTIONS = [
        'IPM',
        'Hizbul Wathan',
        'Tapak Suci',
        'Pramuka',
    ];

    const EKSTRAKURIKULER_OPTIONS = [
        'Bola Voli',
        'Paskibra',
        'Beladiri',
        'Futsal',
        'Web programing',
        'Paduan suara',
        'Seni tari',
        'Muska band',
        'E-Sport',
        'Jurnalistik',
    ];

    const AGAMA_OPTIONS = [
        'Islam',
        'Kristen',
        'Katolik',
        'Hindu',
        'Budha',
        'Khonghucu',
    ];

    const STEPS = [
        { id: 1, title: 'Data Diri', desc: 'Identitas pribadi calon siswa' },
        { id: 2, title: 'Data Fisik', desc: 'Tinggi & berat badan' },
        { id: 3, title: 'Orang Tua & Wali', desc: 'Kontak keluarga & wali' },
        { id: 4, title: 'Jurusan & Seragam', desc: 'Pilihan kejuruan & ukuran' },
        { id: 5, title: 'Minat & Organisasi', desc: 'Intra & ekstrakurikuler' },
    ];

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetch(API_ENDPOINTS.PENDAFTARAN.SAYA, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data && data.id) {
                    const matchedJurusan =
                        JURUSAN_OPTIONS.find((j) =>
                            data.jurusan && (j.toLowerCase().includes(data.jurusan.toLowerCase()) || data.jurusan.toLowerCase().includes(j.toLowerCase()))
                        ) || data.jurusan || JURUSAN_OPTIONS[0];

                    setFormData((prev) => ({
                        ...prev,
                        namaLengkap: data.namaLengkap || data.user?.nama || '',
                        jenisKelamin: data.jenisKelamin || 'Laki-laki',
                        agama: data.agama || 'Islam',
                        tempatLahir: data.tempatLahir || '',
                        tanggalLahir: data.tanggalLahir || '',
                        alamat: data.alamat || '',
                        noHpWa: data.noHpWa || '',
                        sekolahAsal: data.sekolahAsal || '',
                        nisn: data.nisn || '',
                        nik: data.nik || '',
                        beratBadan: data.beratBadan ? String(data.beratBadan) : '',
                        tinggiBadan: data.tinggiBadan ? String(data.tinggiBadan) : '',
                        namaAyah: data.namaAyah || '',
                        pekerjaanAyah: data.pekerjaanAyah || '',
                        namaIbu: data.namaIbu || data.namaIbuKandung || '',
                        namaIbuKandung: data.namaIbuKandung || data.namaIbu || '',
                        pekerjaanIbu: data.pekerjaanIbu || '',
                        alamatOrtu: data.alamatOrtu || '',
                        noHpOrtu: data.noHpOrtu || '',
                        namaWali: data.namaWali || '',
                        alamatWali: data.alamatWali || '',
                        noHpWali: data.noHpWali || '',
                        jurusan: matchedJurusan,
                        ukuranBaju: data.ukuranBaju || 'M (40-45 kg)',
                        ukuranBajuLainnya: data.ukuranBajuLainnya || '',
                        intrakurikuler: data.intrakurikuler || 'IPM',
                        ekstrakurikuler: Array.isArray(data.ekstrakurikuler) ? data.ekstrakurikuler : [],
                    }));
                }
            })
            .catch((err) => console.error('Fetch error:', err))
            .finally(() => setLoading(false));
    }, [router]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === 'namaIbu') {
                updated.namaIbuKandung = value;
            }
            if (name === 'namaIbuKandung') {
                updated.namaIbu = value;
            }
            return updated;
        });
    };

    const handleCheckboxChange = (option: string) => {
        setFormData((prev) => {
            const exists = prev.ekstrakurikuler.includes(option);
            return {
                ...prev,
                ekstrakurikuler: exists
                    ? prev.ekstrakurikuler.filter((item) => item !== option)
                    : [...prev.ekstrakurikuler, option],
            };
        });
    };

    const calculateBMI = () => {
        const bb = parseFloat(formData.beratBadan);
        const tb = parseFloat(formData.tinggiBadan) / 100;
        if (!bb || !tb || tb <= 0) return null;
        const bmi = bb / (tb * tb);
        let category = 'Normal';
        let color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        if (bmi < 18.5) {
            category = 'Berat Badan Kurang';
            color = 'text-amber-700 bg-amber-50 border-amber-200';
        } else if (bmi >= 25 && bmi < 29.9) {
            category = 'Kelebihan Berat Badan';
            color = 'text-amber-700 bg-amber-50 border-amber-200';
        } else if (bmi >= 30) {
            category = 'Obesitas';
            color = 'text-rose-700 bg-rose-50 border-rose-200';
        }
        return { value: bmi.toFixed(1), category, color };
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        setMessage(null);

        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(API_ENDPOINTS.PENDAFTARAN.LENGKAPI_DATA, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    namaIbu: formData.namaIbuKandung || formData.namaIbu,
                    namaIbuKandung: formData.namaIbuKandung || formData.namaIbu,
                    beratBadan: formData.beratBadan ? parseFloat(formData.beratBadan) : undefined,
                    tinggiBadan: formData.tinggiBadan ? parseFloat(formData.tinggiBadan) : undefined,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                setMessage({
                    type: 'success',
                    text: 'Formulir data diri berhasil disimpan! Data Anda telah terintegrasi dengan database panitia SPMB.',
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setMessage({
                    type: 'error',
                    text: result.message || 'Gagal menyimpan kelengkapan formulir pendaftaran.',
                });
            }
        } catch {
            setMessage({
                type: 'error',
                text: 'Terjadi kegagalan jaringan saat mengirim data ke server backend.',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 font-sans">
                <div className="w-12 h-12 border-4 border-emerald-700 border-t-amber-400 rounded-full animate-spin"></div>
                <p className="mt-4 text-xs font-semibold text-slate-500 tracking-wide uppercase">
                    Memuat Data Formulir SPMB...
                </p>
            </div>
        );
    }

    const bmiInfo = calculateBMI();

    return (
        <div className="space-y-6 font-sans antialiased pb-12">
            {/* PAGE TITLE & PROGRESS BANNER */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 sm:p-8 shadow-md border-b-4 border-amber-400 relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        Portal SPMB SMK Muhammadiyah Sekampung
                    </div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                        Formulir Kelengkapan Data Diri Calon Siswa
                    </h1>
                    <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
                        Lengkapi 5 tahapan biodata berikut secara akurat sesuai berkas Kartu Keluarga, KTP, dan Ijazah untuk verifikasi penerimaan peserta didik baru.
                    </p>
                </div>
            </div>

            {/* ALERT NOTIFICATION */}
            {message && (
                <div
                    className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between border shadow-xs animate-in fade-in duration-200 ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-rose-50 text-rose-900 border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                            {message.type === 'success' ? '✓' : '!'}
                        </span>
                        <span>{message.text}</span>
                    </div>
                    <button
                        onClick={() => setMessage(null)}
                        className="text-slate-400 hover:text-slate-600 text-sm ml-2"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* STEPPER NAVIGATION TABS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {STEPS.map((step) => {
                        const isActive = currentStep === step.id;
                        const isDone = currentStep > step.id;

                        return (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(step.id)}
                                className={`flex flex-col text-left p-3 rounded-xl transition-all cursor-pointer relative ${
                                    isActive
                                        ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-500/20'
                                        : isDone
                                        ? 'bg-emerald-50/70 hover:bg-emerald-100/60 text-emerald-900 border border-emerald-200'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                                }`}
                            >
                                <div className="flex items-center justify-between w-full mb-1">
                                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                        isActive
                                            ? 'bg-amber-400 text-emerald-950'
                                            : isDone
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {isDone ? '✓ SELESAI' : `STEP ${step.id}`}
                                    </span>
                                </div>
                                <div className="text-xs font-bold truncate">{step.title}</div>
                                <div className={`text-[10px] truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {step.desc}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* MULTI-STEP FORM WRAPPER */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* STEP 1: DATA DIRI */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-amber-400 font-extrabold flex items-center justify-center text-sm shadow-xs">
                                01
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                    Data Diri Calon Peserta Didik
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Isi identitas pribadi sesuai dokumen Akta Kelahiran, KK, atau KTP
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nama Lengkap Calon Siswa *
                                </label>
                                <input
                                    type="text"
                                    name="namaLengkap"
                                    required
                                    value={formData.namaLengkap}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Muhammad Faiz Nuaim"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Jenis Kelamin *
                                </label>
                                <select
                                    name="jenisKelamin"
                                    value={formData.jenisKelamin}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                >
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Agama *
                                </label>
                                <select
                                    name="agama"
                                    value={formData.agama}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                >
                                    {AGAMA_OPTIONS.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Tempat Lahir *
                                </label>
                                <input
                                    type="text"
                                    name="tempatLahir"
                                    required
                                    value={formData.tempatLahir}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Sekampung / Lampung Timur"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Tanggal Lahir *
                                </label>
                                <input
                                    type="date"
                                    name="tanggalLahir"
                                    required
                                    value={formData.tanggalLahir}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    NISN (10 Digit) *
                                </label>
                                <input
                                    type="text"
                                    name="nisn"
                                    required
                                    maxLength={10}
                                    value={formData.nisn}
                                    onChange={handleInputChange}
                                    placeholder="Nomor Induk Siswa Nasional"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    NIK Siswa (16 Digit) *
                                </label>
                                <input
                                    type="text"
                                    name="nik"
                                    required
                                    maxLength={16}
                                    value={formData.nik}
                                    onChange={handleInputChange}
                                    placeholder="Sesuai Kartu Keluarga / KTP"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Sekolah Asal (SMP / MTs) *
                                </label>
                                <input
                                    type="text"
                                    name="sekolahAsal"
                                    required
                                    value={formData.sekolahAsal}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: SMP Muhammadiyah 1 Sekampung"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    No. Handphone / WhatsApp Siswa *
                                </label>
                                <input
                                    type="tel"
                                    name="noHpWa"
                                    required
                                    value={formData.noHpWa}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: 081234567890"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Alamat Lengkap Tempat Tinggal *
                                </label>
                                <textarea
                                    name="alamat"
                                    rows={2}
                                    required
                                    value={formData.alamat}
                                    onChange={handleInputChange}
                                    placeholder="Dusun/Jalan, RT/RW, Desa/Kelurahan, Kecamatan, Kabupaten"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: DATA FISIK */}
                {currentStep === 2 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-amber-400 font-extrabold flex items-center justify-center text-sm shadow-xs">
                                02
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                    Data Fisik Calon Siswa
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Digunakan untuk pendataan kesehatan dan standar kejuruan teknik
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Berat Badan (kg) *
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="beratBadan"
                                        min={25}
                                        max={160}
                                        value={formData.beratBadan}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 48"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 pr-12"
                                    />
                                    <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400">
                                        KG
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Rentang berat badan normal siswa SMA/SMK (30 - 75 kg)
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Tinggi Badan (cm) *
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="tinggiBadan"
                                        min={110}
                                        max={215}
                                        value={formData.tinggiBadan}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 165"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 pr-12"
                                    />
                                    <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400">
                                        CM
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Rentang tinggi badan (135 - 190 cm)
                                </span>
                            </div>

                            {/* BMI CALCULATOR WIDGET */}
                            {bmiInfo && (
                                <div className="sm:col-span-2 p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Indeks Massa Tubuh (BMI)
                                        </span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-lg font-extrabold text-slate-800">
                                                {bmiInfo.value}
                                            </span>
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${bmiInfo.color}`}>
                                                {bmiInfo.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-slate-400 hidden sm:block">
                                        Kalkulasi otomatis sistem kesehatan sekolah
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: ORANG TUA & WALI */}
                {currentStep === 3 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-amber-400 font-extrabold flex items-center justify-center text-sm shadow-xs">
                                    03
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                        Data Orang Tua Kandung & Wali
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Informasi kontak dan pekerjaan orang tua/wali murid
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Nama Ayah Kandung *
                                    </label>
                                    <input
                                        type="text"
                                        name="namaAyah"
                                        required
                                        value={formData.namaAyah}
                                        onChange={handleInputChange}
                                        placeholder="Nama lengkap ayah"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Pekerjaan Ayah
                                    </label>
                                    <input
                                        type="text"
                                        name="pekerjaanAyah"
                                        value={formData.pekerjaanAyah}
                                        onChange={handleInputChange}
                                        placeholder="Petani / Wiraswasta / PNS / Buruh / dll"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Nama Ibu Kandung *
                                    </label>
                                    <input
                                        type="text"
                                        name="namaIbuKandung"
                                        required
                                        value={formData.namaIbuKandung || formData.namaIbu}
                                        onChange={handleInputChange}
                                        placeholder="Nama lengkap ibu kandung"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Pekerjaan Ibu
                                    </label>
                                    <input
                                        type="text"
                                        name="pekerjaanIbu"
                                        value={formData.pekerjaanIbu}
                                        onChange={handleInputChange}
                                        placeholder="Ibu Rumah Tangga / Guru / Pedagang / dll"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Alamat Orang Tua
                                    </label>
                                    <input
                                        type="text"
                                        name="alamatOrtu"
                                        value={formData.alamatOrtu}
                                        onChange={handleInputChange}
                                        placeholder="Kosongkan jika sama dengan alamat siswa"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        No. Handphone / WhatsApp Orang Tua *
                                    </label>
                                    <input
                                        type="tel"
                                        name="noHpOrtu"
                                        required
                                        value={formData.noHpOrtu}
                                        onChange={handleInputChange}
                                        placeholder="Nomor HP aktif ayah/ibu"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* DATA WALI */}
                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Data Wali Murid (Opsional)
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">
                                Hanya diisi jika calon siswa tinggal bersama wali (bukan orang tua kandung)
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Nama Wali
                                    </label>
                                    <input
                                        type="text"
                                        name="namaWali"
                                        value={formData.namaWali}
                                        onChange={handleInputChange}
                                        placeholder="Nama lengkap wali"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Alamat Wali
                                    </label>
                                    <input
                                        type="text"
                                        name="alamatWali"
                                        value={formData.alamatWali}
                                        onChange={handleInputChange}
                                        placeholder="Alamat tempat tinggal wali"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        No. HP / WhatsApp Wali
                                    </label>
                                    <input
                                        type="tel"
                                        name="noHpWali"
                                        value={formData.noHpWali}
                                        onChange={handleInputChange}
                                        placeholder="08xxxxxxxxxx"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: PILIHAN JURUSAN & UKURAN BAJU */}
                {currentStep === 4 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-amber-400 font-extrabold flex items-center justify-center text-sm shadow-xs">
                                    04
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                        Pilihan Jurusan & Ukuran Seragam
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Pilih 1 dari 8 Program Keahlian unggulan SMK Muhammadiyah Sekampung
                                    </p>
                                </div>
                            </div>

                            {/* JURUSAN SELECTION CARDS */}
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                                Program Keahlian Pilihan (Wajib Pilih 1) *
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                                {JURUSAN_OPTIONS.map((item, idx) => {
                                    const isSelected = formData.jurusan === item;
                                    return (
                                        <label
                                            key={idx}
                                            className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                                                    : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="jurusan"
                                                value={item}
                                                checked={isSelected}
                                                onChange={handleInputChange}
                                                className="mt-1 text-emerald-700 focus:ring-emerald-500 h-4 w-4"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className={`text-sm font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                                                    {item}
                                                </div>
                                                <div className="text-[11px] text-slate-500 mt-0.5">
                                                    Standar kurikulum industri & sertifikasi LSP
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            {/* UKURAN BAJU */}
                            <div className="pt-6 border-t border-slate-200">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Pilihan Ukuran Baju Seragam Sekolah *
                                </label>
                                <p className="text-xs text-slate-500 mb-3">
                                    Disesuaikan dengan berat badan Anda untuk kelayakan seragam praktik dan almamater
                                </p>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                    {UKURAN_BAJU_OPTIONS.map((size) => {
                                        const isSelected = formData.ukuranBaju === size;
                                        return (
                                            <label
                                                key={size}
                                                className={`flex items-center gap-2.5 p-3 rounded-xl border text-center cursor-pointer transition ${
                                                    isSelected
                                                        ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-400/20'
                                                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="ukuranBaju"
                                                    value={size}
                                                    checked={isSelected}
                                                    onChange={handleInputChange}
                                                    className="text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                                                />
                                                <span className="text-xs sm:text-sm">{size}</span>
                                            </label>
                                        );
                                    })}
                                </div>

                                {formData.ukuranBaju === 'Lainnya' && (
                                    <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-300 animate-in fade-in duration-200">
                                        <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1.5">
                                            Tuliskan Ukuran Seragam Khusus *
                                        </label>
                                        <input
                                            type="text"
                                            name="ukuranBajuLainnya"
                                            required
                                            value={formData.ukuranBajuLainnya}
                                            onChange={handleInputChange}
                                            placeholder="Contoh: 5XL / Lingkar Dada 125 cm"
                                            className="w-full px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5: INTRAKURIKULER & EKSTRAKURIKULER */}
                {currentStep === 5 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-amber-400 font-extrabold flex items-center justify-center text-sm shadow-xs">
                                    05
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-slate-800">
                                        Minat Organisasi & Pengembangan Diri
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Wadah pembinaan karakter dan minat bakat di SMK Muhammadiyah Sekampung
                                    </p>
                                </div>
                            </div>

                            {/* INTRAKURIKULER (RADIO) */}
                            <div className="mb-8">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Organisasi Intrakurikuler (Wajib Pilih 1) *
                                </label>
                                <p className="text-xs text-slate-500 mb-3">
                                    Organisasi resmi kesiswaan Muhammadiyah dan kepanduan
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {INTRAKURIKULER_OPTIONS.map((item) => {
                                        const isChecked = formData.intrakurikuler === item;
                                        return (
                                            <label
                                                key={item}
                                                className={`flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition ${
                                                    isChecked
                                                        ? 'bg-emerald-50/90 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                                                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="intrakurikuler"
                                                    value={item}
                                                    checked={isChecked}
                                                    onChange={handleInputChange}
                                                    className="text-emerald-700 focus:ring-emerald-500 h-4 w-4"
                                                />
                                                <span className="text-sm font-semibold">{item}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* EKSTRAKURIKULER (CHECKBOX) */}
                            <div className="pt-6 border-t border-slate-200">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Ekstrakurikuler Pilihan (Bisa Pilih Lebih Dari Satu)
                                </label>
                                <p className="text-xs text-slate-500 mb-3">
                                    Pilih kegiatan seni, olahraga, dan teknologi yang diminati
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {EKSTRAKURIKULER_OPTIONS.map((item) => {
                                        const isChecked = formData.ekstrakurikuler.includes(item);
                                        return (
                                            <label
                                                key={item}
                                                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                                                    isChecked
                                                        ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs'
                                                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleCheckboxChange(item)}
                                                    className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                                                />
                                                <span className="text-xs sm:text-sm">{item}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOTTOM NAVIGATION CONTROLS */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div>
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentStep((prev) => Math.max(1, prev - 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                ← Sebelumnya
                            </button>
                        ) : (
                            <span className="text-xs text-slate-400 italic">Langkah 1 dari 5</span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* SAVE DRAFT BUTTON */}
                        <button
                            type="button"
                            onClick={() => handleSubmit()}
                            disabled={saving}
                            className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition border border-slate-300 disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? 'Menyimpan...' : '💾 Simpan Sementara'}
                        </button>

                        {/* NEXT OR FINAL SUBMIT BUTTON */}
                        {currentStep < 5 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentStep((prev) => Math.min(5, prev + 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <span>Selanjutnya</span>
                                <span>→</span>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 sm:flex-initial px-7 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-emerald-700/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border border-amber-400"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Menyimpan Formulir...</span>
                                    </>
                                ) : (
                                    <span>✓ Simpan & Selesaikan Formulir</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
