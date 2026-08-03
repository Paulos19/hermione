import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Search, 
  Cloud, 
  CloudOff, 
  Sun, 
  Moon, 
  Palette, 
  User, 
  Users, 
  ChevronDown, 
  LogOut, 
  LayoutDashboard, 
  PanelTopClose, 
  PanelTopOpen, 
  Menu, 
  Edit3, 
  Check, 
  X, 
  Sparkles,
  ShieldCheck,
  Settings,
  FileText,
  Compass,
  ArrowRight,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { logoutAction } from "@/app/actions/auth";
import { renomearLivroAction } from "@/app/actions/book";
import { dict } from "@/lib/dictionaries"
import { Locale as Language } from "@/lib/i18n-config";
import { toast } from "sonner";
import { useTheme, ThemeType } from "@/app/providers/ThemeProvider";
import { BookCollaboratorsModal } from "./BookCollaboratorsModal";

interface TopbarProps {
  bookId: string;
  bookTitle: string;
  setBookTitle: (title: string) => void;
  isSynced: boolean;
  isTyping?: boolean;
  currentUser?: any;
  isRibbonOpen: boolean;
  onToggleRibbon: () => void;
  lang: Language;
  onToggleLeftSidebar?: () => void;
  isOwner?: boolean;
  canWrite?: boolean;
  // Search & Navigation props
  documents?: any[];
  characters?: any[];
  notes?: any[];
  activeDocumentId?: string;
  onSelectDocument?: (docId: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onOpenQuickEdit?: (type: 'character' | 'world' | 'note', item: any) => void;
}

export default function Topbar({ 
  bookId,
  bookTitle, 
  setBookTitle,
  isSynced, 
  isTyping,
  currentUser,
  isRibbonOpen, 
  onToggleRibbon, 
  lang, 
  onToggleLeftSidebar,
  isOwner,
  canWrite,
  documents = [],
  characters = [],
  notes = [],
  activeDocumentId,
  onSelectDocument,
  searchQuery = "",
  onSearchQueryChange,
  onOpenQuickEdit
}: TopbarProps) {
  const t = dict[lang].topbar;
  const { theme, setTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(bookTitle);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery);

  useEffect(() => {
    setEditTitleValue(bookTitle);
  }, [bookTitle]);

  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

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

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Computed Live Search Results
  const searchResults = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query || query.length < 2) return [];

    const results: Array<{
      id: string;
      type: 'chapter' | 'text' | 'character' | 'note';
      title: string;
      subtitle?: string;
      snippet?: string;
      docId?: string;
      item?: any;
    }> = [];

    const stripHtml = (html?: string) => {
      if (!html) return "";
      return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    };

    // 1. Search Chapters (Title & Plain Content)
    if (documents && documents.length > 0) {
      documents.forEach((doc) => {
        const titleMatch = doc.title?.toLowerCase().includes(query);
        const plainContent = stripHtml(doc.content);
        const contentMatchIndex = plainContent.toLowerCase().indexOf(query);

        if (titleMatch) {
          results.push({
            id: `doc-${doc.id}`,
            type: 'chapter',
            title: doc.title || "Capítulo sem título",
            subtitle: "Capítulo",
            docId: doc.id
          });
        }

        if (contentMatchIndex !== -1 && !titleMatch) {
          const start = Math.max(0, contentMatchIndex - 25);
          const end = Math.min(plainContent.length, contentMatchIndex + query.length + 35);
          const rawSnippet = plainContent.substring(start, end);
          
          results.push({
            id: `text-${doc.id}-${contentMatchIndex}`,
            type: 'text',
            title: doc.title || "Capítulo",
            subtitle: "Trecho do texto",
            snippet: (start > 0 ? "..." : "") + rawSnippet + (end < plainContent.length ? "..." : ""),
            docId: doc.id
          });
        }
      });
    }

    // 2. Search Characters
    if (characters && characters.length > 0) {
      characters.forEach((char) => {
        const nameMatch = char.name?.toLowerCase().includes(query);
        const roleMatch = char.role?.toLowerCase().includes(query);
        const bioMatch = char.description?.toLowerCase().includes(query);

        if (nameMatch || roleMatch || bioMatch) {
          results.push({
            id: `char-${char.id}`,
            type: 'character',
            title: char.name || "Personagem",
            subtitle: char.role ? `Personagem • ${char.role}` : "Personagem",
            snippet: char.description ? stripHtml(char.description).substring(0, 70) : undefined,
            item: char
          });
        }
      });
    }

