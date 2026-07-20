import React, { useState, useRef, useEffect } from "react";
import { Search, Cloud, CloudOff, Sun, Moon, User, ChevronDown, LogOut, LayoutDashboard, PanelTopClose, PanelTopOpen } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { dict } from "@/lib/dictionaries"
import { Locale as Language } from "@/lib/i18n-config";

interface TopbarProps {
  bookTitle: string;
  isSynced: boolean;
  isRibbonOpen: boolean;
  onToggleRibbon: () => void;
  lang: Language;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Topbar({ bookTitle, isSynced, isRibbonOpen, onToggleRibbon, lang, theme, onToggleTheme }: TopbarProps) {
  const t = dict[lang].topbar;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <header className="h-[56px] bg-white dark:bg-[#0E1318] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 shrink-0 text-gray-900 dark:text-[#F5F5F5] transition-colors duration-200">
      {/* Left: Logo & Book Title */}
      <div className="flex items-center gap-4 flex-1">
        <div className="w-8 h-8 bg-gray-100 dark:bg-white/10 rounded-lg flex items-center justify-center">
          <span className="font-bold text-violet-600 dark:text-[#B899FF]">H</span>
        </div>
        <h1 
          className="font-semibold text-lg truncate max-w-[300px]" 
          style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
        >
          {bookTitle}
        </h1>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-[380px] flex items-center justify-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#8A94A0]" />
          <input
            type="text"
            placeholder={t.search}
            className="w-full h-[32px] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-md pl-9 pr-3 text-sm text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#8A94A0] focus:outline-none focus:ring-1 focus:ring-violet-500 dark:focus:ring-[#B899FF] transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-4 flex-1 text-gray-500 dark:text-[#8A94A0]">
        <div className="flex items-center gap-2 text-xs">
          {isSynced ? (
            <>
              <Cloud className="w-4 h-4 text-[#22C55E]" />
              <span>{t.saved}</span>
            </>
          ) : (
            <>
              <CloudOff className="w-4 h-4 text-[#FF6B6B]" />
              <span>{t.syncing}</span>
            </>
          )}
        </div>
        
        <div className="w-px h-4 bg-gray-200 dark:bg-white/10" />
        
        <button 
          onClick={onToggleRibbon}
          className="hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
          title={isRibbonOpen ? t.hideRibbon : t.showRibbon}
        >
          {isRibbonOpen ? <PanelTopClose className="w-4 h-4" /> : <PanelTopOpen className="w-4 h-4" />}
        </button>
        
        <button 
          onClick={onToggleTheme}
          className="hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/5 py-1 px-2 rounded-md transition-colors"
          >
            <div className="w-6 h-6 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
              <User className="w-3 h-3 text-gray-700 dark:text-[#F5F5F5]" />
            </div>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#11161D] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden z-50 text-sm">
              <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">{t.myAccount}</p>
              </div>
              <div className="p-1">
                <Link 
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-50 dark:hover:bg-white/5 rounded-md transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t.dashboard}
                </Link>
                <form action={logoutAction}>
                  <button 
                    type="submit"
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-500 dark:text-[#FF6B6B] hover:text-red-600 dark:hover:text-[#FF8F8F] hover:bg-gray-50 dark:hover:bg-white/5 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.signOut}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

