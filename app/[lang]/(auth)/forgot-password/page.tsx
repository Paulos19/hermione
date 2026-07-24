"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { requestPasswordResetAction } from "@/app/actions/auth";
import { dictionaries, ValidLang } from "@/app/dictionaries";
import AuthCardContainer from "@/app/components/auth/AuthCardContainer";

export default function ForgotPasswordPage() {
  const params = useParams();
  const currentLang = (params?.lang as ValidLang) || "pt";
  const dict = dictionaries[currentLang] || dictionaries.pt;

  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !email.trim()) {
      setError("Por favor, informe seu endereço de e-mail.");
      return;
    }

    if (!email.includes("@")) {
      setError(`Por favor, inclua um '@' no endereço de e-mail. '${email}' não contém '@'.`);
      return;
    }

    setIsPending(true);

    try {
      const res = await requestPasswordResetAction(email);
      setIsPending(false);

      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.message || "E-mail de redefinição enviado com sucesso.");
      }
    } catch (err: any) {
      setIsPending(false);
      setError("Ocorreu um erro ao processar sua solicitação. Tente novamente.");
    }
  };

  return (
    <AuthCardContainer currentLang={currentLang}>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-white tracking-tight font-sans">
            Esqueci a Senha
          </h1>
          <p className="text-xs md:text-sm text-white/50">
            Digite seu e-mail para receber um link de redefinição
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

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-xs font-medium flex items-start gap-2.5 shadow-lg shadow-green-950/20 backdrop-blur-md"
            >
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!success ? (
          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70">
                Endereço de E-mail
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                    error ? "border-red-500/50" : "border-white/10 focus:border-purple-500/50"
                  }`}
                />
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
                  <span>Enviar link de redefinição</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="pt-2">
            <Link
              href={`/${currentLang}/login`}
              className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Voltar para o login
            </Link>
          </div>
        )}

        {/* Switch to Login */}
        {!success && (
          <div className="text-center pt-2">
            <p className="text-xs text-white/50">
              Lembrou sua senha?{" "}
              <Link
                href={`/${currentLang}/login`}
                className="font-medium text-purple-400 hover:text-purple-300 transition-colors underline"
              >
                Faça login
              </Link>
            </p>
          </div>
        )}
      </div>
    </AuthCardContainer>
  );
}
