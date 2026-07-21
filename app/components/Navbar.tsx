"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Geist } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import logoImg from "../../assets/design/logo.png";

const geistSans = Geist({ subsets: ["latin"] });

export default function Navbar({ dict }: { dict: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLang = pathname.split("/")[1] || "pt";

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track active scrolling vs inactivity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolling(true);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Return to center & show elements after 750ms of scroll inactivity
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 750);
      } else {
        setIsScrolling(false);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const changeLang = (lang: string) => {
    const newPath = pathname.replace(`/${currentLang}`, `/${lang}`);
    router.push(newPath);
  };

  const navLinks = [
    { name: dict?.nav?.product || "Produto", href: "#product" },
    { name: dict?.nav?.methodology || "Metodologia", href: "#methodology" },
    { name: dict?.nav?.company || "Empresa", href: "#company" },
    { name: dict?.nav?.resources || "Recursos", href: "#resources" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 py-5 px-6 lg:px-14 transition-all duration-500 ${geistSans.className} pointer-events-none`}
    >
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center relative min-h-[48px]">
        
        {/* LEFT NAV LINKS (Enclosed in a soft glassmorphic pill background) */}
        <motion.nav 
          animate={{
            opacity: isScrolling ? 0 : 1,
            x: isScrolling ? 60 : 0,
            scale: isScrolling ? 0.9 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ pointerEvents: isScrolling ? "none" : "auto" }}
          className="hidden md:flex items-center gap-1 flex-1"
        >
          <div className="flex items-center gap-1 p-1 bg-[#09070f]/60 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            {navLinks.map((link, idx) => (
              <Link
                key={link.name}
                href={link.href}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative px-4 py-2 text-xs lg:text-sm font-medium tracking-wide text-white/75 hover:text-white transition-colors duration-200 rounded-full whitespace-nowrap"
              >
                {hoveredIndex === idx && (
                  <motion.div
                    layoutId="hoverNavPill"
                    className="absolute inset-0 bg-white/15 rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            ))}
          </div>
        </motion.nav>

        {/* CENTER / LEFT LOGO (Glides smoothly to left edge when scrolling, returns to center on inactivity) */}
        <div className="flex-shrink-0 flex items-center justify-center pointer-events-auto">
          <Link href={`/${currentLang}`}>
            <motion.div 
              animate={{
                x: isScrolling ? "-36vw" : 0,
                scale: isScrolling ? 1.05 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 26,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-11 h-11 bg-white/95 backdrop-blur-md rounded-full border border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.25)] flex items-center justify-center p-1.5 cursor-pointer overflow-hidden group"
            >
              {/* Authentic black H logo with adaptive contrast background */}
              <Image 
                src={logoImg} 
                alt="Hermione Logo" 
                width={44} 
                height={44} 
                className="w-full h-full object-contain"
                priority
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          </Link>
        </div>

        {/* RIGHT ACTIONS (Language selector + Login enclosed in matching soft glassmorphic pill background) */}
        <motion.nav 
          animate={{
            opacity: isScrolling ? 0 : 1,
            x: isScrolling ? -60 : 0,
            scale: isScrolling ? 0.9 : 1,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ pointerEvents: isScrolling ? "none" : "auto" }}
          className="hidden md:flex items-center justify-end gap-3 flex-1"
        >
          <div className="flex items-center gap-2 p-1 pl-3.5 pr-1.5 bg-[#09070f]/60 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            {/* Language Selector */}
            <div className="flex items-center gap-1 text-xs text-white/40 font-medium">
              <span
                onClick={() => changeLang("pt")}
                className={`cursor-pointer transition-colors px-1.5 py-0.5 rounded ${
                  currentLang === "pt" ? "text-white font-bold bg-white/15" : "hover:text-white"
                }`}
              >
                PT
              </span>
              <span>•</span>
              <span
                onClick={() => changeLang("en")}
                className={`cursor-pointer transition-colors px-1.5 py-0.5 rounded ${
                  currentLang === "en" ? "text-white font-bold bg-white/15" : "hover:text-white"
                }`}
              >
                EN
              </span>
              <span>•</span>
              <span
                onClick={() => changeLang("es")}
                className={`cursor-pointer transition-colors px-1.5 py-0.5 rounded ${
                  currentLang === "es" ? "text-white font-bold bg-white/15" : "hover:text-white"
                }`}
              >
                ES
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="h-4 w-[1px] bg-white/20 mx-0.5" />

            {/* Login Link */}
            <Link
              href={`/${currentLang}/login`}
              className="px-3 py-1.5 text-xs lg:text-sm font-medium text-white/75 hover:text-white transition-colors whitespace-nowrap"
            >
              {dict?.nav?.signIn || "Entrar"}
            </Link>
          </div>

          {/* CTA BUTTON */}
          <Link href={`/${currentLang}/register`} className="flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative px-5 py-2.5 bg-white text-black font-semibold text-xs lg:text-sm rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-gray-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-300 whitespace-nowrap group overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">{dict?.nav?.start || "Começar Grátis"}</span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </Link>
        </motion.nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white/80 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 bg-[#030303]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4 text-center md:hidden shadow-2xl pointer-events-auto"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/80 hover:text-white text-base py-1"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-white/10 my-1" />
            <div className="flex justify-center gap-4 text-sm text-white/60">
              <span onClick={() => changeLang("pt")} className={currentLang === "pt" ? "text-white font-bold" : ""}>PT</span>
              <span>•</span>
              <span onClick={() => changeLang("en")} className={currentLang === "en" ? "text-white font-bold" : ""}>EN</span>
              <span>•</span>
              <span onClick={() => changeLang("es")} className={currentLang === "es" ? "text-white font-bold" : ""}>ES</span>
            </div>
            <Link href={`/${currentLang}/login`} onClick={() => setMobileMenuOpen(false)} className="text-white/80 text-base py-1">
              {dict?.nav?.signIn || "Entrar"}
            </Link>
            <Link href={`/${currentLang}/register`} onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full py-3 bg-white text-black font-semibold rounded-full text-base">
                {dict?.nav?.start || "Começar Grátis"}
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
