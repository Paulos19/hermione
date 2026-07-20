import React, { useState } from "react";
import { ChevronRight, ChevronDown, Search, Plus, FileText, BarChart2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
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

  if (!isOpen) {
    return (
      <aside className="w-[48px] bg-white dark:bg-[#10151B] border-r border-gray-200 dark:border-white/5 flex flex-col h-full shrink-0 items-center py-4">
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Functional native find in book
      (window as any).find(searchQuery);
    }
  };

  return (
    <aside className="w-[320px] bg-white dark:bg-[#10151B] border-r border-gray-200 dark:border-white/5 flex flex-col h-full shrink-0 text-gray-900 dark:text-[#F5F5F5] select-none transition-all duration-300">
      
      {/* Search Inside Book */}
      <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-[#8A94A0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find in book... (Enter)"
            className="w-full h-[28px] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-md pl-8 pr-3 text-xs text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#8A94A0] focus:outline-none focus:border-[#B899FF] transition-all"
          />
        </form>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors text-gray-500 dark:text-[#8A94A0]"
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Workspace Content */}
      <div className="flex-1 overflow-y-auto py-2">
        
        {/* Chapters Section */}
        <div className="px-2 mb-6">
          <div 
            className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-gray-50 dark:bg-white/5 rounded-md group"
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
            <div className="mt-1 flex flex-col gap-0.5">
              {documents.length === 0 ? (
                <div className="px-7 py-2 text-xs text-gray-500 dark:text-[#8A94A0]">
                  No chapters yet.
                </div>
              ) : (
                documents.map((doc) => {
                  const isActive = activeDocumentId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setActiveDocumentId(doc.id)}
                      className={`flex items-center gap-2.5 px-3 py-1.5 ml-2 mr-1 rounded-md cursor-pointer text-sm transition-colors relative ${
                        isActive ? "bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-[#F5F5F5]" : "text-gray-500 dark:text-[#8A94A0] hover:text-gray-900 dark:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-gray-50 dark:bg-white/[0.02]"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#B899FF] rounded-r-full" />
                      )}
                      <FileText className={`w-3.5 h-3.5 ${isActive ? "text-[#B899FF]" : ""}`} />
                      <span className="truncate">{doc.title}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="px-2">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-[#8A94A0] tracking-wider uppercase">
              <BarChart2 className="w-3.5 h-3.5" />
              {t.statistics}
            </div>
          </div>
          
          <div className="mt-2 ml-4 mr-2 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-lg p-3 flex flex-col gap-3">
            <div>
              <span className="text-[10px] text-gray-500 dark:text-[#8A94A0] uppercase tracking-wider block mb-0.5">{t.wordCount}</span>
              <span className="text-base font-medium">{wordCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 dark:text-[#8A94A0] uppercase tracking-wider block mb-0.5">{t.readingTime}</span>
              <span className="text-base font-medium">{readingTime.replace('min', dict[lang].statusBar.min)}</span>
            </div>
            
            <button 
              onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
              className="mt-1 w-full h-[32px] bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-md text-xs font-medium text-gray-900 dark:text-[#F5F5F5] transition-colors"
            >
              {t.fullAnalytics}
            </button>

            {isAnalyticsExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-[#8A94A0] mb-1">
                    <span>Characters</span>
                    <span>{Math.floor(wordCount * 5.5).toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#B899FF]" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-[#8A94A0] mb-1">
                    <span>Paragraphs</span>
                    <span>{Math.max(1, Math.floor(wordCount / 50))}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4D96FF]" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-[#8A94A0] mb-1">
                    <span>Daily Goal</span>
                    <span>{(Math.min(100, (wordCount / 2000) * 100)).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#22C55E]" style={{ width: `${Math.min(100, (wordCount / 2000) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}


