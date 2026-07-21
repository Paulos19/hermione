"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cormorant_Garamond, Geist } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import homemImg from "../../assets/design/homem.png";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

interface SideCopyProps {
  typewriterText: string;
  morphWords: string[];
  className?: string;
  delay?: number;
}

function SideTypingMorphingCopy({ typewriterText, morphWords, className = "", delay = 0 }: SideCopyProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % morphWords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [morphWords.length]);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            delay,
            staggerChildren: 0.04,
            delayChildren: delay + 0.2,
          },
        },
      }}
      className={`flex flex-col gap-1 z-30 max-w-[260px] md:max-w-[300px] ${className}`}
    >
      {/* Decorative top line */}
      <div className="h-[1px] w-10 bg-gradient-to-r from-white/40 to-transparent mb-1" />

      {/* Typing Label */}
      <div className={`${geist.className} text-xs md:text-sm text-white/50 tracking-[0.25em] uppercase font-medium flex flex-wrap`}>
        {typewriterText.split("").map((char, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>

      {/* Morphing Word */}
      <div className="relative h-9 flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={morphWords[index]}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`${cormorant.className} text-xl md:text-2xl lg:text-3xl text-white font-normal italic tracking-wide`}
          >
            {morphWords[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function MainTitleTypewriter() {
  const fullText = "Toda grande obra começa com uma única palavra.";
  const pivot = "Toda grande obra começa com uma ".length;
  const [displayedText, setDisplayedText] = useState("");
  const [startTyping, setStartTyping] = useState(false);

  useEffect(() => {
    if (!startTyping) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setDisplayedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [startTyping, fullText]);

  const part1 = displayedText.slice(0, pivot);
  const part2 = displayedText.length > pivot ? displayedText.slice(pivot) : "";

  return (
    <motion.h2 
      onViewportEnter={() => setStartTyping(true)}
      viewport={{ once: true, margin: "-100px" }}
      className={`${cormorant.className} text-3xl md:text-5xl lg:text-6xl text-white/90 font-light leading-tight tracking-wide min-h-[3.5rem] md:min-h-[4.5rem] flex items-center justify-center flex-wrap`}
    >
      <span>{part1}</span>
      {part2 && <span className="italic text-white/60">{part2}</span>}
      <span className="inline-block w-[3px] md:w-[4px] h-[0.85em] bg-white/90 ml-1.5 align-middle animate-pulse" />
    </motion.h2>
  );
}

export default function CtaFinalSection({ dict }: { dict?: any }) {
  const ctaDict = dict?.ctaFinal;
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Mouse tracking for interactive background
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative w-full min-h-screen bg-[#030303] overflow-hidden flex flex-col items-center justify-between pt-16 pb-0"
    >
      {/* Interactive Flashlight Background */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500"
        animate={{ opacity: isHovering ? 1 : 0 }}
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.04), transparent 40%)`,
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none" />

      {/* Top Main CTA Copy */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
        <MainTitleTypewriter />

        {/* Call to action button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6"
        >
          <Link href="/register">
            <button className="relative px-8 py-3.5 bg-white/5 border border-white/10 rounded-full text-white/90 font-medium tracking-wide hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm overflow-hidden group">
              <span className="relative z-10 flex items-center gap-2 text-sm md:text-base">
                Comece a Escrever
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </span>
              <div className="absolute inset-0 h-full w-0 bg-white/5 transition-[width] duration-300 ease-out group-hover:w-full z-0" />
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Main Composition: Center Person + 2 Side Copies on Left + 2 Side Copies on Right */}
      <div className="relative w-full max-w-7xl mx-auto h-[550px] md:h-[620px] flex justify-center items-end mt-4">
        
        {/* Soft background glow */}
        <div className="absolute bottom-0 w-1/2 h-1/2 bg-white/5 rounded-full blur-[100px] pointer-events-none z-0" />

        {/* Decorative subtle crossing lines */}
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute top-[35%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transform -rotate-1 z-10 pointer-events-none" 
        />
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
          className="absolute top-[65%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent transform rotate-1 z-10 pointer-events-none" 
        />

        {/* Person Image (Centered at Bottom) */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-20 pointer-events-none flex justify-center items-end h-full"
        >
          <Image 
            src={homemImg} 
            alt="Escritor focado"
            width={800}
            height={800}
            priority
            className="max-h-[420px] md:max-h-[530px] w-auto object-contain object-bottom drop-shadow-[0_0_60px_rgba(255,255,255,0.06)]"
          />
        </motion.div>

        {/* LEFT SIDE: 2 Copies with Typing & Morphing */}
        <SideTypingMorphingCopy
          typewriterText={ctaDict?.sideCopies?.leftTop?.label || "DÊ VIDA À"}
          morphWords={ctaDict?.sideCopies?.leftTop?.words || ["Sua História.", "Sua Visão.", "Seu Legado.", "Sua Arte."]}
          className="absolute top-[12%] left-[4%] md:left-[8%]"
          delay={0.3}
        />
        <SideTypingMorphingCopy
          typewriterText={ctaDict?.sideCopies?.leftBottom?.label || "ESCREVA COM"}
          morphWords={ctaDict?.sideCopies?.leftBottom?.words || ["Foco Total.", "Clareza Absoluta.", "Fluxo Criativo.", "Liberdade."]}
          className="absolute top-[52%] left-[4%] md:left-[8%]"
          delay={0.6}
        />

        {/* RIGHT SIDE: 2 Copies with Typing & Morphing */}
        <SideTypingMorphingCopy
          typewriterText={ctaDict?.sideCopies?.rightTop?.label || "SUA MENTE"}
          morphWords={ctaDict?.sideCopies?.rightTop?.words || ["Sem Limites.", "Sem Barreiras.", "Sem Distrações.", "Em Harmonia."]}
          className="absolute top-[12%] right-[4%] md:right-[8%]"
          delay={0.3}
        />
        <SideTypingMorphingCopy
          typewriterText={ctaDict?.sideCopies?.rightBottom?.label || "TRANSFORME EM"}
          morphWords={ctaDict?.sideCopies?.rightBottom?.words || ["Obra Prima.", "Livro Inesquecível.", "Bestseller.", "Realidade."]}
          className="absolute top-[52%] right-[4%] md:right-[8%]"
          delay={0.6}
        />
        
        {/* Gradient fade out at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#030303] to-transparent z-40 pointer-events-none" />
      </div>
    </section>
  );
}
