"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import TypingHeadline from "./TypingHeadline";

interface ActiveWriter {
  id: string;
  name: string;
  image: string | null;
}

const AVATAR_COLORS = ["#6DAAFF", "#FF8A6D", "#27C93F", "#B899FF", "#FFD36E"];

// Dynamic import for Three.js component (client-only)
const ParticleOrbCanvas = dynamic(
  () => import("./three/ParticleOrbCanvas"),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#030303]" /> }
);

export default function HeroSection({ dict }: { dict: any }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeWriters, setActiveWriters] = useState<ActiveWriter[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 6;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);

  useEffect(() => {
    fetch("/api/metrics")
      .then(r => r.json())
      .then(data => {
        if (data.recentActiveWriters) {
          setActiveWriters(data.recentActiveWriters);
        }
        if (data.activeWriters !== undefined) {
          setActiveCount(data.activeWriters);
        }
      })
      .catch(() => { });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="overview"
      className="relative w-full h-[100vh] bg-[#030303] overflow-hidden"
    >
      {/* Top Left - Brand */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="absolute top-8 left-8 md:top-12 md:left-12 z-30"
      >
        <span className="text-[10px] md:text-[11px] font-bold tracking-[0.3em] text-white/50 uppercase">

        </span>
      </motion.div>

      {/* Top Right - Share & Grid */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="absolute top-8 right-8 md:top-12 md:right-12 z-30 flex items-center gap-6"
      >
        <button className="flex items-center gap-2 text-[10px] md:text-[11px] font-medium tracking-[0.2em] text-white/50 hover:text-white transition-colors">
        </button>
        <button className="text-white/40 hover:text-white transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
      </motion.div>

      {/* Main 50/50 Layout */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row">

        {/* LEFT HALF - Text Content */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative w-full lg:w-1/2 h-full flex flex-col justify-center px-8 md:px-12 lg:px-16 xl:px-24 z-20"
        >
          {/* Category Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <p className="text-[12px] md:text-[13px] text-white/40 leading-[1.8] max-w-[320px] font-light mb-8">
              {dict?.heroSubtitle}
            </p>
          </motion.div>

          {/* Main Title */}
          <div className="mb-8">
            <h1 className="text-[56px] sm:text-[72px] md:text-[80px] lg:text-[96px] xl:text-[120px] leading-[0.9] font-bold text-white/90 tracking-[-0.03em] uppercase">
              {dict?.heroTitle || "HERMIONE"}
            </h1>
          </div>

          {/* Typing Headline */}
          <div className="mb-12">
            <TypingHeadline
              phrases={dict?.typingPhrases || ["escrita mágica.", "pesquisa mítica.", "visão criativa."]}
              className="text-[14px] md:text-[16px] text-white/30 font-light tracking-[0.05em]"
            />
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap items-center gap-4 mb-12"
          >
            <Link href="#ecosystem">
              <button className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white/80 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/40 transition-all duration-300">
                <span>{dict?.heroExplore || "EXPLORAR"}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>

            <button className="group inline-flex items-center gap-3 px-8 py-4 bg-white/[0.04] text-white/60 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/[0.08] transition-all duration-300">
              <span>{dict?.heroNext || "Começar agora"}</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {activeWriters.slice(0, 3).map((writer, i) => (
                writer.image ? (
                  <img
                    key={writer.id}
                    src={writer.image}
                    alt={writer.name}
                    title={writer.name}
                    className="w-7 h-7 rounded-full border-2 border-[#030303] object-cover"
                  />
                ) : (
                  <div
                    key={writer.id}
                    title={writer.name}
                    className="w-7 h-7 rounded-full border-2 border-[#030303] flex items-center justify-center text-[8px] font-bold text-white"
                    style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {(writer.name || "A")[0].toUpperCase()}
                  </div>
                )
              ))}
            </div>
            <span className="text-[10px] text-white/30">
              {activeCount > 0
                ? `+${activeCount} ${dict?.heroSocialProof || "escritores ativos"}`
                : dict?.heroSocialProofIdle || "Escritores colaborando"
              }
            </span>
          </motion.div>
        </motion.div>

        {/* RIGHT HALF - Particle Orb */}
        <motion.div
          style={{ scale: orbScale, opacity: orbOpacity }}
          className="relative w-full lg:w-1/2 h-[50vh] lg:h-full z-10"
        >
          <ParticleOrbCanvas className="w-full h-full" />

          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-transparent pointer-events-none lg:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030303] pointer-events-none" />
        </motion.div>

      </div>

      {/* Bottom Navigation Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-8 left-0 right-0 px-8 md:px-16 z-30"
      >
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] md:text-[12px] font-mono text-white/30">
            <span className="text-white/60">{String(currentSlide).padStart(3, '0')}</span>
            <span>/</span>
            <span>{String(totalSlides).padStart(3, '0')}</span>
          </div>

          <button
            onClick={() => setCurrentSlide(prev => prev < totalSlides ? prev + 1 : 1)}
            className="group flex items-center gap-4 text-[11px] md:text-[12px] font-medium tracking-[0.2em] text-white/50 hover:text-white transition-colors uppercase"
          >
            <span className="text-white/30">NEXT</span>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Decorative Elements - Number indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute top-1/2 right-8 md:right-16 -translate-y-1/2 z-20 hidden lg:flex flex-col items-center gap-3"
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setCurrentSlide(num)}
            className={`w-6 h-6 flex items-center justify-center text-[9px] font-mono transition-colors ${currentSlide === num ? 'text-white' : 'text-white/20 hover:text-white/50'
              }`}
          >
            {String(num).padStart(2, '0')}
          </button>
        ))}
      </motion.div>

    </section>
  );
}
