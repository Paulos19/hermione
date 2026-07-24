"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { dictionaries, ValidLang } from "@/app/dictionaries";
import AuthCardContainer from "@/app/components/auth/AuthCardContainer";
import VerificationStep from "@/app/components/auth/VerificationStep";
import OnboardingStep from "@/app/components/auth/OnboardingStep";

export default function LoginPage() {
  const params = useParams();
  const currentLang = (params?.lang as ValidLang) || "pt";
  const dict = dictionaries[currentLang] || dictionaries.pt;
  const authDict = dict.auth;

  const [step, setStep] = useState<"form" | "verify" | "onboarding">("form");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.trim()) {
      setError("Por favor, informe seu endereço de e-mail.");
      return;
    }

    if (!email.includes("@")) {
      setError(`Por favor, inclua um '@' no endereço de e-mail. '${email}' não contém '@'.`);
      return;
    }

    if (!password) {
      setError("Por favor, insira sua senha.");
      return;
    }

    setIsPending(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await loginAction(null, formData);
      setIsPending(false);

      if (res?.error) {
        setError(res.error);
      } else if (res?.requiresVerification) {
        setName(res.name || undefined);
        setUserId(res.userId || null);
        setPreviewUrl(res.previewUrl || null);
        setStep("verify");
      } else if (res?.success) {
        setUserId(res.userId || null);
        setStep("onboarding");
      }
    } catch (err: any) {
      setIsPending(false);
      setError("Ocorreu um erro no login. Tente novamente.");
    }
  };

  const handleVerified = (verifiedUserId: string) => {
    setUserId(verifiedUserId);
    setStep("onboarding");
  };

  return (
    <AuthCardContainer currentLang={currentLang}>
      {step === "verify" && (
        <VerificationStep
          email={email}
          name={name}
          onVerified={handleVerified}
          previewUrl={previewUrl}
        />
      )}

      {step === "onboarding" && userId && (
        <OnboardingStep userId={userId} />
      )}

      {step === "form" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-white tracking-tight font-sans">
              {authDict?.loginTitle || "Bem-vindo de volta"}
            </h1>
            <p className="text-xs md:text-sm text-white/50">
              {authDict?.loginSubtitle || "Insira suas credenciais para acessar sua conta"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium flex items-start gap-2.5 shadow-lg shadow-red-950/20 backdrop-blur-md"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form with noValidate to disable standard white browser popups */}
          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">
                {authDict?.emailLabel || "Endereço de E-mail"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={authDict?.emailPlaceholder || "seuemail@exemplo.com"}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                    error && error.includes("e-mail") ? "border-red-500/50" : "border-white/10 focus:border-purple-500/50"
                  }`}
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/70">
                  {authDict?.passwordLabel || "Sua Senha"}
                </label>
                <Link
                  href={`/${currentLang}/forgot-password`}
                  className="text-[11px] font-medium text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Esqueci a senha
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authDict?.passwordPlaceholder || "••••••••"}
                  className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{authDict?.submitLogin || "Entrar na conta"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Cadastro */}
          <div className="text-center pt-2">
            <p className="text-xs text-white/50">
              {authDict?.noAccount || "Não tem uma conta?"}{" "}
              <Link
                href={`/${currentLang}/cadastro`}
                className="font-medium text-purple-400 hover:text-purple-300 transition-colors underline"
              >
                {authDict?.signUpLink || "Cadastre-se grátis"}
              </Link>
            </p>
          </div>
        </div>
      )}
    </AuthCardContainer>
  );
}
