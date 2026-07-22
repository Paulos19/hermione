import React, { useState, useRef, useEffect } from "react";
import { Search, Cloud, CloudOff, Sun, Moon, User, ChevronDown, LogOut, LayoutDashboard, PanelTopClose, PanelTopOpen, Menu, Edit2, Check, X } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { renomearLivroAction } from "@/app/actions/book";
import { dict } from "@/lib/dictionaries"
import { Locale as Language } from "@/lib/i18n-config";
import { toast } from "sonner";
import { useTheme, ThemeType } from "@/app/providers/ThemeProvider";

interface TopbarProps {
  bookId: string;
  bookTitle: string;
  setBookTitle: (title: string) => void;
  isSynced: boolean;
  isRibbonOpen: boolean;
  onToggleRibbon: () => void;
  lang: Language;
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
  onToggleLeftSidebar
}: TopbarProps) {
  const t = dict[lang].topbar;
  const { theme, setTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

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
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[56px] bg-[var(--theme-bg-surface)] border-b border-[var(--theme-border-subtle)] flex items-center justify-between px-3 md:px-4 shrink-0 text-[var(--theme-text-main)] transition-colors duration-200">
      
      {/* Left: Mobile Drawer Button + Logo & Book Title */}
      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            className="md:hidden p-1.5 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)]"
            title="Capítulos"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="w-8 h-8 bg-[var(--theme-bg-surface-elevated)] rounded-xl flex items-center justify-center shrink-0">
          <span className="font-bold text-[var(--theme-accent)]">H</span>
        </div>
        {isEditingTitle ? (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input
              type="text"
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              className="w-full max-w-[140px] sm:max-w-[240px] md:max-w-[300px] h-[28px] bg-[var(--theme-bg-surface-elevated)] border border-gray-300 dark:border-white/10 rounded-md px-2 text-sm md:text-lg font-semibold text-[var(--theme-text-main)] outline-none focus:border-violet-500 transition-colors"
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
            <Edit2 className="w-3 h-3 text-[var(--theme-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      {/* Center: Search (Hidden on small mobile screens to prevent overlap) */}
      <div className="hidden sm:flex flex-1 max-w-[320px] items-center justify-center mx-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
          <input
            type="text"
            placeholder={t.search}
            className="w-full h-[32px] bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-xl pl-9 pr-3 text-xs text-[var(--theme-text-main)] placeholder-[var(--theme-text-muted)] focus:outline-none focus:ring-1 focus:ring-violet-500 dark:focus:ring-[#B899FF] transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-2 md:gap-4 shrink-0 text-[var(--theme-text-muted)]">
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
        
        <div className="w-px h-4 bg-[var(--theme-bg-surface-elevated)]" />
        
        <button 
          onClick={onToggleRibbon}
          className="p-1.5 hover:bg-[var(--theme-bg-surface-elevated)] rounded-lg hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
          title={isRibbonOpen ? t.hideRibbon : t.showRibbon}
        >
          {isRibbonOpen ? <PanelTopClose className="w-4 h-4" /> : <PanelTopOpen className="w-4 h-4" />}
        </button>
        
        <div className="relative" ref={themeRef}>
          <button 
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className="p-1.5 hover:bg-[var(--theme-bg-surface-elevated)] rounded-lg hover:text-[var(--theme-text-main)] transition-colors"
            title="Temas do Sistema"
          >
            <Sun className="w-4 h-4" /> {/* Or a Palette icon if preferred, using Sun here as fallback for styling */}
          </button>
          
          {isThemeOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-xl shadow-xl p-2 z-50">
              <div className="text-xs font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2 px-1">Temas</div>
              <div className="flex flex-col gap-1">
                {[
                  { id: 'light', label: 'Light', bg: '#FFFFFF', accent: '#2563EB' },
                  { id: 'dark', label: 'Dark', bg: '#0A0D12', accent: '#3B82F6' },
                  { id: 'ocean', label: 'Ocean', bg: '#060d16', accent: '#0EA5E9' },
                  { id: 'dracula', label: 'Dracula', bg: '#110E1B', accent: '#8B5CF6' },
                  { id: 'sunset', label: 'Sunset', bg: '#1C1010', accent: '#F97316' },
                  { id: 'desert', label: 'Desert', bg: '#1C1A14', accent: '#EAB308' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTheme(opt.id as ThemeType)
                      setIsThemeOpen(false)
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${theme === opt.id ? 'bg-[var(--theme-accent-light)] text-[var(--theme-accent)]' : 'hover:bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-text-main)]'}`}
                  >
                    <div className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: opt.bg }} />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 hover:bg-[var(--theme-bg-surface-elevated)] py-1 px-1.5 rounded-lg transition-colors"
          >
            <div className="w-6 h-6 bg-[var(--theme-bg-surface-elevated)] rounded-full flex items-center justify-center overflow-hidden">
              <User className="w-3.5 h-3.5 text-[var(--theme-text-main)]" />
            </div>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded-xl shadow-xl overflow-hidden z-50 text-sm">
              <div className="p-3 border-b border-[var(--theme-border-subtle)] bg-[var(--theme-bg-surface-elevated)]">
                <p className="font-medium text-[var(--theme-text-main)]">{t.myAccount}</p>
              </div>
              <div className="p-1">
                <Link 
                  href={`/${lang}/dashboard`}
                  className="flex items-center gap-2 px-3 py-2 text-[var(--theme-text-muted)] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-[var(--theme-bg-surface-elevated)] rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t.dashboard}
                </Link>
                <button 
                  onClick={() => logoutAction()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:text-red-400 hover:bg-[var(--theme-bg-surface-elevated)] rounded-lg transition-colors text-left"
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
