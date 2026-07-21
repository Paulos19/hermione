import React from "react";
import { CheckCircle2, FileText, Clock, Minus, Plus } from "lucide-react";
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
    <footer className="h-[36px] bg-white dark:bg-[#0E1318] border-t border-gray-200 dark:border-white/5 flex items-center justify-between px-3 md:px-4 shrink-0 text-[11px] md:text-xs text-gray-500 dark:text-[#8A94A0] whitespace-nowrap overflow-x-auto custom-scrollbar select-none z-30">
      {/* Left: Word count & reading time */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <div className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-[#F5F5F5] cursor-pointer transition-colors">
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>{wordCount.toLocaleString()} {t.words}</span>
        </div>
        <div className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-[#F5F5F5] cursor-pointer transition-colors">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{readingTime.replace('min', t.min)}</span>
        </div>
      </div>

      {/* Center: Save Status */}
      <div className="flex items-center gap-1.5 shrink-0 mx-2">
        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isSynced ? "text-[#22C55E]" : "text-[#FF6B6B]"}`} />
        <span className="text-gray-900 dark:text-[#F5F5F5] font-medium hidden sm:inline">{isSynced ? t.saved : t.unsaved}</span>
      </div>

      {/* Right: Language switcher & Zoom */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <LanguageSwitcher currentLang={lang} />
        
        <div className="hidden sm:block w-px h-3 bg-gray-200 dark:bg-white/10" />
        
        {/* Zoom Control (Hidden on tiny screens) */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button className="hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors p-0.5">
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-7 text-center text-[10px] md:text-xs">100%</span>
          <button className="hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors p-0.5">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
