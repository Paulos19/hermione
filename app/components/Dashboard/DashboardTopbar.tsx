"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Bell, Cloud, Moon, Sun, User, LogOut } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher"
import { Locale } from "@/lib/i18n-config"
import { dict } from "@/lib/dictionaries"

interface TopbarProps {
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
  lang: string
}

export function DashboardTopbar({ theme = 'dark', onToggleTheme, lang }: TopbarProps) {
  const t = dict[lang as Locale].dashboard
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="h-[64px] bg-white dark:bg-[#10151B] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 shrink-0">
      
      {/* Global Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-[420px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-[#8A94A0]" />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            className="w-full bg-gray-50 dark:bg-[#141A22] border border-gray-200 dark:border-white/5 rounded-lg pl-10 pr-4 py-2 text-[14px] text-gray-900 dark:text-[#F5F5F5] placeholder:text-gray-500 dark:placeholder:text-[#8A94A0] focus:outline-none focus:border-violet-600/50 dark:focus:border-[#B899FF]/50 focus:ring-1 focus:ring-violet-600/50 dark:focus:ring-[#B899FF]/50 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-[#141A22] border border-gray-200 dark:border-white/5">
          <Cloud className="w-3.5 h-3.5 text-[#22C55E]" />
          <span className="text-[12px] font-medium text-gray-500 dark:text-[#8A94A0]">{t.synced}</span>
        </div>
        
        <LanguageSwitcher currentLang={lang as Locale} />
        
        <button className="p-2 rounded-lg text-gray-500 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#141A22] transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        
        <button onClick={onToggleTheme} className="p-2 rounded-lg text-gray-500 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#141A22] transition-colors">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-white/5 mx-1" />

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#141A22] border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-900 dark:text-[#F5F5F5] hover:border-gray-300 dark:hover:border-white/20 transition-colors"
          >
            <User className="w-4 h-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#10151B] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg shadow-black/10 py-1 z-50">
              <button 
                onClick={async () => {
                  setIsDropdownOpen(false)
                  await logoutAction()
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-[14px] text-gray-700 dark:text-[#F5F5F5] hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

