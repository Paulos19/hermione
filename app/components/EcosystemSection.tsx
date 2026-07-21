"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Smartphone, Monitor, Tablet, ArrowRightLeft } from "lucide-react";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
});

export default function EcosystemSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  return (
    <section ref={containerRef} className="bg-[#030303] py-32 relative overflow-hidden flex flex-col items-center justify-center min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/10 via-[#030303] to-[#030303] pointer-events-none" />

      <div className="container px-4 z-10 mx-auto max-w-7xl relative">
        <div className="flex flex-col items-center justify-center max-w-[700px] mx-auto mb-24 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${cormorant.className} text-5xl md:text-7xl font-light tracking-wide leading-tight text-white`}
          >
            Um ecossistema <br />
            <span className="italic opacity-60">inquebrável</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-white/50 text-lg max-w-[500px] font-light leading-relaxed"
          >
            Seu trabalho flui de forma invisível entre a palma da sua mão e a sua mesa de trabalho. Sincronização ponta a ponta sem atritos.
          </motion.p>
        </div>

        {/* Visualizer Area */}
        <motion.div 
          style={{ opacity, scale }}
          className="relative h-[400px] md:h-[500px] max-w-4xl mx-auto flex items-center justify-center"
        >
          {/* Animated Connecting Lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 800 400" preserveAspectRatio="none">
            {/* Left to Center Line */}
            <motion.path 
              d="M 200 200 C 300 200, 350 150, 400 150"
              fill="transparent"
              stroke="url(#gradient-line)"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            {/* Center to Right Line */}
            <motion.path 
              d="M 400 150 C 450 150, 500 250, 600 250"
              fill="transparent"
              stroke="url(#gradient-line)"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
            />
            {/* Right to Left (Bottom connection) */}
            <motion.path 
              d="M 600 250 C 400 350, 300 250, 200 200"
              fill="transparent"
              stroke="url(#gradient-line)"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.1 }}
              transition={{ duration: 2, ease: "easeInOut", delay: 1 }}
            />
            <defs>
              <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="1" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Device: Mac/Desktop */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] flex flex-col items-center"
          >
            <div className="w-48 h-32 md:w-64 md:h-40 bg-[#0E1318] border border-white/20 rounded-xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <Monitor className="w-10 h-10 text-white/30 mb-3" />
              <div className="h-1 w-20 bg-white/10 rounded-full mb-1" />
              <div className="h-1 w-16 bg-white/10 rounded-full" />
              
              {/* Sync Pulse */}
              <motion.div 
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute w-2 h-2 rounded-full bg-violet-500 top-4 right-4 shadow-[0_0_10px_#8b5cf6]"
              />
            </div>
            <div className="w-20 h-2 bg-white/10 mt-2 rounded-b-md" />
            <span className="mt-4 text-xs tracking-widest uppercase text-white/40 font-semibold">Workspace</span>
          </motion.div>

          {/* Left Device: Smartphone */}
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
            className="absolute z-20 top-1/2 left-[15%] md:left-[20%] -translate-y-1/2 flex flex-col items-center"
          >
            <div className="w-20 h-40 md:w-24 md:h-48 bg-[#0E1318] border border-white/20 rounded-[1.5rem] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-2 w-8 h-1 bg-white/10 rounded-full" />
              <Smartphone className="w-8 h-8 text-white/30" />
              
              <motion.div 
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 0.6 }}
                className="absolute w-2 h-2 rounded-full bg-violet-500 top-4 right-4 shadow-[0_0_10px_#8b5cf6]"
              />
            </div>
            <span className="mt-4 text-xs tracking-widest uppercase text-white/40 font-semibold">Mobile</span>
          </motion.div>

          {/* Right Device: Tablet */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.6 }}
            className="absolute z-20 top-1/2 right-[15%] md:right-[20%] translate-y-[20%] flex flex-col items-center"
          >
            <div className="w-32 h-44 md:w-40 md:h-56 bg-[#0E1318] border border-white/20 rounded-2xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
              <Tablet className="w-10 h-10 text-white/30 mb-2" />
              <div className="h-1 w-12 bg-white/10 rounded-full" />
              
              <motion.div 
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 1.2 }}
                className="absolute w-2 h-2 rounded-full bg-violet-500 top-4 right-4 shadow-[0_0_10px_#8b5cf6]"
              />
            </div>
            <span className="mt-4 text-xs tracking-widest uppercase text-white/40 font-semibold">Tablet</span>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