    // 3. Search World Notes
    if (notes && notes.length > 0) {
      notes.forEach((note) => {
        const titleMatch = note.title?.toLowerCase().includes(query);
        const contentMatch = note.content?.toLowerCase().includes(query);

        if (titleMatch || contentMatch) {
          results.push({
            id: `note-${note.id}`,
            type: 'note',
            title: note.title || "Anotação",
            subtitle: note.category ? `Anotação • ${note.category}` : "Anotação de Mundo",
            snippet: note.content ? stripHtml(note.content).substring(0, 70) : undefined,
            item: note
          });
        }
      });
    }

    return results;
  }, [searchValue, documents, characters, notes]);

  const handleSelectResult = (result: any) => {
    if ((result.type === 'chapter' || result.type === 'text') && result.docId) {
      if (onSelectDocument) {
        onSelectDocument(result.docId);
      }
      if (onSearchQueryChange) {
        onSearchQueryChange(searchValue.trim());
      }
      toast.success(`Navegado para "${result.title}"`);
    } else if (result.type === 'character' && onOpenQuickEdit) {
      onOpenQuickEdit('character', result.item);
    } else if (result.type === 'note' && onOpenQuickEdit) {
      onOpenQuickEdit('note', result.item);
    }
    setIsSearchOpen(false);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    if (onSearchQueryChange) {
      onSearchQueryChange("");
    }
    setIsSearchOpen(false);
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return "H";
  };

  return (
    <header className="h-[50px] md:h-[56px] bg-[var(--theme-bg-surface)]/90 backdrop-blur-md border-b border-[var(--theme-border-subtle)] flex items-center justify-between px-2 sm:px-3 md:px-5 shrink-0 text-[var(--theme-text-main)] transition-colors duration-200 relative z-[80] overflow-visible select-none">
      
      {/* Left: Logo & Book Title */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 flex-1 min-w-0">
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            className="md:hidden p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)] transition-colors"
            title="Navegador de Capítulos"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Premium Hermione Logo Icon */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-[1px] shadow-sm shrink-0 flex items-center justify-center">
          <div className="w-full h-full bg-[var(--theme-bg-surface-elevated)] rounded-[10px] sm:rounded-[11px] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--theme-accent,#3b82f6)]" />
          </div>
        </div>

        {isEditingTitle ? (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input
              type="text"
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              className="w-full max-w-[100px] xs:max-w-[150px] sm:max-w-[240px] md:max-w-[320px] h-[28px] sm:h-[30px] bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-accent,#3b82f6)]/40 rounded-lg px-2 text-xs sm:text-sm md:text-base font-semibold text-[var(--theme-text-main)] outline-none focus:ring-2 focus:ring-[var(--theme-accent,#3b82f6)]/20 transition-all"
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
          <div className="group flex items-center gap-1.5 cursor-pointer flex-1 min-w-0" onClick={() => canWrite && setIsEditingTitle(true)}>
            <h1 
              className="font-semibold text-xs sm:text-sm md:text-lg truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[240px] md:max-w-[320px] text-[var(--theme-text-main)] group-hover:text-[var(--theme-accent,#3b82f6)] transition-colors" 
              style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
              title={canWrite ? "Clique para renomear este livro" : bookTitle}
            >
              {bookTitle}
            </h1>
            {canWrite && (
              <Edit3 className="w-3 h-3 text-[var(--theme-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden xs:inline" />
            )}
          </div>
        )}
      </div>

      {/* Center: Command Search Bar */}
      <div className="hidden sm:flex flex-1 max-w-[360px] items-center justify-center mx-3 relative" ref={searchRef}>
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)] group-focus-within:text-[var(--theme-accent,#3b82f6)] transition-colors" />
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (onSearchQueryChange) onSearchQueryChange(e.target.value);
              setIsSearchOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchResults.length > 0) {
                handleSelectResult(searchResults[0]);
              }
            }}
            placeholder={t.search || "Buscar em capítulos, personagens e notas..."}
            className="w-full h-[34px] bg-[var(--theme-bg-surface-elevated)]/60 hover:bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-xl pl-9 pr-14 text-xs text-[var(--theme-text-main)] placeholder-[var(--theme-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent,#3b82f6)] focus:border-[var(--theme-accent,#3b82f6)]/60 transition-all shadow-xs"
          />
          {searchValue ? (
            <button
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface)] transition-colors"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden md:inline-flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-[var(--theme-bg-surface)] text-[var(--theme-text-muted)] border border-[var(--theme-border-subtle)] pointer-events-none">
              Ctrl K
            </kbd>
          )}
        </div>

        {/* Real-time Search Results Popover */}
        {isSearchOpen && searchValue.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-2xl shadow-2xl overflow-hidden z-[100] p-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 max-h-[380px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between px-2.5 py-1 border-b border-[var(--theme-border-subtle)] mb-1 text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider">
              <span>Resultados para "{searchValue}"</span>
              <span>{searchResults.length} {searchResults.length === 1 ? 'item' : 'itens'}</span>
            </div>

            {searchResults.length > 0 ? (
              <div className="flex flex-col gap-1">
                {searchResults.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => handleSelectResult(res)}
                    className="w-full text-left p-2 rounded-xl hover:bg-[var(--theme-bg-surface)] transition-colors flex items-start gap-2.5 group"
                  >
                    <div className="p-1.5 rounded-lg bg-[var(--theme-bg-surface)] group-hover:bg-[var(--theme-accent,#3b82f6)]/15 group-hover:text-[var(--theme-accent,#3b82f6)] transition-colors shrink-0 mt-0.5">
                      {res.type === 'chapter' && <BookOpen className="w-4 h-4 text-[var(--theme-accent,#3b82f6)]" />}
                      {res.type === 'text' && <FileText className="w-4 h-4 text-emerald-500" />}
                      {res.type === 'character' && <User className="w-4 h-4 text-purple-400" />}
                      {res.type === 'note' && <Compass className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[var(--theme-text-main)] group-hover:text-[var(--theme-accent,#3b82f6)] truncate transition-colors">
                          {res.title}
                        </span>
                        <span className="text-[9px] font-mono text-[var(--theme-text-muted)] shrink-0">
                          {res.subtitle}
                        </span>
                      </div>
                      {res.snippet && (
                        <p className="text-[11px] text-[var(--theme-text-muted)] line-clamp-2 mt-0.5 font-sans leading-relaxed">
                          {res.snippet}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[var(--theme-text-muted)] flex flex-col items-center justify-center gap-1">
                <Search className="w-6 h-6 opacity-30 mb-1" />
                <p>Nenhum resultado encontrado para "{searchValue}"</p>
                <span className="text-[10px] text-[var(--theme-text-muted)]/70">Tente buscar por termos de capítulos, personagens ou mundo</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center justify-end gap-1.5 md:gap-3 shrink-0 text-[var(--theme-text-muted)]">
        
        {/* Sync & User Status Ring */}
        <div className="flex items-center justify-center mr-0.5" title={isTyping ? "Digitando..." : isSynced ? "Todas as alterações salvas" : "Sincronizando..."}>
          <div className={`relative flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
            isTyping ? "ring-2 ring-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" : 
            isSynced ? "ring-2 ring-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.3)]" : 
            "ring-2 ring-amber-400 animate-pulse"
          }`}>
            {currentUser?.image ? (
              <img 
                src={currentUser.image} 
                alt={currentUser.name || "User Avatar"} 
                className={`rounded-full object-cover w-6 h-6 border-2 border-[var(--theme-bg-surface)] ${isTyping ? "animate-pulse" : ""}`}
              />
            ) : (
              <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-[10px] font-bold border-2 border-[var(--theme-bg-surface)] ${isTyping ? "animate-pulse" : ""}`}>
                {getUserInitials(currentUser?.name, currentUser?.email)}
              </div>
            )}
            
            {/* Sync Status Badge */}
            {!isTyping && isSynced && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[var(--theme-bg-surface)] flex items-center justify-center shadow-xs">
                <Check className="w-1.5 h-1.5 text-white stroke-[3px]" />
              </div>
            )}
          </div>
        </div>
        
        <div className="w-px h-4 bg-[var(--theme-border-subtle)] mx-0.5" />
        
        {/* Toggle Ribbon Bar */}
        <button 
          onClick={onToggleRibbon}
          className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
            isRibbonOpen 
              ? "bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-accent,#3b82f6)]" 
              : "hover:bg-[var(--theme-bg-surface-elevated)] hover:text-[var(--theme-text-main)]"
          }`}
          title={isRibbonOpen ? t.hideRibbon || "Ocultar Faixa de Opções" : t.showRibbon || "Exibir Faixa de Opções"}
        >
          {isRibbonOpen ? <PanelTopClose className="w-4 h-4" /> : <PanelTopOpen className="w-4 h-4" />}
        </button>
        
        {/* Theme Picker Dropdown */}
        <div className="relative" ref={themeRef}>
          <button 
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
              isThemeOpen 
                ? "bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-accent,#3b82f6)]" 
                : "hover:bg-[var(--theme-bg-surface-elevated)] hover:text-[var(--theme-text-main)]"
            }`}
            title="Temas do Sistema"
          >
            <Palette className="w-4 h-4" />
          </button>
          
          {isThemeOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2 px-2">Temas do Sistema</div>
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
                    className={`flex items-center justify-between p-2 rounded-lg transition-colors text-xs font-medium ${
                      theme === opt.id 
                        ? 'bg-[var(--theme-accent,#3b82f6)]/15 text-[var(--theme-accent,#3b82f6)] border border-[var(--theme-accent,#3b82f6)]/30' 
                        : 'hover:bg-[var(--theme-bg-surface)] text-[var(--theme-text-main)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full border border-black/20 dark:border-white/20 shadow-xs" style={{ backgroundColor: opt.bg }} />
                      <span>{opt.label}</span>
                    </div>
                    {theme === opt.id && <Check className="w-3.5 h-3.5 text-[var(--theme-accent,#3b82f6)]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Collaborators Button */}
        {isOwner && (
          <button 
            onClick={() => setIsCollabModalOpen(true)}
            className="p-1.5 hover:bg-[var(--theme-bg-surface-elevated)] rounded-lg hover:text-[var(--theme-accent,#3b82f6)] transition-colors flex items-center justify-center"
            title="Gerenciar Co-autores e Colaboradores"
          >
            <Users className="w-4 h-4" />
          </button>
        )}
        
        {/* User Profile Menu with Avatar Picture */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 hover:bg-[var(--theme-bg-surface-elevated)] p-1 rounded-xl transition-all border border-transparent hover:border-[var(--theme-border-subtle)] group"
            title={currentUser?.name || "Perfil do Usuário"}
          >
            {currentUser?.image ? (
              <img 
                src={currentUser.image} 
                alt={currentUser?.name || "Avatar"} 
                className="w-7 h-7 rounded-full object-cover border border-[var(--theme-border)] group-hover:border-[var(--theme-accent,#3b82f6)] transition-colors shadow-xs" 
              />
            ) : (
              <div className="w-7 h-7 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-xs shadow-xs border border-white/10">
                {getUserInitials(currentUser?.name, currentUser?.email)}
              </div>
            )}
            <ChevronDown className="w-3 h-3 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text-main)] transition-colors" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-2xl overflow-hidden z-50 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
              {/* Profile Card Header */}
              <div className="p-3 border-b border-[var(--theme-border-subtle)] bg-[var(--theme-bg-surface)]/50 flex items-center gap-2.5">
                {currentUser?.image ? (
                  <img 
                    src={currentUser.image} 
                    alt={currentUser?.name || "Avatar"} 
                    className="w-9 h-9 rounded-full object-cover border border-[var(--theme-border)] shadow-xs" 
                  />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
                    {getUserInitials(currentUser?.name, currentUser?.email)}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <p className="font-semibold text-[var(--theme-text-main)] truncate">{currentUser?.name || t.myAccount}</p>
                  {currentUser?.email && (
                    <p className="text-[10px] text-[var(--theme-text-muted)] truncate">{currentUser.email}</p>
                  )}
                </div>
              </div>

              {/* Action Links */}
              <div className="p-1.5 flex flex-col gap-0.5">
                <Link 
                  href={`/${lang}/dashboard`}
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface)] rounded-lg transition-colors font-medium"
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--theme-accent,#3b82f6)]" />
                  <span>{t.dashboard || "Painel de Controle"}</span>
                </Link>
                
                <button 
                  onClick={() => logoutAction()}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left font-medium mt-1 border-t border-[var(--theme-border-subtle)] pt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.signOut || "Sair da Conta"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {isOwner && (
        <BookCollaboratorsModal
          bookId={bookId}
          isOpen={isCollabModalOpen}
          onClose={() => setIsCollabModalOpen(false)}
          isOwner={isOwner}
        />
      )}
    </header>
  );
}
