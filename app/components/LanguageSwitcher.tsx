"use client"

import { usePathname, useRouter } from "next/navigation"
import { i18n, Locale } from "@/lib/i18n-config"
import { Globe, Check, ChevronUp } from "lucide-react"
import { useState, useRef, useEffect } from "react"

const languageNames: Record<Locale, { label: string; flag: string }> = {
  pt: { label: "Português", flag: "🇧🇷" },
  en: { label: "English", flag: "🇺🇸" },
  es: { label: "Español", flag: "🇪🇸" },
}

interface LanguageSwitcherProps {
  currentLang: Locale;
  dropDirection?: "up" | "down";
}

export function LanguageSwitcher({ currentLang, dropDirection = "up" }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLanguage = (newLocale: Locale) => {
    // Save preference to cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`

    if (!pathname) return

    // Strip current locale from pathname and redirect
    const segments = pathname.split('/')
    if (i18n.locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale
    } else {
      segments.splice(1, 0, newLocale)
    }

    const newUrl = segments.join('/') || '/'
    router.push(newUrl)
    setIsOpen(false)
  }

  const isUp = dropDirection === "up";

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)] transition-colors border border-transparent hover:border-[var(--theme-border-subtle)]"
        title="Alterar Idioma do Sistema"
      >
        <Globe className="w-3.5 h-3.5 text-[var(--theme-accent,#3b82f6)]" />
        <span className="uppercase font-semibold tracking-wider text-[11px] text-[var(--theme-text-main)]">{currentLang}</span>
        <ChevronUp className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute right-0 ${
            isUp ? "bottom-full mb-2" : "top-full mt-2"
          } w-40 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-2xl overflow-hidden z-[100] p-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100`}
        >
          <div className="text-[9px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider px-2 py-1 border-b border-[var(--theme-border-subtle)] mb-1">
            Idioma / Language
          </div>
          <div className="flex flex-col gap-0.5">
            {i18n.locales.map((locale) => {
              const langInfo = languageNames[locale] || { label: locale, flag: "🌐" };
              const isActive = currentLang === locale;
              return (
                <button
                  key={locale}
                  onClick={() => switchLanguage(locale)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive 
                      ? "text-[var(--theme-accent,#3b82f6)] bg-[var(--theme-accent,#3b82f6)]/15 font-semibold" 
                      : "text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{langInfo.flag}</span>
                    <span>{langInfo.label}</span>
                  </span>
                  {isActive && <Check className="w-3.5 h-3.5 text-[var(--theme-accent,#3b82f6)]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}
