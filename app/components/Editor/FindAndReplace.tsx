import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { Search, X, ChevronUp, ChevronDown, Replace, ReplaceAll } from 'lucide-react';
import { dict } from "@/lib/dictionaries"
import { Locale as Language } from "@/lib/i18n-config";

interface FindAndReplaceProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export default function FindAndReplace({ editor, isOpen, onClose, lang }: FindAndReplaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [matches, setMatches] = useState<{from: number, to: number}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update matches when search term or doc changes
  useEffect(() => {
    if (!isOpen || !searchTerm) {
      editor.commands.setSearchHighlight(null);
      setMatches([]);
      setCurrentIndex(-1);
      return;
    }

    editor.commands.setSearchHighlight(searchTerm);
    
    // Find all matches in doc
    const newMatches: {from: number, to: number}[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        const text = node.text.toLowerCase();
        const q = searchTerm.toLowerCase();
        let index = text.indexOf(q);
        while (index !== -1) {
          newMatches.push({ from: pos + index, to: pos + index + q.length });
          index = text.indexOf(q, index + q.length);
        }
      }
    });

    setMatches(newMatches);
    if (newMatches.length > 0) {
      if (currentIndex === -1 || currentIndex >= newMatches.length) {
        setCurrentIndex(0);
      }
    } else {
      setCurrentIndex(-1);
    }
  }, [searchTerm, isOpen, editor.state.doc.content.size]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const goToMatch = (index: number) => {
    if (matches.length === 0) return;
    const match = matches[index];
    editor.commands.setTextSelection({ from: match.from, to: match.to });
    
    // Tiptap's scrollIntoView might not work if the scrollable container is a parent div.
    // We manually find the DOM element at position and scroll it into center.
    setTimeout(() => {
      try {
        const domAtPos = editor.view.domAtPos(match.from);
        const el = domAtPos.node.nodeType === 3 ? domAtPos.node.parentElement : domAtPos.node as Element;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (e) {
        // Fallback
        editor.commands.scrollIntoView();
      }
    }, 10);
    
    setCurrentIndex(index);
  };

  const nextMatch = () => {
    if (matches.length === 0) return;
    const next = (currentIndex + 1) % matches.length;
    goToMatch(next);
  };

  const prevMatch = () => {
    if (matches.length === 0) return;
    const prev = (currentIndex - 1 + matches.length) % matches.length;
    goToMatch(prev);
  };

  const replaceNext = () => {
    if (matches.length === 0 || currentIndex === -1) return;
    const match = matches[currentIndex];
    
    editor.chain()
      .focus()
      .deleteRange({ from: match.from, to: match.to })
      .insertContentAt(match.from, replaceTerm)
      .run();
      
    // Next match will automatically shift down in position due to doc update,
    // useEffect will recalculate matches.
  };

  const replaceAll = () => {
    if (matches.length === 0) return;
    
    let tr = editor.state.tr;
    // We must iterate backwards so positions don't shift!
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      tr = tr.delete(match.from, match.to).insertText(replaceTerm, match.from);
    }
    editor.view.dispatch(tr);
    editor.commands.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-2 right-2 sm:left-auto sm:right-6 md:right-12 mt-2 z-[100] bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] shadow-2xl rounded-2xl p-3.5 sm:p-4 w-auto sm:w-[340px] flex flex-col gap-3 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 text-[var(--theme-text-main)]">
      <div className="flex items-center justify-between border-b border-[var(--theme-border-subtle)] pb-2">
        <h3 className="text-xs font-bold text-[var(--theme-text-main)] uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-[var(--theme-accent,#3b82f6)]" />
          Localizar e Substituir
        </h3>
        <button 
          onClick={onClose} 
          className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] p-1 rounded-lg hover:bg-[var(--theme-bg-surface)] transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4"/>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Localizar texto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-xl pl-8 pr-16 py-1.5 text-xs text-[var(--theme-text-main)] focus:outline-none focus:border-[var(--theme-accent,#3b82f6)] focus:ring-1 focus:ring-[var(--theme-accent,#3b82f6)]/30 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) prevMatch();
                else nextMatch();
              }
            }}
          />
          {matches.length > 0 && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-[var(--theme-accent,#3b82f6)] bg-[var(--theme-accent,#3b82f6)]/10 px-1.5 py-0.5 rounded">
              {currentIndex + 1}/{matches.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <input 
            type="text" 
            placeholder="Substituir por..."
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            className="flex-1 bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-xl px-3 py-1.5 text-xs text-[var(--theme-text-main)] focus:outline-none focus:border-[var(--theme-accent,#3b82f6)] focus:ring-1 focus:ring-[var(--theme-accent,#3b82f6)]/30 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[var(--theme-border-subtle)]">
        <div className="flex gap-1">
          <button 
            onClick={prevMatch} 
            disabled={matches.length === 0} 
            className="p-1.5 rounded-lg bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] text-[var(--theme-text-main)] disabled:opacity-40 hover:bg-[var(--theme-bg-surface-elevated)] hover:border-[var(--theme-border)] transition-colors"
            title="Ocorrência Anterior (Shift+Enter)"
          >
            <ChevronUp className="w-3.5 h-3.5"/>
          </button>
          <button 
            onClick={nextMatch} 
            disabled={matches.length === 0} 
            className="p-1.5 rounded-lg bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] text-[var(--theme-text-main)] disabled:opacity-40 hover:bg-[var(--theme-bg-surface-elevated)] hover:border-[var(--theme-border)] transition-colors"
            title="Próxima Ocorrência (Enter)"
          >
            <ChevronDown className="w-3.5 h-3.5"/>
          </button>
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={replaceNext} 
            disabled={matches.length === 0} 
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] text-[var(--theme-text-main)] disabled:opacity-40 hover:bg-[var(--theme-accent,#3b82f6)] hover:text-white hover:border-[var(--theme-accent,#3b82f6)] transition-all shadow-xs"
          >
            Substituir
          </button>
          <button 
            onClick={replaceAll} 
            disabled={matches.length === 0} 
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--theme-accent,#3b82f6)] text-white disabled:opacity-40 hover:opacity-90 transition-all shadow-sm"
          >
            Todos
          </button>
        </div>
      </div>
    </div>
  );
}
