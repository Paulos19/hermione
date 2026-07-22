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
    <div className="absolute top-2 right-2 md:right-8 z-50 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] shadow-2xl rounded-xl p-3 w-[300px] flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--theme-text-main)]">Localizar e Substituir</h3>
        <button onClick={onClose} className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] p-1 rounded-md hover:bg-[var(--theme-bg-surface)]"><X className="w-4 h-4"/></button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[var(--theme-text-muted)]" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Localizar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-lg pl-8 pr-16 py-1.5 text-sm text-[var(--theme-text-main)] focus:outline-none focus:border-[var(--theme-accent)]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) prevMatch();
                else nextMatch();
              }
            }}
          />
          {matches.length > 0 && (
            <span className="absolute right-2 top-2 text-[10px] text-[var(--theme-text-muted)]">
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
            className="flex-1 bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-lg px-3 py-1.5 text-sm text-[var(--theme-text-main)] focus:outline-none focus:border-[var(--theme-accent)]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex gap-1">
          <button onClick={prevMatch} disabled={matches.length === 0} className="p-1.5 rounded-md bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] text-[var(--theme-text-main)] disabled:opacity-50 hover:bg-[var(--theme-border)] transition-colors"><ChevronUp className="w-3.5 h-3.5"/></button>
          <button onClick={nextMatch} disabled={matches.length === 0} className="p-1.5 rounded-md bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] text-[var(--theme-text-main)] disabled:opacity-50 hover:bg-[var(--theme-border)] transition-colors"><ChevronDown className="w-3.5 h-3.5"/></button>
        </div>
        <div className="flex gap-1">
          <button onClick={replaceNext} disabled={matches.length === 0} className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] text-[var(--theme-text-main)] disabled:opacity-50 hover:bg-[var(--theme-border)] transition-colors">Substituir</button>
          <button onClick={replaceAll} disabled={matches.length === 0} className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] text-[var(--theme-text-main)] disabled:opacity-50 hover:bg-[var(--theme-border)] transition-colors">Todos</button>
        </div>
      </div>
    </div>
  );
}
