import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, Globe, FileText, Clock, Minus, Plus, ChevronUp } from "lucide-react";
import { dict } from "@/lib/dictionaries"
import { Locale as Language } from "@/lib/i18n-config";

import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";

interface StatusBarProps {
  wordCount: number;
  readingTime: string;
  isSynced: boolean;
  lang: Language;
}

export default function StatusBar({ wordCount, readingTime, isSynced, lang }: StatusBarProps) {
  const t = dict[lang].statusBar;
  return (
    <footer className="h-[36px] bg-white dark:bg-[#0E1318] border-t border-gray-200 dark:border-white/5 flex items-center justify-between px-4 shrink-0 text-xs text-gray-500 dark:text-[#8A94A0]">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 hover:text-gray-900 dark:text-[#F5F5F5] cursor-pointer transition-colors">
          <FileText className="w-3.5 h-3.5" />
          <span>{wordCount.toLocaleString()} {t.words}</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-gray-900 dark:text-[#F5F5F5] cursor-pointer transition-colors">
          <Clock className="w-3.5 h-3.5" />
          <span>{readingTime.replace('min', t.min)}</span>
        </div>
      </div>

      {/* Center - Empty/Status */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className={`w-3.5 h-3.5 ${isSynced ? "text-[#22C55E]" : "text-[#FF6B6B]"}`} />
        <span className="text-gray-900 dark:text-[#F5F5F5] font-medium">{isSynced ? t.saved : t.unsaved}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <LanguageSwitcher currentLang={lang} />
        
        <div className="w-px h-3 bg-white/10" />
        
        {/* Zoom Control */}
        <div className="flex items-center gap-2">
          <button className="hover:text-gray-900 dark:text-[#F5F5F5] transition-colors">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center">100%</span>
          <button className="hover:text-gray-900 dark:text-[#F5F5F5] transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}


