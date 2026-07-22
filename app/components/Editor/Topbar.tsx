import React, { useState, useRef, useEffect } from "react";
import { Search, Cloud, CloudOff, Sun, Moon, User, ChevronDown, LogOut, LayoutDashboard, PanelTopClose, PanelTopOpen, Menu, Edit2, Check, X } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { renomearLivroAction } from "@/app/actions/book";
import { dict } from "@/lib/dictionaries"
import { Locale as Language } from "@/lib/i18n-config";
import { toast } from "sonner";

interface TopbarProps {
  bookId: string;
  bookTitle: string;
  setBookTitle: (title: string) => void;
  isSynced: boolean;
  isRibbonOpen: boolean;
  onToggleRibbon: () => void;
  lang: Language;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleLeftSidebar?: () => void;
}

export default function Topbar({ 
  bookId,
  bookTitle, 
  setBookTitle,
  isSynced, 
  isRibbonOpen, 
  onToggleRibbon, 
  lang, 
  theme, 
  onToggleTheme,
  onToggleLeftSidebar
}: TopbarProps) {
  const t = dict[lang].topbar;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(bookTitle);
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  useEffect(() => {
    setEditTitleValue(bookTitle);
  }, [bookTitle]);

  const handleSaveTitle = async () => {
    if (!editTitleValue.trim()) {
      setIsEditingTitle(false);
      setEditTitleValue(bookTitle);
      return;
    }
    
    if (editTitleValue.trim() === bookTitle) {
      setIsEditingTitle(false);
      return;
    }

    setIsSavingTitle(true);
    try {
      await renomearLivroAction(bookId, editTitleValue.trim());
      setBookTitle(editTitleValue.trim());
      toast.success("Nome do livro salvo com sucesso!");
      setIsEditingTitle(false);
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar nome do livro.");
      setEditTitleValue(bookTitle);
    } finally {
      setIsSavingTitle(false);
    }
  };

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
    <header className="h-[56px] bg-white dark:bg-[#0E1318] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-3 md:px-4 shrink-0 text-gray-900 dark:text-[#F5F5F5] transition-colors duration-200">
      
      {/* Left: Mobile Drawer Button + Logo & Book Title */}
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-[#8A94A0] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
            title="Capítulos"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="w-8 h-8 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center shrink-0">
          <span className="font-bold text-violet-600 dark:text-[#B899FF]">H</span>
        </div>
        {isEditingTitle ? (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input
              type="text"
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              className="w-full max-w-[140px] sm:max-w-[240px] md:max-w-[300px] h-[28px] bg-gray-50 dark:bg-[#141A22] border border-gray-300 dark:border-white/10 rounded-md px-2 text-sm md:text-lg font-semibold text-gray-900 dark:text-white outline-none focus:border-violet-500 transition-colors"
              style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
              disabled={isSavingTitle}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') {
                  setIsEditingTitle(false);
                  setEditTitleValue(bookTitle);
                }
              }}
              onBlur={handleSaveTitle}
            />
          </div>
        ) : (
          <div className="group flex items-center gap-2 cursor-pointer flex-1 min-w-0" onClick={() => setIsEditingTitle(true)}>
            <h1 
              className="font-semibold text-sm md:text-lg truncate max-w-[140px] sm:max-w-[240px] md:max-w-[300px] group-hover:text-violet-600 dark:group-hover:text-[#B899FF] transition-colors" 
              style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
              title="Editar título"
            >
              {bookTitle}
            </h1>
            <Edit2 className="w-3 h-3 text-gray-400 dark:text-[#8A94A0] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      {/* Center: Search (Hidden on small mobile screens to prevent overlap) */}
      <div className="hidden sm:flex flex-1 max-w-[320px] items-center justify-center mx-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#8A94A0]" />
          <input
            type="text"
            placeholder={t.search}
            className="w-full h-[32px] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl pl-9 pr-3 text-xs text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#8A94A0] focus:outline-none focus:ring-1 focus:ring-violet-500 dark:focus:ring-[#B899FF] transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-2 md:gap-4 shrink-0 text-gray-500 dark:text-[#8A94A0]">
        <div className="flex items-center gap-1.5 text-xs">
          {isSynced ? (
            <>
              <Cloud className="w-4 h-4 text-[#22C55E]" />
              <span className="hidden md:inline">{t.saved}</span>
            </>
          ) : (
            <>
              <CloudOff className="w-4 h-4 text-[#FF6B6B]" />
              <span className="hidden md:inline">{t.syncing}</span>
            </>
          )}
        </div>
        
        <div className="w-px h-4 bg-gray-200 dark:bg-white/10" />
        
        <button 
          onClick={onToggleRibbon}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
          title={isRibbonOpen ? t.hideRibbon : t.showRibbon}
        >
          {isRibbonOpen ? <PanelTopClose className="w-4 h-4" /> : <PanelTopOpen className="w-4 h-4" />}
        </button>
        
        <button 
          onClick={onToggleTheme}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-white/5 py-1 px-1.5 rounded-lg transition-colors"
          >
            <div className="w-6 h-6 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
              <User className="w-3.5 h-3.5 text-gray-700 dark:text-[#F5F5F5]" />
            </div>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#11161D] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 text-sm">
              <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">{t.myAccount}</p>
              </div>
              <div className="p-1">
                <Link 
                  href={`/${lang}/dashboard`}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t.dashboard}
                </Link>
                <button 
                  onClick={() => logoutAction()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-500 dark:text-[#FF6B6B] hover:text-red-600 dark:hover:text-[#FF8F8F] hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  {t.signOut}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
