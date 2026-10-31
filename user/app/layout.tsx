import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import DynamicFavicon from "@/components/DynamicFavicon";
import { API_ENDPOINTS } from "@/lib/api";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  let logoUrl = '/logo.png';
  try {
    const res = await fetch(API_ENDPOINTS.LANDING_PAGE, {
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
    title: "SMK Muhammadiyah Sekampung",
    description: "Sistem Informasi Penerimaan Peserta Didik Baru (PPDB) SMK Muhammadiyah Sekampung Berbasis AI RAG dan OCR",
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
    <html lang="id" suppressHydrationWarning className={`${poppins.variable} font-sans antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('user_theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
