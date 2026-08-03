"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Monitor, Smartphone, Tablet } from "lucide-react";

const CATEGORIES = [
  "Romancistas",
  "Jornalistas",
  "Roteiristas",
  "Estudantes",
  "Editoras",
  "Colaboradores",
];

const FEATURES_CAROUSEL = [
  {
    id: 1,
    title: "Colaboração em Tempo Real",
    description: "Múltiplos autores trabalhando simultaneamente no mesmo documento, com cursores ao vivo e sincronização instantânea via CRDT.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
  },
  {
    id: 2,
    title: "IA que Entende seu Texto",
    description: "Assistente de escrita consciente do contexto do seu documento, oferecendo sugestões relevantes e revisão inteligente.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  },
  {
    id: 3,
    title: "Exportação Profissional",
    description: "Gere PDFs, EPUBs e documentos Word com formatação impecável, pronto para publicação.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
  },
];

const STATS = [
  { label: "Dispositivos", value: "3+", description: "Web, Mobile e Tablet" },
  { label: "Sincronização", value: "<1s", description: "Latência real-time" },
  { label: "Formatos", value: "3", description: "PDF, HRM, DOCX" },
];

export default function EcosystemSection({ dict }: { dict?: any }) {
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const ecoDict = dict?.ecosystemSection;

  return (
    <section id="ecosystem" className="relative bg-[#030303] overflow-hidden">

      {/* Hero - Image with text overlay */}
      <div className="relative h-[70vh] md:h-[80vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80"
            alt="Ecosystem"
            className="w-full h-full object-cover grayscale contrast-[1.1] brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#030303]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="max-w-xl ml-auto mr-8 md:mr-16 lg:mr-32">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[13px] md:text-[14px] text-white/50 leading-relaxed mb-8"
            >
              {ecoDict?.description || "Seu trabalho flui de forma invisível entre a palma da sua mão e a sua mesa de trabalho. Sincronização ponta a ponta sem atritos."}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group inline-flex items-center gap-3 px-6 py-3 border border-white/20 text-white/80 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            >
              <span>Explorar</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Horizontal Categories Scroll */}
      <div className="relative py-12 md:py-16 border-b border-white/[0.04]">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-8 md:gap-12 min-w-max px-6 sm:px-10 lg:px-16">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(i)}
                className={`text-[16px] md:text-[20px] font-light tracking-wide whitespace-nowrap transition-all duration-300 ${activeCategory === i
                    ? "text-white"
                    : "text-white/30 hover:text-white/60"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features Carousel */}
      <div className="relative py-24 md:py-32">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-20"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E84855]" />
              <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">
                Features
              </span>
            </div>
            <h2 className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[56px] leading-[1.05] font-bold text-white/90 tracking-tight">
              {ecoDict?.title || "Um ecossistema"}<br />
              <span className="text-white/30">{ecoDict?.subtitle || "inquebrável"}</span>
            </h2>
          </motion.div>

          {/* Carousel */}
          <div className="relative max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center"
              >
                {/* Image */}
                <div className="relative w-full max-w-3xl h-[300px] md:h-[400px] rounded-2xl overflow-hidden mb-10">
                  <img
                    src={FEATURES_CAROUSEL[activeFeature].image}
                    alt={FEATURES_CAROUSEL[activeFeature].title}
                    className="w-full h-full object-cover grayscale contrast-[1.1] brightness-[0.5]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/30" />
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-6">
                  <Monitor className="w-5 h-5 text-white/50" />
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-4 text-center">
                  {FEATURES_CAROUSEL[activeFeature].title}
                </h3>

                {/* Description */}
                <p className="text-[13px] md:text-[14px] text-white/40 leading-relaxed text-center max-w-lg mb-8">
                  {FEATURES_CAROUSEL[activeFeature].description}
                </p>

                {/* Learn more */}
                <button className="group flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-white/50 hover:text-white transition-colors uppercase">
                  Saiba mais
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex items-center justify-center gap-3 mt-12">
              {FEATURES_CAROUSEL.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${activeFeature === i
                      ? "bg-white w-6"
                      : "bg-white/20 hover:bg-white/40"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Split layout */}
      <div className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E84855]" />
                <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">
                  Performance
                </span>
              </div>
              <h2 className="text-[32px] sm:text-[40px] md:text-[48px] leading-[1.05] font-bold text-white/90 tracking-tight mb-6">
                Sincronização<br />
                <span className="text-[#E84855]">ultra-rápida</span>
              </h2>
              <p className="text-[13px] md:text-[14px] text-white/40 leading-relaxed mb-8 max-w-md">
                Tecnologia CRDT garante que suas alterações sejam propagadas entre dispositivos em menos de 1 segundo, sem conflitos.
              </p>
              <button className="group inline-flex items-center gap-3 px-6 py-3 border border-white/20 text-white/80 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/40 transition-all duration-300">
                <span>Começar agora</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Right - Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-3 gap-6"
            >
              {STATS.map((stat, i) => (
                <div key={stat.label} className="text-center md:text-right">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">
                    {stat.label}
                  </p>
                  <p className="text-[36px] md:text-[48px] font-bold text-white leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-white/30">
                    {stat.description}
                  </p>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </div>

      {/* Technology Section - Image + Text */}
      <div className="relative py-24 md:py-32 border-t border-white/[0.04]">
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left - Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80"
                alt="Technology"
                className="w-full h-full object-cover grayscale contrast-[1.1] brightness-[0.4]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/50 to-transparent" />

              {/* Device icons overlay */}
              <div className="absolute bottom-8 left-8 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Monitor className="w-4 h-4 text-white/60" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Smartphone className="w-4 h-4 text-white/60" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Tablet className="w-4 h-4 text-white/60" />
                </div>
              </div>
            </motion.div>

            {/* Right - Text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E84855]" />
                <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">
                  Tecnologia
                </span>
              </div>
              <h2 className="text-[32px] sm:text-[40px] md:text-[48px] leading-[1.05] font-bold text-white/90 tracking-tight mb-6">
                Onde tecnologia<br />
                <span className="text-[#E84855]">encontra design</span>
              </h2>
              <p className="text-[13px] md:text-[14px] text-white/40 leading-relaxed mb-8 max-w-md">
                Construído com as tecnologias mais modernas: Next.js, React Native, Yjs para CRDTs e WebSocket para comunicação em tempo real.
              </p>
              <button className="group inline-flex items-center gap-3 px-6 py-3 border border-white/20 text-white/80 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 hover:border-white/40 transition-all duration-300">
                <span>Saiba mais</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

          </div>
        </div>
      </div>

    </section>
  );
}
