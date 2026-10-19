'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { MapPin, Mail, Phone } from 'lucide-react';

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
  return (
    <motion.footer
      id="kontak"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUp}
      className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Semboyan */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 p-1 flex items-center justify-center shrink-0 shadow-md">
                <img
                  src="/logo.png"
                  alt="Logo SMK Muhammadiyah Sekampung"
                  className="w-full h-full object-contain"
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
              Moto: {profil?.motto || 'Sukses · Jaya · Bermanfaat · Inspiratif'}
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
              <li>
                <a
                  href="http://localhost:3002"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  CMS Dashboard Administrator
                </a>
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
                <span>{profil?.teleponResmi || '081377653555'}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Google Maps Embed */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">
              Peta Lokasi Kampus
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

        <div className="pt-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
          © 2026 SMK Muhammadiyah Sekampung. Seluruh Hak Cipta Dilindungi Undang-Undang.
        </div>
      </div>
    </motion.footer>
  );
}
