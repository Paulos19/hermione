import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, FileText, Clock, Minus, Plus, RotateCcw, ChevronUp } from "lucide-react";
import { dict } from "@/lib/dictionaries"
import { Locale as Language } from "@/lib/i18n-config";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";

interface StatusBarProps {
  wordCount: number;
  readingTime: string;
  isSynced: boolean;
  lang: Language;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  setZoomLevel: (level: number) => void;
}

export default function StatusBar({ 
  wordCount, 
  readingTime, 
  isSynced, 
  lang,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  setZoomLevel
}: StatusBarProps) {
  const t = dict[lang].statusBar;
  const [isZoomMenuOpen, setIsZoomMenuOpen] = useState(false);
  const zoomRef = useRef<HTMLDivElement>(null);

  const zoomPresets = [50, 75, 90, 100, 125, 150, 175, 200];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (zoomRef.current && !zoomRef.current.contains(event.target as Node)) {
        setIsZoomMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <footer className="h-[34px] bg-[var(--theme-bg-surface)]/95 backdrop-blur-md border-t border-[var(--theme-border-subtle)] flex items-center justify-between px-2 sm:px-3 md:px-5 shrink-0 text-xs text-[var(--theme-text-muted)] select-none relative z-40">
      {/* Left: Manuscript word count & reading time */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-5 shrink-0">
        <div 
          className="flex items-center gap-1 sm:gap-1.5 hover:text-[var(--theme-text-main)] transition-colors cursor-default"
          title="Contagem total de palavras no capítulo ativo"
        >
          <FileText className="w-3.5 h-3.5 text-[var(--theme-accent,#3b82f6)] shrink-0" />
          <span className="font-semibold text-[var(--theme-text-main)]">{wordCount.toLocaleString()}</span>
          <span className="hidden xs:inline">{t.words}</span>
        </div>

        <div className="hidden xs:block w-px h-3 bg-[var(--theme-border-subtle)]" />

        <div 
          className="hidden xs:flex items-center gap-1.5 hover:text-[var(--theme-text-main)] transition-colors cursor-default"
          title="Tempo estimado de leitura (aprox. 200 palavras/min)"
        >
          <Clock className="w-3.5 h-3.5 text-[var(--theme-text-muted)] shrink-0" />
          <span>{readingTime.replace('min', t.min)}</span>
        </div>
      </div>

      {/* Center: Save Sync Status */}
      <div className="flex items-center gap-1.5 shrink-0 mx-1 sm:mx-2" title={isSynced ? t.saved : t.unsaved}>
        <div className={`w-2 h-2 rounded-full ${isSynced ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-amber-400 animate-pulse"}`} />
        <span className={`text-xs font-medium hidden sm:inline ${isSynced ? "text-emerald-500" : "text-amber-400"}`}>
          {isSynced ? t.saved : t.unsaved}
        </span>
      </div>

      {/* Right: Language Switcher & Interactive Zoom Control */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <LanguageSwitcher currentLang={lang} />
        
        <div className="w-px h-3 bg-[var(--theme-border-subtle)]" />
        
        {/* Interactive Zoom Control Suite */}
        <div className="relative flex items-center gap-1 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-lg px-1.5 py-0.5" ref={zoomRef}>
          {/* Zoom Out Button */}
          <button 
            onClick={onZoomOut}
            disabled={zoomLevel <= 50}
            className="p-1 rounded text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Diminuir Zoom (-10%)"
          >
            <Minus className="w-3 h-3" />
          </button>

          {/* Interactive Zoom Percentage Dropdown Trigger */}
          <button
            onClick={() => setIsZoomMenuOpen(!isZoomMenuOpen)}
            className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface)] flex items-center gap-1 transition-colors"
            title="Clique para alterar a escala de Zoom"
          >
            <span>{zoomLevel}%</span>
            <ChevronUp className={`w-3 h-3 text-[var(--theme-text-muted)] transition-transform ${isZoomMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Zoom In Button */}
          <button 
            onClick={onZoomIn}
            disabled={zoomLevel >= 200}
            className="p-1 rounded text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Aumentar Zoom (+10%)"
          >
            <Plus className="w-3 h-3" />
          </button>

          {/* Reset Zoom Button (when zoom is not 100%) */}
          {zoomLevel !== 100 && (
            <button
              onClick={onResetZoom}
              className="p-1 rounded text-[var(--theme-accent,#3b82f6)] hover:bg-[var(--theme-accent,#3b82f6)]/10 transition-colors ml-0.5"
              title="Restaurar Zoom Padrão (100%)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}

          {/* Zoom Level Dropdown Menu */}
          {isZoomMenuOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-32 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-2xl p-1 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[9px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider px-2 py-1 border-b border-[var(--theme-border-subtle)] mb-1">
                Escala de Zoom
              </div>
              <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                {zoomPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setZoomLevel(preset);
                      setIsZoomMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-2 py-1 rounded-lg text-xs font-mono transition-colors ${
                      zoomLevel === preset 
                        ? 'bg-[var(--theme-accent,#3b82f6)] text-white font-bold' 
                        : 'hover:bg-[var(--theme-bg-surface)] text-[var(--theme-text-main)]'
                    }`}
                  >
                    <span>{preset}%</span>
                    {preset === 100 && <span className="text-[9px] opacity-70 font-sans">Padrão</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
