"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { cadastroAction } from "@/app/actions/auth";
import { dictionaries, ValidLang } from "@/app/dictionaries";
import AuthCardContainer from "@/app/components/auth/AuthCardContainer";
import PasswordStrengthMeter, { validatePassword } from "@/app/components/auth/PasswordStrengthMeter";
import VerificationStep from "@/app/components/auth/VerificationStep";
import OnboardingStep from "@/app/components/auth/OnboardingStep";

export default function CadastroPage() {
  const params = useParams();
  const currentLang = (params?.lang as ValidLang) || "pt";
  const dict = dictionaries[currentLang] || dictionaries.pt;
  const authDict = dict.auth;

  const [step, setStep] = useState<"form" | "verify" | "onboarding">("form");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name || !name.trim()) {
      setError("Por favor, informe seu nome completo.");
      return;
    }

    if (!email || !email.trim()) {
      setError("Por favor, informe seu endereço de e-mail.");
      return;
    }

    if (!email.includes("@")) {
      setError(`Por favor, inclua um '@' no endereço de e-mail. '${email}' não contém '@'.`);
      return;
    }

    if (!password) {
      setError("Por favor, defina sua senha.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem. Por favor, verifique.");
      return;
    }

    if (!passwordValidation.isStrong) {
      setError("Por favor, certifique-se de que a senha atenda a todos os requisitos de segurança.");
      return;
    }

    setIsPending(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await cadastroAction(null, formData);
      setIsPending(false);

      if (res?.error) {
        setError(res.error);
      } else if (res?.requiresVerification) {
        setPreviewUrl(res.previewUrl || null);
        setStep("verify");
      }
    } catch (err: any) {
      setIsPending(false);
      setError("Ocorreu um erro no cadastro. Tente novamente.");
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
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight font-sans">
              {authDict?.registerTitle || "Criar nova conta"}
            </h1>
            <p className="text-xs text-white/50">
              {authDict?.registerSubtitle || "Cadastre-se para começar a usar a plataforma"}
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

          {/* Form with noValidate to prevent ugly native browser tooltips */}
          <form noValidate onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider">
                {authDict?.nameLabel || "Nome Completo"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={authDict?.namePlaceholder || "Seu nome"}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider">
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
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                    error && error.includes("e-mail") ? "border-red-500/50" : "border-white/10 focus:border-purple-500/50"
                  }`}
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider">
                {authDict?.passwordLabel || "Sua Senha"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authDict?.passwordPlaceholder || "••••••••"}
                  className="w-full pl-10 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <PasswordStrengthMeter password={password} />
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-white/70 uppercase tracking-wider">
                {authDict?.confirmPasswordLabel || "Confirme sua Senha"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={authDict?.passwordPlaceholder || "••••••••"}
                  className={`w-full pl-10 pr-11 py-2.5 bg-white/5 border rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-500/50"
                      : "border-white/10 focus:border-purple-500/50"
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || (password.length > 0 && !passwordValidation.isStrong)}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{authDict?.submitRegister || "Criar Conta"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="text-center pt-1">
            <p className="text-xs text-white/50">
              {authDict?.hasAccount || "Já possui uma conta?"}{" "}
              <Link
                href={`/${currentLang}/login`}
                className="font-medium text-purple-400 hover:text-purple-300 transition-colors underline"
              >
                {authDict?.loginLink || "Faça login"}
              </Link>
            </p>
          </div>
        </div>
      )}
    </AuthCardContainer>
  );
}
