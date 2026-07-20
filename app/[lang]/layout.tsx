import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hermione GPT",
  description: "A premium writing environment",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster 
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141A22',
              color: '#F5F5F5',
              borderColor: 'rgba(255, 255, 255, 0.05)',
              fontFamily: 'var(--font-geist-sans)'
            },
            classNames: {
              toast: 'border border-white/5 rounded-2xl shadow-xl',
              title: 'text-[14px] font-medium',
              description: 'text-[12px] text-[#8A94A0]',
              error: 'bg-[#141A22] border-red-500/30 text-red-400',
              success: 'bg-[#141A22] border-[#B899FF]/30 text-[#B899FF]',
            }
          }}
        />
      </body>
    </html>
  );
}
