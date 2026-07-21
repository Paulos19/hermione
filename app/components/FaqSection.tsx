"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
});

const faqs = [
  {
    question: "O que acontece se eu ficar sem internet enquanto escrevo?",
    answer: "A Hermione foi construída com um princípio offline-first. Tudo o que você escreve é salvo instantaneamente de forma local no seu dispositivo. Assim que a conexão for reestabelecida, sincronizaremos silenciosamente com a nuvem, sem interrupções."
  },
  {
    question: "Como funciona a assistência por IA da Hermione?",
    answer: "Nossa IA (disponível nos planos Pro e Premium) atua como um parceiro de brainstorming. Ela pode sugerir desenvolvimentos de trama, revisar sua gramática, ou ajudar a superar o bloqueio criativo, mas jamais escreverá a história por você. Seus direitos autorais permanecem 100% seus."
  },
  {
    question: "Posso exportar meu manuscrito para publicar na Amazon?",
    answer: "Absolutamente. O recurso de Exportação de Mestre gera arquivos .epub, .pdf e .docx formatados de acordo com os padrões da indústria editorial, prontos para serem enviados ao KDP (Kindle Direct Publishing) ou para o seu editor."
  },
  {
    question: "Meus textos estão seguros na nuvem?",
    answer: "A segurança da sua propriedade intelectual é nossa prioridade absoluta. Utilizamos criptografia de ponta a ponta. Nem mesmo nossa equipe tem acesso ao conteúdo dos seus manuscritos. Apenas você, com o seu PIN Mestre, pode decifrá-los."
  },
  {
    question: "Existe algum aplicativo para celular?",
    answer: "Sim! A Hermione funciona de forma fluida e responsiva no seu smartphone ou tablet, permitindo que você anote ideias brilhantes que surgem no metrô, e continue a desenvolvê-las no computador quando chegar em casa."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#030303] py-32 relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-violet-900/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container px-4 z-10 mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${cormorant.className} text-5xl md:text-6xl font-light tracking-wide text-white mb-6`}
          >
            Dúvidas <span className="italic opacity-60">Frequentes</span>
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="border border-white/10 bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex items-center justify-between w-full p-6 text-left focus:outline-none"
                >
                  <span className="text-lg text-white/90 font-medium pr-8">{faq.question}</span>
                  <div className={`p-2 rounded-full border transition-colors duration-300 ${isOpen ? 'bg-white/10 border-white/20' : 'border-white/10'}`}>
                    {isOpen ? (
                      <Minus className="w-4 h-4 text-white" />
                    ) : (
                      <Plus className="w-4 h-4 text-white/60" />
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 pb-6 text-white/50 font-light leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
