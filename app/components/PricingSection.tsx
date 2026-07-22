"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Cormorant_Garamond } from "next/font/google";
import { TiltCard } from "./ui/be-ui-tilt-card";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
});

const plans = [
  {
    name: "Grátis",
    price: "0",
    description: "Ideal para experimentar o ecossistema e começar sua jornada.",
    features: [
      { name: "Até 3 Projetos", included: true },
      { name: "Sincronização em tempo real", included: true },
      { name: "Modo Foco", included: true },
      { name: "Acesso à IA (Hermione)", included: false },
      { name: "Exportação (.hrm, .pdf, .docx)", included: false },
    ],
    buttonText: "Começar Grátis",
    isPopular: false
  },
  {
    name: "Pro",
    price: "19,99",
    description: "Para escritores dedicados que precisam de mais espaço e ajuda.",
    features: [
      { name: "Até 8 Projetos", included: true },
      { name: "Sincronização em tempo real", included: true },
      { name: "Modo Foco", included: true },
      { name: "Acesso à IA Limitado", included: true },
      { name: "Exportação Completa", included: true },
    ],
    buttonText: "Assinar Pro",
    isPopular: true
  },
  {
    name: "Premium",
    price: "49,99",
    description: "A experiência definitiva. Sem limites para a sua criatividade.",
    features: [
      { name: "Projetos Ilimitados", included: true },
      { name: "Sincronização em tempo real", included: true },
      { name: "Modo Foco", included: true },
      { name: "Acesso à IA Ilimitado", included: true },
      { name: "Exportação Completa", included: true },
    ],
    buttonText: "Assinar Premium",
    isPopular: false
  }
];

export default function PricingSection({ dict }: { dict?: any }) {
  const priceDict = dict?.pricingSection;

  const dynamicPlans = [
    {
      ...plans[0],
      name: priceDict?.freePlan?.name || plans[0].name,
      description: priceDict?.freePlan?.description || plans[0].description,
      buttonText: priceDict?.freePlan?.buttonText || plans[0].buttonText,
    },
    {
      ...plans[1],
      name: priceDict?.proPlan?.name || plans[1].name,
      description: priceDict?.proPlan?.description || plans[1].description,
      buttonText: priceDict?.proPlan?.buttonText || plans[1].buttonText,
    },
    {
      ...plans[2],
      name: priceDict?.premiumPlan?.name || plans[2].name,
      description: priceDict?.premiumPlan?.description || plans[2].description,
      buttonText: priceDict?.premiumPlan?.buttonText || plans[2].buttonText,
    },
  ];

  return (
    <section className="bg-[#030303] py-32 relative overflow-hidden flex flex-col items-center">
      <div className="container px-4 z-10 mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-center max-w-[700px] mx-auto mb-20 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${cormorant.className} text-5xl md:text-7xl font-light tracking-wide leading-tight text-white`}
          >
            {priceDict?.title || "Invista na sua"} <br />
            <span className="italic opacity-60">obra prima</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-white/50 text-lg max-w-[500px] font-light leading-relaxed"
          >
            Escolha o plano perfeito para as suas necessidades de escrita. Desde o rascunho inicial até o manuscrito final.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 justify-center items-center lg:items-stretch">
          {dynamicPlans.map((plan, idx) => (
            <TiltCard 
              key={plan.name} 
              className={`w-full max-w-[340px] flex flex-col p-8 bg-[#0a0a0a] border ${plan.isPopular ? 'border-violet-500/50' : 'border-white/10'}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
              )}
              
              <div className="mb-8">
                <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase text-white/70 bg-white/5 rounded-full border border-white/10 mb-6">
                  {plan.name}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl text-white/50">R$</span>
                  <span className="text-5xl font-light text-white tracking-tight">{plan.price}</span>
                  <span className="text-white/50">/mês</span>
                </div>
                <p className="mt-4 text-sm text-white/50 leading-relaxed min-h-[60px]">
                  {plan.description}
                </p>
              </div>

              <button className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                plan.isPopular 
                  ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}>
                {plan.buttonText}
              </button>

              <div className="mt-8 space-y-4 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-violet-400 shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-white/20 shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-white/80' : 'text-white/30'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
