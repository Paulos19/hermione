"use client";

import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password?: string;
}

export function validatePassword(password: string) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
  const isStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    score,
    isStrong,
  };
}

export default function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const { hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial, score } = validatePassword(password);

  const getMeterColor = () => {
    if (score <= 2) return "bg-red-500";
    if (score <= 4) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getMeterLabel = () => {
    if (score <= 2) return "Fraca";
    if (score <= 4) return "Média";
    return "Forte";
  };

  const rules = [
    { label: "Mínimo 8 caracteres", met: hasMinLength },
    { label: "Letra maiúscula (A-Z)", met: hasUppercase },
    { label: "Letra minúscula (a-z)", met: hasLowercase },
    { label: "Número (0-9)", met: hasNumber },
    { label: "Símbolo especial (@!#$%)", met: hasSpecial },
  ];

  return (
    <div className="space-y-3 mt-2 text-xs">
      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-full flex-1 transition-all duration-300 ${
                level <= score ? getMeterColor() : "bg-transparent"
              }`}
            />
          ))}
        </div>
        <span className="text-white/60 text-[11px] font-medium min-w-[40px] text-right">
          {getMeterLabel()}
        </span>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        {rules.map((rule) => (
          <div key={rule.label} className="flex items-center gap-1.5">
            {rule.met ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <X className="w-3 h-3 text-white/30 shrink-0" />
            )}
            <span className={rule.met ? "text-emerald-300/90 font-medium" : "text-white/40"}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
