"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ArrowRight } from "lucide-react";

const FAQS = [
  {
    question: "O que acontece se eu ficar sem internet enquanto escrevo?",
    answer: "A Hermione foi construída com um princípio offline-first. Tudo o que você escreve é salvo instantaneamente de forma local no seu dispositivo. Assim que a conexão for reestabelecida, sincronizaremos silenciosamente com a nuvem, sem interrupções.",
  },
  {
    question: "Como funciona a assistência por IA da Hermione?",
    answer: "Nossa IA (disponível nos planos Pro e Premium) atua como um parceiro de brainstorming. Ela pode sugerir desenvolvimentos de trama, revisar sua gramática, ou ajudar a superar o bloqueio criativo, mas jamais escreverá a história por você. Seus direitos autorais permanecem 100% seus.",
  },
  {
    question: "Posso exportar meu manuscrito para publicar na Amazon?",
    answer: "Absolutamente. O recurso de Exportação de Mestre gera arquivos .epub, .pdf e .docx formatados de acordo com os padrões da indústria editorial, prontos para serem enviados ao KDP (Kindle Direct Publishing) ou para o seu editor.",
  },
  {
    question: "Meus textos estão seguros na nuvem?",
    answer: "A segurança da sua propriedade intelectual é nossa prioridade absoluta. Utilizamos criptografia de ponta a ponta. Nem mesmo nossa equipe tem acesso ao conteúdo dos seus manuscritos. Apenas você, com o seu PIN Mestre, pode decifrá-los.",
  },
  {
    question: "Existe algum aplicativo para celular?",
    answer: "Sim! A Hermione funciona de forma fluida e responsiva no seu smartphone ou tablet, permitindo que você anote ideias brilhantes que surgem no metrô, e continue a desenvolvê-las no computador quando chegar em casa.",
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim, sem burocracia. Você pode cancelar sua assinatura a qualquer momento diretamente nas configurações da sua conta. Seu acesso continuará ativo até o final do período já pago.",
  },
];

export default function FaqSection({ dict }: { dict?: any }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqDict = dict?.faqSection;

  const faqs = faqDict?.items?.length ? faqDict.items : FAQS;

  return (
    <section id="faq" className="relative bg-[#030303] py-24 md:py-32 overflow-hidden">
      {/* Subtle gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#E84855]/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1000px] mx-auto px-6 sm:px-10 lg:px-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center mb-16 md:mb-20"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E84855]" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">
              FAQ
            </span>
          </div>
          <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] leading-[1.05] font-bold text-white/90 uppercase tracking-tight">
            {faqDict?.title || "DÚVIDAS"}
            <br />
            <span className="text-[#E84855]">{faqDict?.subtitle || "FREQUENTES"}</span>
          </h2>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq: any, index: number) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.6 }}
              >
                <div
                  className={`border transition-all duration-500 ${
                    isOpen
                      ? "bg-[#080808] border-[#E84855]/20"
                      : "bg-[#050505] border-white/[0.04] hover:border-white/[0.08]"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-6 p-6 md:p-8 text-left"
                  >
                    {/* Number + Question */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <span className={`text-[11px] font-mono transition-colors duration-300 shrink-0 mt-1 ${
                        isOpen ? "text-[#E84855]" : "text-white/20"
                      }`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={`text-[15px] md:text-[17px] font-medium transition-colors duration-300 ${
                        isOpen ? "text-white" : "text-white/60"
                      }`}>
                        {faq.question}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? "bg-[#E84855] text-white"
                        : "bg-white/[0.04] text-white/30"
                    }`}>
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  {/* Answer */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="px-6 md:px-8 pb-6 md:pb-8 pl-[52px] md:pl-[68px]">
                          <div className="h-[1px] bg-white/[0.04] mb-6" />
                          <p className="text-[13px] md:text-[14px] text-white/40 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center mt-16 pt-12 border-t border-white/[0.04]"
        >
          <p className="text-[13px] text-white/30 mb-6">
            Ainda tem dúvidas?
          </p>
          <button className="group inline-flex items-center gap-3 px-6 py-3 border border-white/10 text-white/60 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-300">
            <span>Fale Conosco</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

      </div>
    </section>
  );
}
