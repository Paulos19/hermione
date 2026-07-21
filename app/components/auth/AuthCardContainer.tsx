"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import loginBg from "@/assets/design/login.png";

interface AuthCardContainerProps {
  children: React.ReactNode;
  currentLang?: string;
}

const QUOTES = [
  {
    title: "Escrevendo Obras, Imortalizando Histórias",
    subtitle: "Sua imaginação sem limites no editor mais inteligente do mundo.",
  },
  {
    title: "Captura de Ideias em Tempo Real",
    subtitle: "Sincronização instantânea e colaboração com latência zero.",
  },
  {
    title: "O Ecossistema Definitivo para Autores",
    subtitle: "Organize tramas, personagens e capítulos com facilidade.",
  },
];

export default function AuthCardContainer({ children, currentLang = "pt" }: AuthCardContainerProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-screen h-screen min-h-screen bg-[#2D283E] p-3 sm:p-5 md:p-8 flex items-center justify-center font-sans overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Dual-Column Container Card - Full Height & Width matching Template Image 2 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[1280px] h-full max-h-[860px] min-h-[600px] bg-[#1C1827] border border-white/10 rounded-[28px] md:rounded-[36px] p-3 md:p-4 shadow-[0_32px_96px_rgba(0,0,0,0.7)] backdrop-blur-2xl grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-stretch relative z-10 my-auto"
      >
        {/* LEFT COLUMN: Inner Card with login.png Image & Micro-Borders */}
        <div className="md:col-span-5 lg:col-span-5 relative rounded-[22px] md:rounded-[28px] overflow-hidden min-h-[300px] md:h-full flex flex-col justify-between p-6 md:p-8 border border-white/10 shadow-2xl group">
          {/* Background Image */}
          <Image
            src={loginBg}
            alt="Hermione Creative Background"
            fill
            priority
            className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
          />

          {/* Dark Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/85 z-0" />

          {/* Top Bar inside Left Card */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href={`/${currentLang}`} className="flex items-center gap-2">
              <span className="text-lg md:text-xl font-bold tracking-widest text-white uppercase font-serif">
                HERMIONE
              </span>
            </Link>

            <Link
              href={`/${currentLang}`}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium text-white flex items-center gap-1.5 transition-all"
            >
              <span>Voltar ao site</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bottom Quote Carousel Overlay */}
          <div className="relative z-10 max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="space-y-1.5"
              >
                <h3 className="text-xl md:text-2xl lg:text-3xl font-light text-white leading-tight font-serif">
                  {QUOTES[quoteIndex].title}
                </h3>
                <p className="text-xs md:text-sm text-white/70 font-light leading-relaxed">
                  {QUOTES[quoteIndex].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Slide Indicators */}
            <div className="flex items-center gap-2 mt-5">
              {QUOTES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuoteIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === quoteIndex ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Auth Form Area */}
        <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-4 md:py-6 max-w-xl mx-auto w-full h-full overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
