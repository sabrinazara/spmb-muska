'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { MapPin, Mail, Phone, MessageCircle } from 'lucide-react';

interface LandingFooterProps {
  profil?: any;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function LandingFooter({ profil = {} }: LandingFooterProps) {
  const logoSrc = profil?.logoUrl
    ? (profil.logoUrl.startsWith('/uploads/')
      ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + profil.logoUrl
      : profil.logoUrl)
    : '/logo.png';

  const waRaw = profil?.whatsappResmi || profil?.teleponResmi || '081377653555';
  const waClean = waRaw.replace(/\D/g, '').replace(/^0/, '62');
  const waLink = `https://wa.me/${waClean}`;

  return (
    <motion.footer
      id="kontak"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUp}
      className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-6 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Semboyan */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <img
                  src={logoSrc}
                  alt="Logo SMK Muhammadiyah Sekampung"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = '/logo.svg';
                  }}
                />
              </div>
              <span className="font-bold text-sm text-white uppercase tracking-wider">
                SMK MUHAMMADIYAH SEKAMPUNG
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sekolah Menengah Kejuruan Pusat Keunggulan di Kabupaten Lampung Timur yang berkarakter Islami, kompeten, dan siap kerja.
            </p>
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-300 font-bold">
              {profil?.motto || 'Sukses · Jaya · Bermanfaat · Inspiratif'}
            </div>
          </div>

          {/* Col 2: Tautan Cepat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">
              Tautan Pintasan
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/register" className="hover:text-emerald-400 transition-colors">
                  Pendaftaran SPMB Online
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Login Akun Siswa
                </Link>
              </li>
              <li>
                <Link href="/berita" className="hover:text-emerald-400 transition-colors">
                  Kabar & Berita Sekolah
                </Link>
              </li>
              <li>
                <Link href="/#jurusan" className="hover:text-emerald-400 transition-colors">
                  Daftar 8 Program Keahlian
                </Link>
              </li>
              <li>
                <Link href="/#sambutan" className="hover:text-emerald-400 transition-colors">
                  Profil Pimpinan Sekolah
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Kontak Resmi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">
              Kontak Sekretariat
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  {profil?.alamatLengkap ||
                    'JL. RAYA SEKAMPUNG, Kec. Sekampung, Kab. Lampung Timur, Prov. Lampung.'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{profil?.emailResmi || 'smkmuhsekampung@gmail.com'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{profil?.whatsappResmi || profil?.teleponResmi || '081377653555'}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Google Maps Embed */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">
              Peta Lokasi
            </h4>
            <div className="w-full h-40 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md">
              <iframe
                src={
                  profil?.mapsEmbedUrl ||
                  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15888.436151740685!2d105.4314!3d-5.1973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMTEnNTAuMyJTIDEwNcKwMjYnMjkuMCJF!5e0!3m2!1sid!2sid!4v1600000000000!5m2!1sid!2sid'
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                title="Peta Lokasi SMK Muhammadiyah Sekampung"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: COPYRIGHT & WHATSAPP (Sesuai Screenshot 2) */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 SMK Muhammadiyah Sekampung. Seluruh hak cipta dilindungi.</p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Hubungi kami via WhatsApp</span>
          </a>
        </div>

        {/* WATERMARK TYPOGRAPHY: MUSKA HEBAT. */}
        <div className="pt-6 sm:pt-10 pb-4 w-full flex items-center overflow-hidden select-none pointer-events-none relative">

          {/* Definisi keyframes untuk animasi berjalan (marquee) */}
          <style>
            {`
      @keyframes marquee {
        0% { transform: translateX(100vw); }
        100% { transform: translateX(-100%); }
      }
      .animate-marquee {
        display: inline-block;
        animation: marquee 15s linear infinite;
      }
    `}
          </style>

          {/* Teks: Font Poppins, animasi marquee, dan efek blur di bawah (drop-shadow) */}
          <div className="font-['Poppins'] font-black uppercase text-[15vw] leading-none text-slate-800/10 dark:text-slate-200/10 whitespace-nowrap animate-marquee drop-shadow-[0_8px_8px_rgba(0,0,0,0.08)]">
            SMK MUSKA HEBAT.
          </div>

        </div>
      </div>
    </motion.footer>
  );
}
