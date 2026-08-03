"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { RefreshCw, WifiOff, MessageSquare, ArrowRight } from "lucide-react";

const FEATURE_ICONS = [RefreshCw, WifiOff, MessageSquare];

export default function MobileAppSection({ dict }: { dict: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = dict?.mobileSection?.features || [
    { title: "Sincronização em Tempo Real", desc: "Suas alterações fluem entre dispositivos instantaneamente." },
    { title: "Modo Offline", desc: "Continue escrevendo mesmo sem internet." },
    { title: "IA Nativa", desc: "Assistente criativa otimizada para o toque." }
  ];

  const sideLabels = dict?.mobileSection?.sideLabels || ["EDITOR", "OFFLINE", "MOBILE"];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const phoneY = useTransform(scrollYProgress, [0.1, 0.8], [60, -30]);
  const bgTextX = useTransform(scrollYProgress, [0.1, 0.9], [-50, 50]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100vh] bg-[#030303] flex items-center justify-center overflow-hidden"
    >
      {/* Large Decorative Background Text */}
      <motion.div
        style={{ x: bgTextX }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
      >
        <span className="text-[200px] sm:text-[280px] md:text-[350px] lg:text-[450px] font-bold text-white/[0.02] uppercase leading-none whitespace-nowrap">
          EDITOR
        </span>
      </motion.div>

      <motion.div
        style={{ x: useTransform(scrollYProgress, [0.1, 0.9], [50, -50]) }}
        className="absolute top-[60%] right-0 -translate-y-1/2 pointer-events-none z-0"
      >
        <span className="text-[150px] sm:text-[200px] md:text-[250px] font-bold text-white/[0.015] uppercase leading-none">
          MOBILE
        </span>
      </motion.div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 h-screen flex items-center">

        {/* Left Side - Labels */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute left-6 sm:left-10 lg:left-16 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-6"
        >
          {sideLabels.map((label: string, i: number) => (
            <button
              key={label}
              onClick={() => setCurrentFeature(i)}
              className={`text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-300 text-left ${
                currentFeature === i
                  ? "text-white"
                  : "text-white/20 hover:text-white/40"
              }`}
            >
              {label}
              {currentFeature === i && (
                <motion.div
                  layoutId="activeIndicator"
                  className="h-[1px] bg-white mt-2"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Center - Phone Image */}
        <div className="w-full flex justify-center items-center">
          <motion.div
            style={{ y: phoneY }}
            className="relative z-10"
          >
            <div className="absolute inset-0 -inset-y-20 bg-white/[0.03] blur-[120px] rounded-full pointer-events-none" />

            <div className="relative">
              <Image
                src="/smart.png"
                alt="App Hermione Mobile"
                width={640}
                height={1136}
                className="w-[280px] sm:w-[320px] md:w-[360px] h-auto drop-shadow-[0_30px_100px_rgba(0,0,0,0.9)] grayscale contrast-[1.1] brightness-[0.9]"
                quality={100}
                priority
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#030303]/80 via-transparent to-[#030303]/30 pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* Right Side - Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute right-6 sm:right-10 lg:right-16 top-1/2 -translate-y-1/2 z-20 flex flex-col items-end text-right max-w-[320px]"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="text-white/40 uppercase tracking-[0.3em] text-[9px] font-bold">
              {dict?.mobileSection?.tag || "ECOSSISTEMA"}
            </span>
          </div>

          <h2 className="text-[36px] sm:text-[42px] lg:text-[48px] leading-[1.1] font-bold text-white/90 uppercase tracking-tight mb-4 whitespace-pre-line">
            {dict?.mobileSection?.title || "MODERN\nSTYLE"}
          </h2>

          <p className="text-[12px] sm:text-[13px] text-white/40 leading-[1.7] mb-8 uppercase tracking-wider">
            {dict?.mobileSection?.subtitle}
          </p>

          <a
            href="#"
            className="group inline-flex items-center gap-3 px-6 py-3 border border-white/20 text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/40 transition-all duration-300"
          >
            <span>{dict?.mobileSection?.cta || "EXPLORAR"}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </a>

          <div className="mt-10 w-full">
            <motion.div
              key={currentFeature}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const Icon = FEATURE_ICONS[currentFeature] || RefreshCw;
                  return <Icon className="w-4 h-4 text-white/50" />;
                })()}
                <span className="text-[11px] font-semibold text-white/80">
                  {features[currentFeature]?.title}
                </span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed">
                {features[currentFeature]?.desc}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Number Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute right-6 sm:right-10 lg:right-16 top-[20%] z-20 hidden lg:flex flex-col items-center gap-4"
        >
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setCurrentFeature(num - 1)}
              className={`text-[9px] font-mono transition-colors ${
                currentFeature === num - 1 ? "text-white" : "text-white/20 hover:text-white/40"
              }`}
            >
              {String(num).padStart(2, '0')}
            </button>
          ))}
        </motion.div>

        {/* Bottom Left - Scroll Down */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute bottom-8 left-6 sm:left-10 lg:left-16 z-20"
        >
          <span className="text-[9px] font-bold tracking-[0.3em] text-white/30 uppercase">
            {dict?.mobileSection?.scrollDown || "SCROLL DOWN"}
          </span>
        </motion.div>

        {/* Bottom Right - Follow Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute bottom-8 right-6 sm:right-10 lg:right-16 z-20 flex items-center gap-4"
        >
          <span className="text-[9px] font-bold tracking-[0.3em] text-white/30 uppercase">
            {dict?.mobileSection?.followUs || "SIGA-NOS"}
          </span>
          <div className="w-[1px] h-3 bg-white/20" />
          <div className="flex items-center gap-3">
            <a href="#" className="text-white/30 hover:text-white/60 transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </a>
            <a href="#" className="text-white/30 hover:text-white/60 transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
