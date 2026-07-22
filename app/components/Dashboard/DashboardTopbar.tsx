"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import Link from "next/link"
import { Search, Bell, Cloud, User, LogOut, Menu, BookOpen, FileText, CreditCard, Sparkles, Palette, Check } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher"
import { Locale } from "@/lib/i18n-config"
import { dict } from "@/lib/dictionaries"
import { searchGlobalAction, SearchResult } from "@/app/actions/search"
import { useRouter } from "next/navigation"
import { useTheme, ThemeType } from "@/app/providers/ThemeProvider"

interface TopbarProps {
  lang: string
  userImage?: string | null
  onOpenMobileMenu?: () => void
}

export function DashboardTopbar({ lang, userImage, onOpenMobileMenu }: TopbarProps) {
  const t = dict[lang as Locale].dashboard
  const { theme, setTheme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        startTransition(async () => {
          try {
            const results = await searchGlobalAction(searchQuery)
            setSearchResults(results)
            setIsSearchOpen(true)
          } catch (e) {
            console.error(e)
          }
        })
      } else {
        setSearchResults([])
        setIsSearchOpen(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleResultClick = (result: SearchResult) => {
    setIsSearchOpen(false)
    setSearchQuery("")
    if (result.type === 'book') {
      router.push(`/${lang}/editor/${result.id}`)
    } else if (result.type === 'document' && result.bookId) {
      router.push(`/${lang}/editor/${result.bookId}?docId=${result.id}&search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const themeOptions: { id: ThemeType; label: string; bg: string; accent: string }[] = [
    { id: 'light', label: 'Light', bg: '#FFFFFF', accent: '#2563EB' },
    { id: 'dark', label: 'Dark', bg: '#0A0D12', accent: '#3B82F6' },
    { id: 'ocean', label: 'Ocean', bg: '#060d16', accent: '#0EA5E9' },
    { id: 'dracula', label: 'Dracula', bg: '#110E1B', accent: '#8B5CF6' },
    { id: 'sunset', label: 'Sunset', bg: '#1C1010', accent: '#F97316' },
    { id: 'desert', label: 'Desert', bg: '#1C1A14', accent: '#EAB308' },
  ]

  return (
    <header className="h-[64px] bg-[var(--theme-bg-surface)] border-b border-[var(--theme-border-subtle)] flex items-center justify-between px-4 md:px-8 shrink-0 relative z-40">
      
      {/* Mobile Hamburger Menu Toggle */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)] transition-colors"
            title="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-[420px] mx-2 md:mx-4" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (e.target.value.trim() === "") setIsSearchOpen(false)
            }}
            onFocus={() => {
              if (searchResults.length > 0) setIsSearchOpen(true)
            }}
            placeholder={t.searchPlaceholder || "Search..."} 
            className="w-full bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-xl pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-[13px] md:text-[14px] text-[var(--theme-text-main)] placeholder:text-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-accent)]/50 focus:ring-1 focus:ring-[var(--theme-accent)]/50 transition-all"
          />
          
          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full mt-2 w-full max-h-[300px] overflow-y-auto bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-xl shadow-xl z-50">
              {isPending ? (
                <div className="p-4 text-center text-sm text-[var(--theme-text-muted)]">Buscando...</div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((res) => (
                    <button
                      key={`${res.type}-${res.id}`}
                      onClick={() => handleResultClick(res)}
                      className="w-full flex flex-col text-left px-4 py-2 hover:bg-[var(--theme-bg-surface)] transition-colors border-b border-[var(--theme-border-subtle)] last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {res.type === 'book' ? (
                          <BookOpen className="w-4 h-4 text-[var(--theme-accent)]" />
                        ) : (
                          <FileText className="w-4 h-4 text-emerald-500" />
                        )}
                        <span className="font-medium text-[var(--theme-text-main)] text-[14px]">{res.title}</span>
                      </div>
                      {res.snippet && (
                        <p className="text-[12px] text-[var(--theme-text-muted)] line-clamp-2 pl-6">
                          {res.snippet}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-[var(--theme-text-muted)]">Nenhum resultado encontrado</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Sync Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)]">
          <Cloud className="w-3.5 h-3.5 text-[#22C55E]" />
          <span className="text-[12px] font-medium text-[var(--theme-text-muted)]">{t.synced}</span>
        </div>
        
        <LanguageSwitcher currentLang={lang as Locale} />
        
        <button className="p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)] transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        
        {/* Theme Selector Popover */}
        <div className="relative" ref={themeRef}>
          <button 
            onClick={() => setIsThemeOpen(!isThemeOpen)} 
            className="p-2 rounded-xl text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)] transition-colors"
          >
            <Palette className="w-4 h-4" />
          </button>
          
          {isThemeOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-2xl shadow-xl p-3 z-50">
              <div className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-3 px-1">Temas do Sistema</div>
              <div className="grid grid-cols-2 gap-2">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTheme(opt.id)
                      setIsThemeOpen(false)
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${theme === opt.id ? 'border-[var(--theme-accent)] bg-[var(--theme-accent-light)]' : 'border-transparent hover:bg-[var(--theme-bg-surface-elevated)]'}`}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border border-black/10 dark:border-white/10 shrink-0 relative overflow-hidden flex items-center justify-center"
                      style={{ backgroundColor: opt.bg }}
                    >
                      <div className="absolute inset-0 opacity-20" style={{ backgroundColor: opt.accent }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.accent }} />
                    </div>
                    <span className={`text-xs font-medium ${theme === opt.id ? 'text-[var(--theme-accent)]' : 'text-[var(--theme-text-main)]'}`}>{opt.label}</span>
                    {theme === opt.id && <Check className="w-3 h-3 text-[var(--theme-accent)] ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-[var(--theme-border-subtle)] mx-0.5" />

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 rounded-full bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] flex items-center justify-center text-[var(--theme-text-main)] hover:border-[var(--theme-border)] transition-colors overflow-hidden"
          >
            {userImage ? (
              <img src={userImage} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-2xl shadow-xl p-1.5 z-50">
              
              <Link
                href={`/${lang}/configuracoes?tab=account`}
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)] transition-colors"
              >
                <User className="w-4 h-4 text-[var(--theme-accent)]" />
                <span>Meu Perfil</span>
              </Link>

              <Link
                href={`/${lang}/configuracoes?tab=billings`}
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)] transition-colors"
              >
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>Billings & Assinatura</span>
              </Link>

              <Link
                href={`/${lang}/configuracoes?tab=rag`}
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Contexto RAG</span>
              </Link>

              <div className="my-1.5 h-px bg-[var(--theme-border-subtle)]" />

              <button 
                onClick={async () => {
                  setIsDropdownOpen(false)
                  await logoutAction()
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

