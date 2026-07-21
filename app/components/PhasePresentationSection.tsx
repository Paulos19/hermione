"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Cormorant_Garamond } from "next/font/google";
import Link from "next/link";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export default function PhasePresentationSection({ dict }: { dict?: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // ----------------------------------------------------
  // PHASE TIMINGS (Scroll Progress 0 to 1)
  // ----------------------------------------------------
  // Phase 0 (Transition):  0.0 -> 0.1
  // Phase 1 (White BG, Morph): 0.1 -> 0.3
  // Phase 2 (Black BG, Lines): 0.3 -> 0.5
  // Phase 3 (Video full):      0.5 -> 0.75
  // Phase 4 (White BG, CTA):   0.75 -> 1.0
  
  // Background Colors
  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 1],
    [
      "#030303", // Starts black to blend with Session 3
      "#FFFFFF", // Morphs to white
      "#FFFFFF", // Holds white
      "#030303", // P2 becomes black
      "#030303", // Holds black
      "#030303", // P3 holds black (video bg)
      "#FFFFFF", // P4 becomes white
      "#FFFFFF"  // Holds white
    ]
  );

  // ----------------------------------------------------
  // PHASE 1: MORPHING TEXT
  // ----------------------------------------------------
  const p1Opacity = useTransform(scrollYProgress, [0.05, 0.15, 0.25, 0.3], [0, 1, 1, 0]);
  const [morphWord, setMorphWord] = useState("Sua história.");
  const morphWords = ["Sua história.", "Your story.", "Tu historia."];
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % morphWords.length;
      setMorphWord(morphWords[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ----------------------------------------------------
  // PHASE 2: LINE DRAWING
  // ----------------------------------------------------
  const p2Opacity = useTransform(scrollYProgress, [0.3, 0.35, 0.45, 0.5], [0, 1, 1, 0]);
  const pathLength = useTransform(scrollYProgress, [0.35, 0.45], [0, 1]);

  // ----------------------------------------------------
  // PHASE 3: VIDEO
  // ----------------------------------------------------
  const p3Opacity = useTransform(scrollYProgress, [0.45, 0.5, 0.7, 0.75], [0, 1, 1, 0]);
  const p3Scale = useTransform(scrollYProgress, [0.45, 0.75], [0.95, 1.05]);

  // ----------------------------------------------------
  // PHASE 4: TYPING CTA
  // ----------------------------------------------------
  const p4Opacity = useTransform(scrollYProgress, [0.75, 0.8, 1, 1], [0, 1, 1, 1]);
  const [typedText, setTypedText] = useState("");
  const fullText = "Comece a escrever sua obra prima";
  const [isTypingPhase, setIsTypingPhase] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (val) => {
      if (val > 0.8 && !isTypingPhase) {
        setIsTypingPhase(true);
      } else if (val < 0.75 && isTypingPhase) {
        setIsTypingPhase(false);
        setTypedText("");
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, isTypingPhase]);

  useEffect(() => {
    if (!isTypingPhase) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [isTypingPhase]);

  return (
    <section ref={containerRef} className="relative w-full h-[400vh]">
      <motion.div 
        style={{ backgroundColor: bgColor }}
        className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center transition-colors duration-200"
      >
        
        {/* ================= PHASE 1 ================= */}
        <motion.div 
          style={{ opacity: p1Opacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {/* Gooey Filter SVG */}
          <svg className="hidden">
            <defs>
              <filter id="goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                <feBlend in="SourceGraphic" in2="goo" />
              </filter>
            </defs>
          </svg>
          <div style={{ filter: "url(#goo)" }} className="relative flex items-center justify-center w-full h-full">
            <AnimatePresence mode="wait">
              <motion.h2
                key={morphWord}
                initial={{ opacity: 0, filter: "blur(10px)", scale: 0.9 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className={`${cormorant.className} text-6xl md:text-8xl text-black font-light tracking-wide absolute text-center w-full px-4`}
              >
                {morphWord}
              </motion.h2>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ================= PHASE 2 ================= */}
        <motion.div 
          style={{ opacity: p2Opacity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {/* Simple SVG text drawing for "Ganha vida." */}
          <svg className="w-[80vw] h-[20vh] max-w-4xl" viewBox="0 0 800 200">
            <motion.text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`${cormorant.className} text-7xl md:text-9xl font-light`}
              fill="transparent"
              stroke="#FFFFFF"
              strokeWidth="2"
              style={{ pathLength }}
            >
              Ganha vida.
            </motion.text>
            <motion.text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`${cormorant.className} text-7xl md:text-9xl font-light`}
              fill="#FFFFFF"
              style={{ opacity: useTransform(scrollYProgress, [0.4, 0.45], [0, 1]) }}
            >
              Ganha vida.
            </motion.text>
          </svg>
        </motion.div>

        {/* ================= PHASE 3 ================= */}
        <motion.div 
          style={{ opacity: p3Opacity, scale: p3Scale }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black"
        >
          <video 
            src="https://0nxicue7ew.ufs.sh/f/BGEz3YvO4INzoubzzP8Wr31JTkKejNl6BcExnIqPiwd425gb"
            autoPlay 
            loop 
            muted 
            playsInline
            suppressHydrationWarning
            className="w-full h-full object-cover opacity-80"
          />
        </motion.div>

        {/* ================= PHASE 4 ================= */}
        <motion.div 
          style={{ opacity: p4Opacity }}
          className="absolute inset-0 flex items-center justify-center bg-white"
        >
          <div className="flex flex-col items-center gap-8">
            <h2 className={`${cormorant.className} text-4xl md:text-6xl text-black font-light tracking-wide text-center`}>
              {typedText}
            </h2>
            <Link 
              href="/dashboard"
              className="mt-8 relative inline-flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/5 blur-xl rounded-full" />
              <div className="relative flex items-center gap-2 text-black border border-black/10 px-8 py-4 rounded-full hover:bg-black hover:text-white transition-all duration-500 group">
                <span className="font-medium tracking-wide">Acessar Dashboard</span>
                <span className="w-2 h-5 bg-current animate-pulse ml-1" />
              </div>
            </Link>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
