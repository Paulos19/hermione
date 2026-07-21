"use client";

import Link from "next/link";
import { Geist } from "next/font/google";
import { useParams, useRouter, usePathname } from "next/navigation";

const geistSans = Geist({ subsets: ["latin"] });

export default function Navbar({ dict }: { dict: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLang = pathname.split('/')[1] || 'pt';

  const changeLang = (lang: string) => {
    const newPath = pathname.replace(`/${currentLang}`, `/${lang}`);
    router.push(newPath);
  };

  return (
    <header className={`fixed top-0 left-0 w-full px-6 lg:px-12 py-6 flex justify-between items-center z-50 mix-blend-difference ${geistSans.className}`}>
      {/* Left Links */}
      <nav className="flex-1 hidden md:flex items-center gap-8">
        <Link href="#" className="text-white/70 hover:text-white transition-colors text-[13px] font-medium tracking-wide">
          {dict.nav.product}
        </Link>
        <Link href="#" className="text-white/70 hover:text-white transition-colors text-[13px] font-medium tracking-wide">
          {dict.nav.methodology}
        </Link>
        <Link href="#" className="text-white/70 hover:text-white transition-colors text-[13px] font-medium tracking-wide">
          {dict.nav.company}
        </Link>
      </nav>

      {/* Center Logo - Conceptual H / Editor Node */}
      <div className="flex-shrink-0 flex justify-center items-center relative w-10 h-10 group cursor-pointer">
        <svg viewBox="0 0 40 40" className="w-8 h-8 text-white transition-transform duration-500 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M28 8V32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Middle connection morphing from a line to an abstract data node */}
          <path d="M12 20H28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="transition-all duration-300 group-hover:stroke-[4px]"/>
          {/* Decorative nodes */}
          <circle cx="12" cy="8" r="2.5" fill="currentColor" className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"/>
          <circle cx="28" cy="32" r="2.5" fill="currentColor" className="opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0"/>
        </svg>
      </div>

      {/* Right Links & CTA */}
      <nav className="flex-1 hidden md:flex items-center justify-end gap-6">
        <div className="flex items-center gap-2 mr-4">
          <span onClick={() => changeLang('pt')} className={`${currentLang === 'pt' ? 'text-white' : 'text-white/40'} text-[11px] font-medium hover:text-white cursor-pointer transition-colors`}>PT</span>
          <span className="text-white/20 text-[11px]">|</span>
          <span onClick={() => changeLang('en')} className={`${currentLang === 'en' ? 'text-white' : 'text-white/40'} text-[11px] font-medium hover:text-white cursor-pointer transition-colors`}>EN</span>
          <span className="text-white/20 text-[11px]">|</span>
          <span onClick={() => changeLang('es')} className={`${currentLang === 'es' ? 'text-white' : 'text-white/40'} text-[11px] font-medium hover:text-white cursor-pointer transition-colors`}>ES</span>
        </div>
        <Link href="/login" className="text-white/70 hover:text-white transition-colors text-[13px] font-medium tracking-wide">
          {dict.nav.signIn}
        </Link>
        <Link href="/cadastro" className="text-white text-[13px] font-medium tracking-wide flex items-center gap-1 group">
          <span>{dict.nav.start}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </nav>
    </header>
  );
}
