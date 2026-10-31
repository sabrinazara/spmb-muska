import type { Metadata } from "next";
import { Poppins, Dancing_Script } from "next/font/google";
import "./globals.css";
import DynamicFavicon from "@/components/DynamicFavicon";
import { API_ENDPOINTS } from "@/lib/api";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let logoUrl = '/logo.png';
  try {
    const res = await fetch(API_ENDPOINTS.WEBSITE.PUBLIC_DATA, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.profil?.logoUrl) {
        logoUrl = data.profil.logoUrl.startsWith('/uploads/')
          ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${data.profil.logoUrl}`
          : data.profil.logoUrl;
      }
    }
  } catch {
    // fallback ke default
  }

  return {
    title: "CMS Panel - SMK Muhammadiyah Sekampung",
    description: "Panel Pengelolaan dan Verifikasi Berkas Calon Siswa Baru",
    icons: {
      icon: [
        { url: logoUrl },
      ],
      shortcut: logoUrl,
      apple: logoUrl,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${poppins.variable} ${dancingScript.variable} font-sans h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('cms_theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
