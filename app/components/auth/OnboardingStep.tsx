"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User as UserIcon, Camera, Check, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { updateOnboardingProfileAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

interface OnboardingStepProps {
  userId: string;
  onFinish?: () => void;
}

export default function OnboardingStep({ userId, onFinish }: OnboardingStepProps) {
  const router = useRouter();
  const [step, setStep] = useState<"avatar" | "plan">("avatar");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"free" | "pro" | "premium">("free");
  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await updateOnboardingProfileAction(userId, {
        image: imageUrl || undefined,
        plan: selectedPlan,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
      if (onFinish) onFinish();
      router.push("/dashboard");
    }
  };

  const handleSkip = async () => {
    if (onFinish) onFinish();
    router.push("/dashboard");
  };

  const plans = [
    {
      id: "free",
      name: "Grátis",
      price: "R$ 0",
      description: "Ideal para testar o ecossistema e dar os primeiros passos.",
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "R$ 29",
      period: "/mês",
      description: "Para autores dedicados com inteligência artificial e sincronização avançada.",
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 69",
      period: "/mês",
      description: "A experiência definitiva sem nenhum limite criativo.",
      popular: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col space-y-6 text-center"
    >
      {/* Header Progress Indicators */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span className={`px-2 py-0.5 rounded-full ${step === "avatar" ? "bg-purple-500/20 text-purple-300 font-semibold" : "bg-white/5"}`}>
            1. Perfil
          </span>
          <span>&rarr;</span>
          <span className={`px-2 py-0.5 rounded-full ${step === "plan" ? "bg-purple-500/20 text-purple-300 font-semibold" : "bg-white/5"}`}>
            2. Plano
          </span>
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          Pular por enquanto &rarr;
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === "avatar" ? (
          <motion.div
            key="avatar-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col items-center space-y-6"
          >
            <div>
              <h2 className="text-2xl font-semibold text-white tracking-tight">Foto de Perfil</h2>
              <p className="text-xs text-white/50 mt-1">
                Adicione uma foto para personalizar sua experiência como autor
              </p>
            </div>

            {/* Avatar Preview */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 overflow-hidden flex items-center justify-center shadow-xl">
                {imageUrl ? (
                  <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-10 h-10 text-white/30" />
                )}
              </div>

              {/* Upload Button */}
              <div className="mt-4">
                <UploadButton
                  endpoint="profileImage"
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      setImageUrl(res[0].url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.error("Upload error:", error);
                  }}
                  appearance={{
                    button: "px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-medium text-white rounded-xl border border-white/10 transition-colors cursor-pointer",
                    allowedContent: "hidden",
                  }}
                />
              </div>
            </div>

            <div className="w-full flex items-center gap-3 pt-4">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 text-xs font-medium transition-colors cursor-pointer"
              >
                Pular Foto
              </button>
              <button
                onClick={() => setStep("plan")}
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Próximo Passo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="plan-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center space-y-6"
          >
            <div>
              <h2 className="text-2xl font-semibold text-white tracking-tight">Escolha seu Plano</h2>
              <p className="text-xs text-white/50 mt-1">
                Você pode começar no plano gratuito ou escolher uma assinatura
              </p>
            </div>

            {/* Plans List */}
            <div className="w-full space-y-3">
              {plans.map((p) => {
                const selected = selectedPlan === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id as any)}
                    className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      selected
                        ? "bg-purple-500/10 border-purple-500 shadow-md shadow-purple-500/10"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute top-3 right-3 text-[10px] font-semibold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" /> RECOMENDADO
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          {p.name}
                          {selected && <CheckCircle className="w-4 h-4 text-purple-400" />}
                        </h4>
                        <p className="text-xs text-white/50 mt-0.5">{p.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-white">{p.price}</span>
                        {p.period && <span className="text-xs text-white/40">{p.period}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="w-full flex items-center gap-3 pt-2">
              <button
                onClick={() => setStep("avatar")}
                className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 text-xs font-medium transition-colors cursor-pointer"
              >
                &larr; Voltar
              </button>
              <button
                onClick={handleFinish}
                disabled={isSaving}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Salvando..." : "Concluir e Ir para o Editor"}
                <Check className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
