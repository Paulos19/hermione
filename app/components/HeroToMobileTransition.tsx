"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";

const ParticleTransitionCanvas = dynamic(
  () => import("./three/ParticleTransitionCanvas"),
  { ssr: false }
);

export default function HeroToMobileTransition() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax for the text
  const textY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  // Particle transition progress
  const particleProgress = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

  return (
    <div
      ref={containerRef}
      className="relative h-[50vh] md:h-[60vh] bg-[#030303] overflow-hidden"
    >
      {/* Particle Transition Background */}
      <div className="absolute inset-0 z-0">
        <ParticleTransitionCanvas
          className="w-full h-full"
          scrollProgress={particleProgress}
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-transparent to-[#030303] pointer-events-none z-10" />

      {/* Center content */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center z-20"
      >
        <div className="text-center">
          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-16 h-[1px] bg-white/20 mx-auto mb-8"
          />

          {/* Label */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase mb-4"
          >
            DESCUBRA
          </motion.p>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-[28px] sm:text-[36px] md:text-[48px] font-bold text-white/80 tracking-tight"
          >
            Ecossistema
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-[13px] text-white/30 mt-4 max-w-sm mx-auto"
          >
            Conectado em todos os seus dispositivos
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="w-16 h-[1px] bg-white/20 mx-auto mt-8"
          />
        </div>
      </motion.div>

      {/* Side decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 1 }}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden lg:block"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <span className="text-[9px] font-mono text-white/20 -rotate-90 whitespace-nowrap">
            SCROLL
          </span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7, duration: 1 }}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden lg:block"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <span className="text-[9px] font-mono text-white/20 -rotate-90 whitespace-nowrap">
            01 → 02
          </span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}
