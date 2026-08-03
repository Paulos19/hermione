"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface Feature {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  work: string;
  client: string;
}

const FEATURES_DATA: Feature[] = [
  {
    id: 1,
    title: "SYNC",
    subtitle: "Em Tempo Real",
    description: "Cada letra que você digita é salva e sincronizada em tempo real em todos os seus dispositivos.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    work: "Sincronização",
    client: "Multi-dispositivo",
  },
  {
    id: 2,
    title: "FOCO",
    subtitle: "Modo Extremo",
    description: "Uma interface limpa que desaparece quando você começa a escrever. Nada além de você e suas palavras.",
    image: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&q=80",
    work: "Concentração",
    client: "Interface Minimalista",
  },
  {
    id: 3,
    title: "OFFLINE",
    subtitle: "Poder Sem Internet",
    description: "Sua criatividade não precisa de Wi-Fi. Escreva sem internet e a Hermione sincroniza tudo depois.",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&q=80",
    work: "Acesso Livre",
    client: "Sem Conexão",
  },
  {
    id: 4,
    title: "EXPORT",
    subtitle: "Formatos Profissionais",
    description: "Gere PDFs diagramados, arquivos Epub ou Word com apenas um clique. Formatação impecável.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
    work: "Publicação",
    client: "PDF, EPUB, DOCX",
  },
];

export default function FeaturesSection({ dict }: { dict?: any }) {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const featDict = dict?.featuresSection;

  const features = featDict?.features?.map((f: any, i: number) => ({
    ...FEATURES_DATA[i],
    title: f.title?.split(" ")[0]?.toUpperCase() || FEATURES_DATA[i].title,
    subtitle: f.title?.split(" ").slice(1).join(" ") || FEATURES_DATA[i].subtitle,
    description: f.description || FEATURES_DATA[i].description,
  })) || FEATURES_DATA;

  return (
    <section className="relative bg-[#030303] overflow-hidden">
      {/* Gradient transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#030303] via-[#030303] to-transparent pointer-events-none z-20" />

      {/* Background large text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <span className="text-[200px] md:text-[300px] lg:text-[400px] font-bold text-white/[0.015] uppercase leading-none whitespace-nowrap">
          WORK
        </span>
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-24 md:py-32">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-20"
        >
          <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] leading-[1.05] font-bold text-white/90 uppercase tracking-tight">
            {featDict?.title || "FEATURES"}
          </h2>
          <p className="text-[14px] md:text-[16px] text-white/30 mt-4 max-w-md">
            {featDict?.subtitle || "Ferramentas feitas para escritores"}
          </p>
        </motion.div>

        {/* Accordion Columns */}
        <div
          className="flex h-[500px] md:h-[600px] gap-0"
          onMouseLeave={() => setActiveFeature(null)}
        >
          {features.map((feature: any, index: number) => {
            const isActive = activeFeature === index;
            const isAnyActive = activeFeature !== null;

            return (
              <motion.div
                key={`feature-${index}-${feature.id || index}`}
                onMouseEnter={() => setActiveFeature(index)}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                animate={{
                  flex: isActive ? 4 : isAnyActive ? 0.8 : 1,
                  opacity: isActive ? 1 : isAnyActive ? 0.6 : 1,
                }}
                className="relative overflow-hidden cursor-pointer group"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isActive
                        ? "grayscale-0 scale-105 brightness-[0.4]"
                        : "grayscale contrast-[1.1] brightness-[0.2] scale-100"
                    }`}
                  />
                  <div className={`absolute inset-0 bg-[#030303] transition-opacity duration-500 ${
                    isActive ? "opacity-30" : "opacity-60"
                  }`} />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
                  {/* Top - Number */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-white/40">
                      {String(feature.id).padStart(2, "0")}
                    </span>
                    <div className={`h-[1px] bg-white/20 transition-all duration-500 ${
                      isActive ? "w-12" : "w-4"
                    }`} />
                    <span className="text-[10px] text-white/30">05</span>
                  </div>

                  {/* Center - Title */}
                  <div className="flex-1 flex items-center justify-center relative">
                    {/* Vertical title when collapsed */}
                    <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ${
                      isActive ? "opacity-0 scale-95" : "opacity-100 scale-100"
                    }`}>
                      <h3 className="text-white/80 text-[14px] md:text-[16px] font-bold tracking-[0.3em] uppercase whitespace-nowrap"
                        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                      >
                        {feature.title}
                      </h3>
                    </div>

                    {/* Expanded content on hover */}
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        x: isActive ? 0 : 30,
                      }}
                      transition={{ duration: 0.5, delay: isActive ? 0.2 : 0 }}
                      className="w-full"
                    >
                      <div className="text-center">
                        <h3 className="text-[#E84855] text-[12px] md:text-[14px] font-bold tracking-[0.3em] uppercase mb-3">
                          {feature.title}
                        </h3>
                        <h2 className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-white leading-[0.95] tracking-tight mb-4">
                          {feature.subtitle}
                        </h2>
                        <p className="text-[12px] md:text-[13px] text-white/50 leading-relaxed max-w-[280px] mx-auto">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom - Info */}
                  <div className="flex items-end justify-between">
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        y: isActive ? 0 : 10,
                      }}
                      transition={{ duration: 0.4, delay: isActive ? 0.3 : 0 }}
                      className="space-y-1"
                    >
                      <p className="text-[10px]">
                        <span className="text-white/40">Work </span>
                        <span className="text-[#E84855] font-medium">{feature.work}</span>
                      </p>
                      <p className="text-[10px]">
                        <span className="text-white/40">Client </span>
                        <span className="text-[#E84855] font-medium">{feature.client}</span>
                      </p>
                    </motion.div>

                    <motion.div
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        x: isActive ? 0 : 20,
                      }}
                      transition={{ duration: 0.4, delay: isActive ? 0.3 : 0 }}
                    >
                      <span className="text-[10px] text-white/30">— See more</span>
                    </motion.div>
                  </div>
                </div>

                {/* Red accent line at bottom */}
                <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[#E84855] transition-all duration-500 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`} />
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex items-center justify-between mt-12 pt-8 border-t border-white/[0.04]"
        >
          <div className="flex items-center gap-6">
            {features.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`text-[10px] font-mono transition-colors ${
                  activeFeature === i ? "text-[#E84855]" : "text-white/20 hover:text-white/40"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
              PREV
            </span>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:border-white/50 hover:text-white transition-all">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:border-white/50 hover:text-white transition-all">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
              NEXT
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
