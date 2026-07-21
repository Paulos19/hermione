"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import { sendVerificationCodeAction, verifyCodeAndLoginAction } from "@/app/actions/auth";

interface VerificationStepProps {
  email: string;
  name?: string;
  onVerified: (userId: string) => void;
  previewUrl?: string | null;
}

export default function VerificationStep({ email, name, onVerified, previewUrl }: VerificationStepProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(previewUrl || null);

  // Countdown timer for 30s resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setCode(digits);
      const lastInput = document.getElementById(`digit-5`);
      lastInput?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Por favor, digite todos os 6 dígitos do código.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    const res = await verifyCodeAndLoginAction(email, fullCode);
    setIsVerifying(false);

    if (res?.error) {
      setError(res.error);
    } else if (res?.success && res.userId) {
      onVerified(res.userId);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);

    const res = await sendVerificationCodeAction(email, name);
    setIsResending(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setCooldown(30);
      setCode(["", "", "", "", "", ""]);
      if (res.previewUrl) {
        setCurrentPreviewUrl(res.previewUrl);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center space-y-6"
    >
      <div className="p-3.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-400">
        <ShieldCheck className="w-8 h-8" />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-white tracking-tight">Verifique seu E-mail</h2>
        <p className="text-sm text-white/50 mt-1">
          Enviamos um código de 6 dígitos para{" "}
          <span className="text-white/90 font-medium">{email}</span>
        </p>
      </div>

      {currentPreviewUrl && (
        <a
          href={currentPreviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-3 py-1.5 rounded-lg border border-violet-500/20"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Ver e-mail de teste no Ethereal &rarr;</span>
        </a>
      )}

      {error && (
        <div className="w-full p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left">
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="w-full space-y-6">
        {/* 6 Digit Inputs */}
        <div className="flex justify-center gap-2 md:gap-3" onPaste={handlePaste}>
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`digit-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-13 md:w-12 md:h-14 bg-zinc-950/80 border border-white/10 rounded-xl text-center text-xl font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-inner"
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isVerifying || code.join("").length !== 6}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          {isVerifying ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Confirmar & Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend Cooldown Section */}
      <div className="pt-2 text-xs text-white/50">
        Não recebeu o código?{" "}
        {cooldown > 0 ? (
          <span className="text-white/80 font-medium">Reenviar em {cooldown}s</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-purple-400 hover:text-purple-300 font-semibold underline disabled:opacity-50 cursor-pointer ml-1"
          >
            {isResending ? "Enviando..." : "Reenviar código"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
