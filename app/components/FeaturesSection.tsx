"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cloud, WifiOff, FileDown, Eye } from "lucide-react";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
});

const features = [
  {
    title: "Sincronização Absoluta",
    description: "Cada letra que você digita é salva e sincronizada em tempo real em todos os seus dispositivos. Onde você parar no PC, continue no celular sem perder o raciocínio.",
    icon: <Cloud className="w-6 h-6 text-violet-400" />,
    className: "md:col-span-2 md:row-span-1"
  },
  {
    title: "Modo Foco Extremo",
    description: "Uma interface limpa que desaparece quando você começa a escrever. Nada além de você e suas palavras.",
    icon: <Eye className="w-6 h-6 text-violet-400" />,
    className: "md:col-span-1 md:row-span-1"
  },
  {
    title: "Poder Offline",
    description: "Sua criatividade não precisa de Wi-Fi. Escreva sem internet e a Hermione cuida de sincronizar tudo quando a conexão voltar.",
    icon: <WifiOff className="w-6 h-6 text-violet-400" />,
    className: "md:col-span-1 md:row-span-1"
  },
  {
    title: "Exportação de Mestre",
    description: "Quando o manuscrito estiver pronto, gere PDFs diagramados, arquivos Epub ou Word (.docx) com apenas um clique. Formatação impecável por padrão.",
    icon: <FileDown className="w-6 h-6 text-violet-400" />,
    className: "md:col-span-2 md:row-span-1"
  }
];

export default function FeaturesSection({ dict }: { dict?: any }) {
  const featDict = dict?.featuresSection;
  const list = featDict?.features || features;

  return (
    <section className="bg-[#030303] py-32 relative overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container px-4 z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center max-w-[700px] mx-auto mb-20 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-white/10 py-1.5 px-5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6 bg-white/5"
          >
            <span className="text-white/70">{featDict?.badge || "O Essencial, Elevado"}</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`${cormorant.className} text-5xl md:text-7xl font-light tracking-wide leading-tight text-white`}
          >
            {featDict?.title || "Tudo o que você precisa."} <br />
            <span className="italic opacity-60">{featDict?.subtitle || "Nada do que não precisa."}</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feat, idx) => {
            const item = list[idx] || feat;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`relative overflow-hidden group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md hover:bg-white/10 transition-colors duration-500 flex flex-col justify-end min-h-[300px] ${feat.className}`}
              >
                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-violet-500/0 to-violet-500/0 group-hover:to-violet-500/10 transition-colors duration-700 pointer-events-none" />
                
                <div className="mb-auto p-4 bg-white/5 rounded-2xl w-fit border border-white/10">
                  {feat.icon}
                </div>

                <div className="mt-8 z-10">
                  <h3 className="text-xl font-medium text-white mb-3 tracking-wide">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed font-light text-sm md:text-base">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
