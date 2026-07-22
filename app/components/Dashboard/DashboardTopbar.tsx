"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import Link from "next/link"
import { Search, Bell, Cloud, Moon, Sun, User, LogOut, Menu, BookOpen, FileText, CreditCard, Sparkles } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher"
import { Locale } from "@/lib/i18n-config"
import { dict } from "@/lib/dictionaries"
import { searchGlobalAction, SearchResult } from "@/app/actions/search"
import { useRouter } from "next/navigation"

interface TopbarProps {
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
  lang: string
  userImage?: string | null
  onOpenMobileMenu?: () => void
}

export function DashboardTopbar({ theme = 'dark', onToggleTheme, lang, userImage, onOpenMobileMenu }: TopbarProps) {
  const t = dict[lang as Locale].dashboard
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
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

  return (
    <header className="h-[64px] bg-white dark:bg-[#10151B] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-40">
      
      {/* Mobile Hamburger Menu Toggle */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-[#8A94A0] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#141A22] transition-colors"
            title="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-[420px] mx-2 md:mx-4" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-[#8A94A0]" />
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
            className="w-full bg-gray-50 dark:bg-[#141A22] border border-gray-200 dark:border-white/5 rounded-xl pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-[13px] md:text-[14px] text-gray-900 dark:text-[#F5F5F5] placeholder:text-gray-500 dark:placeholder:text-[#8A94A0] focus:outline-none focus:border-violet-600/50 dark:focus:border-[#B899FF]/50 focus:ring-1 focus:ring-violet-600/50 dark:focus:ring-[#B899FF]/50 transition-all"
          />
          
          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full mt-2 w-full max-h-[300px] overflow-y-auto bg-white dark:bg-[#141A22] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50">
              {isPending ? (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-[#8A94A0]">Buscando...</div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((res) => (
                    <button
                      key={`${res.type}-${res.id}`}
                      onClick={() => handleResultClick(res)}
                      className="w-full flex flex-col text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#181F28] transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {res.type === 'book' ? (
                          <BookOpen className="w-4 h-4 text-violet-600 dark:text-[#B899FF]" />
                        ) : (
                          <FileText className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-[#F5F5F5] text-[14px]">{res.title}</span>
                      </div>
                      {res.snippet && (
                        <p className="text-[12px] text-gray-500 dark:text-[#8A94A0] line-clamp-2 pl-6">
                          {res.snippet}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-[#8A94A0]">Nenhum resultado encontrado</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Sync Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-[#141A22] border border-gray-200 dark:border-white/5">
          <Cloud className="w-3.5 h-3.5 text-[#22C55E]" />
          <span className="text-[12px] font-medium text-gray-500 dark:text-[#8A94A0]">{t.synced}</span>
        </div>
        
        <LanguageSwitcher currentLang={lang as Locale} />
        
        <button className="p-2 rounded-xl text-gray-500 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#141A22] transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        
        <button onClick={onToggleTheme} className="p-2 rounded-xl text-gray-500 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#141A22] transition-colors">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-white/5 mx-0.5" />

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#141A22] border border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-900 dark:text-[#F5F5F5] hover:border-gray-300 dark:hover:border-white/20 transition-colors overflow-hidden"
          >
            {userImage ? (
              <img src={userImage} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#10151B] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl shadow-black/20 p-1.5 z-50">
              
              <Link
                href={`/${lang}/configuracoes?tab=account`}
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4 text-violet-500 dark:text-[#B899FF]" />
                <span>Meu Perfil</span>
              </Link>

              <Link
                href={`/${lang}/configuracoes?tab=billings`}
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Billings & Assinatura</span>
              </Link>

              <Link
                href={`/${lang}/configuracoes?tab=rag`}
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Contexto RAG</span>
              </Link>

              <div className="my-1.5 h-px bg-gray-100 dark:bg-white/5" />

              <button 
                onClick={async () => {
                  setIsDropdownOpen(false)
                  await logoutAction()
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
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

