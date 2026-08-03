"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { name: "Editor", href: "#overview" },
  { name: "Ecossistema", href: "#ecosystem" },
  { name: "Preços", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
  { name: "Métricas", href: "#metrics" },
];

const SOCIAL_LINKS = [
  { name: "Twitter", href: "https://twitter.com" },
  { name: "Instagram", href: "https://instagram.com" },
  { name: "GitHub", href: "https://github.com" },
  { name: "Discord", href: "https://discord.com" },
];

export default function FooterSection({ dict }: { dict?: any }) {
  const params = useParams();
  const currentLang = (params?.lang as string) || "pt";
  const footerDict = dict?.footer;

  return (
    <footer className="relative bg-[#030303] overflow-hidden">

      {/* CTA Section with Spotlight */}
      <div className="relative py-32 md:py-48 flex items-center justify-center">
        {/* Spotlight effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[800px] bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent blur-[2px] transform -rotate-12 opacity-60" />
        </div>

        {/* Light ray */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[40%] bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

        <div className="relative z-10 text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] leading-[0.9] font-bold text-white/90 uppercase tracking-tight mb-10"
          >
            {footerDict?.ctaTitle || "VAMOS ESCREVER\nJUNTOS"}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Link href={`/${currentLang}/register`}>
              <button className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white/80 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/40 transition-all duration-300">
                <span>{footerDict?.freeAccountButton || "Começar Agora"}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="h-[1px] bg-white/[0.06]" />
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

          {/* Left - Logo & Tagline */}
          <div className="md:col-span-5">
            <Link href={`/${currentLang}`} className="inline-block mb-6">
              <span className="text-[18px] font-bold tracking-[0.2em] text-white uppercase">
                HERMIONE
              </span>
            </Link>
            <p className="text-[13px] text-white/30 leading-relaxed max-w-[280px] mb-8">
              {footerDict?.ctaSubtitle || "Seus textos merecem mais que um editor. transforme suas ideias em obras-primas com o poder da IA."}
            </p>
            <p className="text-[11px] text-white/20">
              Criado com <span className="text-[#E84855]">♥</span> por{" "}
              <a
                href="https://github.com/Paulos19"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition-colors"
              >
                Paulo Henrique
              </a>
            </p>
          </div>

          {/* Middle - Navigation */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase mb-6">
              Navegação
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-white/40 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Socials */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase mb-6">
              Social
            </h4>
            <ul className="space-y-3">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-white/40 hover:text-white transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Extra - Legal */}
          <div className="md:col-span-1" />
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/20">
            © {new Date().getFullYear()} Hermione. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href={`/${currentLang}/terms`} className="text-[11px] text-white/20 hover:text-white/40 transition-colors">
              Termos
            </Link>
            <Link href={`/${currentLang}/privacy`} className="text-[11px] text-white/20 hover:text-white/40 transition-colors">
              Privacidade
            </Link>
            <div className="flex items-center gap-2">
              {["PT", "EN", "ES"].map((lang) => (
                <Link
                  key={lang}
                  href={`/${lang.toLowerCase()}`}
                  className={`text-[10px] font-bold tracking-wider transition-colors ${
                    currentLang === lang.toLowerCase()
                      ? "text-white"
                      : "text-white/20 hover:text-white/40"
                  }`}
                >
                  {lang}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
