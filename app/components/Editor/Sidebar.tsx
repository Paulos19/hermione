import React, { useState } from "react";
import { ChevronRight, ChevronDown, Search, Plus, FileText, BarChart2, PanelLeftClose, PanelLeftOpen, X, Edit2, Globe, Users, Bookmark, Check, Trash2 } from "lucide-react";
import { dict } from "@/lib/dictionaries"
import { Locale as Language } from "@/lib/i18n-config";
import { renomearDocumentoAction, criarDocumentoAction, excluirDocumentoAction } from "@/app/actions/document";
import { toast } from "sonner";

interface DocumentItem {
  id: string;
  title: string;
  order?: number;
}

interface SidebarProps {
  bookId: string;
  documents: DocumentItem[];
  setDocuments: React.Dispatch<React.SetStateAction<any[]>>;
  characters: any[];
  notes: any[];
  dailyGoal: number;
  wordsToday: number;
  activeDocumentId: string;
  setActiveDocumentId: (id: string) => void;
  wordCount: number;
  readingTime: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenQuickEdit: (type: 'character' | 'world' | 'note', item: any) => void;
  lang: Language;
}

export default function Sidebar({ 
  bookId,
  documents,
  setDocuments,
  characters,
  notes,
  dailyGoal,
  wordsToday,
  activeDocumentId, 
  setActiveDocumentId,
  wordCount,
  readingTime,
  isOpen,
  setIsOpen,
  onOpenQuickEdit,
  lang
}: SidebarProps) {
  const t = dict[lang].sidebar;
  const [isTreeExpanded, setIsTreeExpanded] = useState(true);
  const [isCharactersExpanded, setIsCharactersExpanded] = useState(false);
  const [isWorldExpanded, setIsWorldExpanded] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editDocTitle, setEditDocTitle] = useState("");
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);

  const worldNotes = notes.filter(n => n.type === 'world');
  const normalNotes = notes.filter(n => n.type === 'note' || !n.type);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      (window as any).find(searchQuery);
    }
  };

  const handleSelectDoc = (id: string) => {
    setActiveDocumentId(id);
    // Auto-close sidebar drawer on mobile screens
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleCreateDoc = async () => {
    setIsCreatingDoc(true);
    try {
      const order = documents.length > 0 ? Math.max(...documents.map(d => d.order || 0)) + 1 : 1;
      const title = `Capítulo ${documents.length + 1}`;
      const newDoc = await criarDocumentoAction(bookId, title, order);
      setDocuments([...documents, newDoc]);
      setActiveDocumentId(newDoc.id);
      toast.success("Capítulo criado!");
    } catch (e: any) {
      toast.error("Erro ao criar capítulo.");
    } finally {
      setIsCreatingDoc(false);
    }
  };

  const handleSaveDocTitle = async (id: string) => {
    if (!editDocTitle.trim()) {
      setEditingDocId(null);
      return;
    }
    const doc = documents.find(d => d.id === id);
    if (doc?.title === editDocTitle.trim()) {
      setEditingDocId(null);
      return;
    }
    try {
      await renomearDocumentoAction(id, editDocTitle.trim());
      setDocuments(documents.map(d => d.id === id ? { ...d, title: editDocTitle.trim() } : d));
      toast.success("Capítulo renomeado!");
    } catch (e: any) {
      toast.error("Erro ao renomear.");
    } finally {
      setEditingDocId(null);
    }
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${title}"?`)) return;

    try {
      await excluirDocumentoAction(id);
      const newDocs = documents.filter(d => d.id !== id);
      setDocuments(newDocs);
      if (activeDocumentId === id && newDocs.length > 0) {
        setActiveDocumentId(newDocs[0].id);
      }
      toast.success("Capítulo excluído!");
    } catch (e: any) {
      toast.error("Erro ao excluir capítulo.");
    }
  };

  if (!isOpen) {
    return (
      <aside className="hidden md:flex w-[48px] bg-white dark:bg-[#10151B] border-r border-gray-200 dark:border-white/5 flex-col h-full shrink-0 items-center py-4 z-30">
        <button 
          onClick={() => setIsOpen(true)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors text-gray-500 dark:text-[#8A94A0]"
          title="Expand Sidebar"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div 
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
      />

      <aside className="fixed inset-y-0 left-0 z-50 w-[280px] md:relative md:w-[320px] bg-white dark:bg-[#10151B] border-r border-gray-200 dark:border-white/5 flex flex-col h-full shrink-0 text-gray-900 dark:text-[#F5F5F5] select-none transition-all duration-300 shadow-2xl md:shadow-none">
        
        {/* Search Inside Book & Toggle Header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-[#8A94A0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find in book..."
              className="w-full h-[32px] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl pl-8 pr-3 text-xs text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#8A94A0] focus:outline-none focus:border-[#B899FF] transition-all"
            />
          </form>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500 dark:text-[#8A94A0]"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4 hidden md:block" />
            <X className="w-5 h-5 md:hidden" />
          </button>
        </div>

        {/* Workspace Content */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          
          {/* Chapters Section */}
          <div className="px-2 mb-6">
            <div 
              className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg group"
              onClick={() => setIsTreeExpanded(!isTreeExpanded)}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-[#8A94A0] tracking-wider uppercase">
                {isTreeExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                {t.manuscript}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleCreateDoc(); }}
                disabled={isCreatingDoc}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-all text-gray-900 dark:text-[#F5F5F5]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {isTreeExpanded && (
              <div className="mt-1 pl-2 space-y-0.5">
                {documents.map((doc, idx) => {
                  const isActive = doc.id === activeDocumentId;
                  const isEditing = editingDocId === doc.id;

                  return (
                    <div
                      key={doc.id}
                      onClick={() => !isEditing && handleSelectDoc(doc.id)}
                      className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                        isActive 
                          ? "bg-violet-50 dark:bg-[#141A22] text-violet-600 dark:text-[#B899FF] font-semibold border border-violet-200 dark:border-violet-500/20 shadow-sm" 
                          : "text-gray-600 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      
                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            value={editDocTitle}
                            onChange={(e) => setEditDocTitle(e.target.value)}
                            className="flex-1 bg-white dark:bg-white/10 border border-violet-500 rounded px-1.5 py-0.5 text-xs text-gray-900 dark:text-white outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveDocTitle(doc.id);
                              if (e.key === 'Escape') setEditingDocId(null);
                            }}
                            onBlur={() => handleSaveDocTitle(doc.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : (
                        <>
                          <span className="truncate flex-1">{doc.title || `Capítulo ${idx + 1}`}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditDocTitle(doc.title || `Capítulo ${idx + 1}`);
                                setEditingDocId(doc.id);
                              }}
                              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                              title="Renomear"
                            >
                              <Edit2 className="w-3 h-3 text-gray-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDoc(doc.id, doc.title || `Capítulo ${idx + 1}`);
                              }}
                              className="p-1 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded"
                              title="Excluir"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Characters Section */}
          <div className="px-2 mb-6">
            <div 
              className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg group"
              onClick={() => setIsCharactersExpanded(!isCharactersExpanded)}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-[#8A94A0] tracking-wider uppercase">
                {isCharactersExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                Personagens
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenQuickEdit('character', null); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-all text-gray-900 dark:text-[#F5F5F5]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {isCharactersExpanded && (
              <div className="mt-1 pl-2 space-y-0.5">
                {characters.length === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-400 italic">Nenhum personagem</p>
                )}
                {characters.map(char => (
                  <div
                    key={char.id}
                    onClick={() => onOpenQuickEdit('character', char)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs cursor-pointer text-gray-600 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <Users className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{char.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* World Section */}
          <div className="px-2 mb-6">
            <div 
              className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg group"
              onClick={() => setIsWorldExpanded(!isWorldExpanded)}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-[#8A94A0] tracking-wider uppercase">
                {isWorldExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                Mundo
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenQuickEdit('world', null); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-all text-gray-900 dark:text-[#F5F5F5]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {isWorldExpanded && (
              <div className="mt-1 pl-2 space-y-0.5">
                {worldNotes.length === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-400 italic">Nenhum item do mundo</p>
                )}
                {worldNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => onOpenQuickEdit('world', note)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs cursor-pointer text-gray-600 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{note.title || 'Sem título'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="px-2 mb-6">
            <div 
              className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg group"
              onClick={() => setIsNotesExpanded(!isNotesExpanded)}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-[#8A94A0] tracking-wider uppercase">
                {isNotesExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                Anotações
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenQuickEdit('note', null); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-all text-gray-900 dark:text-[#F5F5F5]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {isNotesExpanded && (
              <div className="mt-1 pl-2 space-y-0.5">
                {normalNotes.length === 0 && (
                  <p className="px-3 py-2 text-xs text-gray-400 italic">Nenhuma anotação</p>
                )}
                {normalNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => onOpenQuickEdit('note', note)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs cursor-pointer text-gray-600 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <Bookmark className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{note.title || 'Sem título'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analytics Section */}
          <div className="px-2">
            <div 
              className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg"
              onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-[#8A94A0] tracking-wider uppercase">
                {isAnalyticsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                {t.statistics}
              </div>
            </div>

            {isAnalyticsExpanded && (
              <div className="mt-2 px-3 py-3 bg-gray-50 dark:bg-white/5 rounded-xl space-y-3 text-xs text-gray-600 dark:text-[#8A94A0]">
                
                {/* Daily Progress */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span>Meta Diária</span>
                    <span className="font-semibold text-gray-900 dark:text-[#F5F5F5]">
                      {wordsToday} <span className="text-gray-400 font-normal">/ {dailyGoal}</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(0, (wordsToday / dailyGoal) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="w-full h-px bg-gray-200 dark:bg-white/10 my-2" />

                <div className="flex justify-between items-center">
                  <span>{t.wordCount}</span>
                  <span className="font-semibold text-gray-900 dark:text-[#F5F5F5]">{wordCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t.readingTime}</span>
                  <span className="font-semibold text-gray-900 dark:text-[#F5F5F5]">{readingTime}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
