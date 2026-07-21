"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const TypewriterWord = ({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) => {
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.04, delayChildren: delay } },
        hidden: {}
      }}
    >
      {text.split(" ").map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-[0.25em]"
          variants={{
            visible: { opacity: 1, y: 0, filter: "blur(0px)" },
            hidden: { opacity: 0, y: 4, filter: "blur(4px)" }
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

const TypewriterChar = ({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) => {
  const words = text.split(" ");
  return (
    <motion.span
      className={`inline ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.02, delayChildren: delay } },
        hidden: {}
      }}
    >
      {words.map((word, wIndex) => (
        <span key={wIndex} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split("").map((char, cIndex) => (
            <motion.span
              key={cIndex}
              className="inline-block"
              variants={{
                visible: { opacity: 1, y: 0 },
                hidden: { opacity: 0, y: 2 }
              }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
};

export default function MobileAppSection({ dict }: { dict: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Bordas mais finas: o card escala de 0.95 até 1.
  const cardScale = useTransform(scrollYProgress, [0, 0.4], [0.95, 1]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.3], [0.4, 1]);
  const cardBorderRadius = useTransform(scrollYProgress, [0, 0.5], ["40px", "32px"]);

  // Parallax suave para a mão e o smartphone
  const imageY = useTransform(scrollYProgress, [0, 1], [15, 0]);

  // Fade-in global para a cor branca do fundo
  const bgOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <section ref={containerRef} className="relative w-full h-screen px-4 md:px-6 lg:px-8 pt-[72px] pb-6 flex flex-col items-center justify-center overflow-hidden">

      {/* Fundo Branco Fixo Animado (cobre o fundo preto) */}
      <motion.div
        className="fixed inset-0 pointer-events-none bg-white z-0"
        style={{ opacity: bgOpacity }}
      />

      {/* Container escuro com bordas reduzidas */}
      <motion.div
        style={{
          scale: cardScale,
          opacity: cardOpacity,
          borderRadius: cardBorderRadius
        }}
        className="w-full max-w-[1440px] flex-1 h-full bg-[#0A0A0A] overflow-hidden relative z-10 shadow-[0_40px_100px_rgba(0,0,0,0.15)] flex flex-col items-center justify-between border border-[#1A1A1A]"
      >

        {/* Conteúdo Tipográfico Flutuante */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-12 lg:p-16 pointer-events-none">

          <div className="flex w-full justify-between items-start">
            {/* Copy Esq. */}
            <div className="max-w-md lg:max-w-xl">
              <h2 className={`${cormorant.className} text-3xl md:text-5xl lg:text-6xl text-white font-light tracking-wide leading-tight mb-4 md:mb-6`}>
                <TypewriterChar text={dict.mobileSection.title} delay={0.2} />
              </h2>
              <div className="text-xs md:text-sm lg:text-base text-[#8A94A0] font-light leading-relaxed max-w-sm">
                <TypewriterWord text={dict.mobileSection.subtitle} delay={1.2} />
              </div>
            </div>

            {/* Features Dir. */}
            <div className="hidden md:flex flex-col gap-8 text-right items-end mt-6 md:mt-12">
              <div className="flex flex-col items-end gap-2">
                <TypewriterChar text={dict.mobileSection.features.sync} delay={2.0} className="text-white/80 font-light tracking-widest text-sm uppercase" />
                <motion.div
                  initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 2.5, duration: 0.6 }}
                  className="w-12 h-[1px] bg-white/20 origin-right"
                />
              </div>
              <div className="flex flex-col items-end gap-2">
                <TypewriterChar text={dict.mobileSection.features.offline} delay={2.6} className="text-white/60 font-light tracking-widest text-sm uppercase" />
                <motion.div
                  initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 3.1, duration: 0.6 }}
                  className="w-8 h-[1px] bg-white/10 origin-right"
                />
              </div>
              <div className="flex flex-col items-end gap-2">
                <TypewriterChar text={dict.mobileSection.features.ai} delay={3.2} className="text-white/40 font-light tracking-widest text-sm uppercase" />
                <motion.div
                  initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 3.7, duration: 0.6 }}
                  className="w-4 h-[1px] bg-white/5 origin-right"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Flutuante */}
        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-20 pointer-events-auto">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 4.0, duration: 0.8 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-3.5 rounded-full font-light tracking-wide text-sm hover:bg-white/15 hover:border-white/30 transition-all duration-300"
          >
            {dict.mobileSection.cta}
          </motion.button>
        </div>

        {/* Mão e Smartphone ao centro, proporcional ao card */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[240px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[350px] h-[60vh] max-h-[75%] flex items-end justify-center pointer-events-none pb-2 md:pb-4">
          {/* Brilho sutil de fundo */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[220px] h-[220px] bg-[#B899FF] rounded-full blur-[100px] opacity-[0.15]" />

          <motion.div
            style={{ y: imageY }}
            className="relative w-full h-full flex items-end justify-center"
          >
            <Image
              src="/smart.png"
              alt="Chat Secret Mobile App"
              width={700}
              height={700}
              className="w-auto h-full max-h-full object-contain drop-shadow-[0_-10px_50px_rgba(0,0,0,0.8)] object-bottom"
              quality={100}
              priority
            />
          </motion.div>
        </div>

      </motion.div>
    </section>
  );
}
