"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const PLANS = [
  {
    name: "Grátis",
    price: "0",
    period: "",
    description: "Ideal para experimentar o ecossistema e começar sua jornada.",
    features: [
      "Até 3 Projetos",
      "Sincronização em tempo real",
      "Modo Foco",
    ],
    limitations: [
      "Acesso à IA (Hermione)",
      "Exportação (.hrm, .pdf, .docx)",
    ],
    buttonText: "Começar Grátis",
    popular: false,
  },
  {
    name: "Pro",
    price: "19,99",
    period: "/mês",
    description: "Para escritores dedicados que precisam de mais espaço e ajuda.",
    features: [
      "Até 8 Projetos",
      "Sincronização em tempo real",
      "Modo Foco",
      "Acesso à IA Limitado",
      "Exportação Completa",
    ],
    limitations: [],
    buttonText: "Assinar Pro",
    popular: true,
  },
  {
    name: "Premium",
    price: "49,99",
    period: "/mês",
    description: "A experiência definitiva. Sem limites para a sua criatividade.",
    features: [
      "Projetos Ilimitados",
      "Sincronização em tempo real",
      "Modo Foco",
      "Acesso à IA Ilimitado",
      "Exportação Completa",
      "Suporte Prioritário",
    ],
    limitations: [],
    buttonText: "Assinar Premium",
    popular: false,
  },
];

export default function PricingSection({ dict }: { dict?: any }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const priceDict = dict?.pricingSection;

  const plans = PLANS.map((plan, i) => ({
    ...plan,
    name: priceDict?.[`${["free", "pro", "premium"][i]}Plan`]?.name || plan.name,
    description: priceDict?.[`${["free", "pro", "premium"][i]}Plan`]?.description || plan.description,
    buttonText: priceDict?.[`${["free", "pro", "premium"][i]}Plan`]?.buttonText || plan.buttonText,
  }));

  return (
    <section id="pricing" className="relative bg-[#030303] py-24 md:py-32 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">

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
              {priceDict?.badge || "Planos & Assinaturas"}
            </span>
          </div>
          <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] leading-[1.05] font-bold text-white/90 uppercase tracking-tight">
            {priceDict?.title || "Escolha o seu"}
            <br />
            <span className="text-[#E84855]">plano</span>
          </h2>

          {/* Billing Toggle */}
          <div className="flex items-center gap-3 mt-8 p-1 bg-white/[0.03] rounded-full border border-white/[0.06]">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 ${
                billingCycle === "monthly"
                  ? "bg-[#E84855] text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 ${
                billingCycle === "yearly"
                  ? "bg-[#E84855] text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Anual
              <span className="ml-2 text-[9px] text-[#E84855]">-20%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.8 }}
              className={`relative group ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
            >
              <div className={`relative h-full p-8 transition-all duration-500 ${
                plan.popular
                  ? "bg-[#080808] border border-[#E84855]/30"
                  : "bg-[#060606] border border-white/[0.04] hover:border-white/[0.08]"
              }`}>
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-[#E84855] text-white text-[9px] font-bold tracking-[0.2em] uppercase">
                      Mais Popular
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <div className="mb-6">
                  <h3 className="text-[12px] font-bold tracking-[0.3em] text-white/40 uppercase mb-4">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[14px] text-white/30">R$</span>
                    <span className="text-[48px] md:text-[56px] font-bold text-white leading-none tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-[13px] text-white/30">{plan.period}</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[13px] text-white/40 leading-relaxed mb-8 min-h-[60px]">
                  {plan.description}
                </p>

                {/* CTA Button */}
                <button className={`w-full py-4 px-6 text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-3 ${
                  plan.popular
                    ? "bg-[#E84855] text-white hover:bg-[#E84855]/90"
                    : "bg-white/[0.04] text-white/70 border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15]"
                }`}>
                  <span>{plan.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Divider */}
                <div className="h-[1px] bg-white/[0.04] my-8" />

                {/* Features */}
                <div className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#E84855]/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[#E84855]" />
                      </div>
                      <span className="text-[13px] text-white/60">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/[0.03] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] text-white/20">✕</span>
                      </div>
                      <span className="text-[13px] text-white/25">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-[11px] text-white/20 mt-12"
        >
          Todos os planos incluem atualizações gratuitas • Cancele quando quiser
        </motion.p>

      </div>
    </section>
  );
}
