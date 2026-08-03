"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Geist } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import logoImg from "../../assets/design/logobranco.png";

const geistSans = Geist({ subsets: ["latin"] });

export default function Navbar({ dict }: { dict: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLang = pathname.split("/")[1] || "pt";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLang = (lang: string) => {
    const newPath = pathname.replace(`/${currentLang}`, `/${lang}`);
    router.push(newPath);
  };

  const navLinks = [
    { name: dict?.nav?.overview || "VISÃO GERAL", href: "#overview" },
    { name: dict?.nav?.ecosystem || "ECOSSISTEMA", href: "#ecosystem" },
    { name: dict?.nav?.pricing || "PREÇOS", href: "#pricing" },
    { name: dict?.nav?.telemetry || "TELEMETRIA", href: "#metrics" },
  ];

  return (
    <header 
      className={`absolute top-0 left-0 w-full z-50 py-6 px-6 lg:px-14 transition-all duration-300 ${geistSans.className} bg-transparent`}
    >
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center relative">
        
        {/* LEFT LOGO & TEXT */}
        <div className="flex-shrink-0 flex items-center gap-4">
          <Link href={`/${currentLang}`} className="flex items-center gap-4 group">
            {/* White Circle Logo as in the reference */}
            <div className="w-8 h-8 md:w-9 md:h-9 bg-white rounded-full flex items-center justify-center p-1.5 overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105">
              <Image 
                src={logoImg} 
                alt="Hermione Logo" 
                width={32} 
                height={32} 
                className="w-full h-full object-contain filter invert"
                priority
              />
            </div>
            <span className="text-[10px] md:text-[11px] font-semibold tracking-[0.25em] text-white/70 group-hover:text-white transition-colors duration-300 uppercase">
              Hermione
            </span>
          </Link>
        </div>

        {/* CENTER NAV LINKS */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-14">
          {navLinks.map((link, index) => (
            <div key={link.name} className="flex items-center gap-8 lg:gap-14">
              <Link
                href={link.href}
                className="text-[9px] lg:text-[10px] font-bold tracking-[0.25em] text-white/60 hover:text-white transition-colors duration-300"
              >
                {link.name}
              </Link>
              {/* Separator similar to reference */}
              {index < navLinks.length - 1 && (
                <span className="text-white/20 text-[10px]">/</span>
              )}
            </div>
          ))}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="hidden md:flex items-center gap-6">
          {/* Language Selector */}
          <div className="flex items-center gap-3 text-[9px] font-bold tracking-[0.2em] text-white/40">
            <span
              onClick={() => changeLang("pt")}
              className={`cursor-pointer transition-colors hover:text-white ${
                currentLang === "pt" ? "text-white" : ""
              }`}
            >
              PT
            </span>
            <span
              onClick={() => changeLang("en")}
              className={`cursor-pointer transition-colors hover:text-white ${
                currentLang === "en" ? "text-white" : ""
              }`}
            >
              EN
            </span>
            <span
              onClick={() => changeLang("es")}
              className={`cursor-pointer transition-colors hover:text-white ${
                currentLang === "es" ? "text-white" : ""
              }`}
            >
              ES
            </span>
          </div>

          <div className="w-[1px] h-3 bg-white/20" />

          {/* Login Link as minimal text + arrow */}
          <Link
            href={`/${currentLang}/login`}
            className="flex items-center gap-1 text-[9px] font-bold tracking-[0.2em] text-white/60 hover:text-white transition-colors duration-300 uppercase"
          >
            <span>Login</span>
            <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-5">
          <Link href={`/${currentLang}/login`} className="text-white/60 hover:text-white transition-colors duration-300">
             <ArrowUpRight className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white/60 hover:text-white focus:outline-none transition-colors duration-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 overflow-hidden md:hidden shadow-2xl"
          >
            <div className="p-8 flex flex-col gap-6 text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[11px] font-semibold tracking-[0.2em] text-white/60 hover:text-white py-2 transition-colors duration-300 uppercase"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/5 mx-10 my-2" />
              <div className="flex justify-center gap-8 text-[10px] font-semibold tracking-widest text-white/40">
                <span onClick={() => { changeLang("pt"); setMobileMenuOpen(false); }} className={`cursor-pointer ${currentLang === "pt" ? "text-white" : "hover:text-white/80"}`}>PT</span>
                <span onClick={() => { changeLang("en"); setMobileMenuOpen(false); }} className={`cursor-pointer ${currentLang === "en" ? "text-white" : "hover:text-white/80"}`}>EN</span>
                <span onClick={() => { changeLang("es"); setMobileMenuOpen(false); }} className={`cursor-pointer ${currentLang === "es" ? "text-white" : "hover:text-white/80"}`}>ES</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
