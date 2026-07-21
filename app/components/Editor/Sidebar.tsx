import React, { useState } from "react";
import { ChevronRight, ChevronDown, Search, Plus, FileText, BarChart2, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { dict } from "@/lib/dictionaries"
import { Locale as Language } from "@/lib/i18n-config";

interface DocumentItem {
  id: string;
  title: string;
}

interface SidebarProps {
  documents: DocumentItem[];
  activeDocumentId: string;
  setActiveDocumentId: (id: string) => void;
  wordCount: number;
  readingTime: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  lang: Language;
}

export default function Sidebar({ 
  documents, 
  activeDocumentId, 
  setActiveDocumentId,
  wordCount,
  readingTime,
  isOpen,
  setIsOpen,
  lang
}: SidebarProps) {
  const t = dict[lang].sidebar;
  const [isTreeExpanded, setIsTreeExpanded] = useState(true);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
              <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-all text-gray-900 dark:text-[#F5F5F5]">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {isTreeExpanded && (
              <div className="mt-1 pl-2 space-y-0.5">
                {documents.map((doc, idx) => {
                  const isActive = doc.id === activeDocumentId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectDoc(doc.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                        isActive 
                          ? "bg-violet-50 dark:bg-[#141A22] text-violet-600 dark:text-[#B899FF] font-semibold border border-violet-200 dark:border-violet-500/20 shadow-sm" 
                          : "text-gray-600 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{doc.title || `Capítulo ${idx + 1}`}</span>
                    </div>
                  );
                })}
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
              <div className="mt-2 px-3 py-3 bg-gray-50 dark:bg-white/5 rounded-xl space-y-2 text-xs text-gray-600 dark:text-[#8A94A0]">
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
