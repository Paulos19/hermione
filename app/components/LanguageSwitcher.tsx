"use client"

import { usePathname, useRouter } from "next/navigation"
import { i18n, Locale } from "@/lib/i18n-config"
import { Globe } from "lucide-react"
import { useState, useRef, useEffect } from "react"

const languageNames: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
}

export function LanguageSwitcher({ currentLang }: { currentLang: Locale }) {
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
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg text-[var(--theme-text-muted)] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#141A22] transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-medium uppercase">{currentLang}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-xl shadow-xl overflow-hidden z-50">
          <div className="py-1">
            {i18n.locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLanguage(locale)}
                className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                  currentLang === locale 
                    ? "text-[var(--theme-accent)] bg-violet-50 dark:bg-[#181F28] font-medium" 
                    : "text-[var(--theme-text-muted)] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-[#F5F5F5]"
                }`}
              >
                {languageNames[locale]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
