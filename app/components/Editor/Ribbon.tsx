import React, { useState, useRef, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { generateUploadButton } from "@uploadthing/react";
import { toast } from "sonner";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import {
  ClipboardPaste,
  Scissors,
  Copy,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  MessageSquare,
  Wand2,
  ChevronDown,
  Palette,
  Highlighter,
  Download,
  FileText,
  FileJson,
  File,
  IndentIncrease,
  IndentDecrease,
  ArrowUpDown,
  Search,
  Subscript,
  Superscript,
  Eraser,
  AArrowUp,
  AArrowDown,
  CaseSensitive,
  Table as TableIcon,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  ArrowDownToLine,
  Combine,
  SplitSquareHorizontal,
  Trash2,
  Trash,
  Plus,
  Grid
} from "lucide-react";
import FindAndReplace from "./FindAndReplace";
import { dict } from "@/lib/dictionaries"
import { Locale as Language } from "@/lib/i18n-config";

const UTButton = generateUploadButton<OurFileRouter>();

const utAppearance = {
  button: "w-full h-full opacity-0 cursor-pointer absolute inset-0 z-10",
  container: "w-full h-full absolute inset-0 cursor-pointer",
  allowedContent: "hidden"
};

const utContent = {
  button() {
    return <div className="w-full h-full bg-transparent"></div>;
  }
};

const UploadImageButton = React.memo(({ editor }: { editor: Editor }) => {
  return (
    <UTButton
      endpoint="editorImage"
      onClientUploadComplete={(res) => {
        if (res && res[0]) {
          editor.chain().focus().setImage({ src: res[0].url }).run();
          toast.success("Image inserted");
        }
      }}
      onUploadError={(error: Error) => {
        toast.error(`Failed to upload image: ${error.message}`);
      }}
      appearance={utAppearance}
      content={utContent}
    />
  );
});

interface RibbonProps {
  editor: Editor | null;
  editorUpdateTick: number; // Used to force re-render on tiptap transactions
  onToggleAssistant: () => void;
  isAssistantOpen: boolean;
  book?: any;
  documents?: any[];
  activeDocumentId?: string;
  onPrintPreview?: (scope: 'chapter' | 'book') => void;
  lang: Language;
  isPremium?: boolean;
}

export default function Ribbon({ editor, editorUpdateTick, onToggleAssistant, isAssistantOpen, book, documents, activeDocumentId, onPrintPreview, lang, isPremium = false }: RibbonProps) {
  const t = dict[lang].ribbon;
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false);
  const [lineSpacingMenuOpen, setLineSpacingMenuOpen] = useState(false);
  const [changeCaseMenuOpen, setChangeCaseMenuOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  
  // Table Selector States
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [hoverRows, setHoverRows] = useState(3);
  const [hoverCols, setHoverCols] = useState(3);
  const [customRows, setCustomRows] = useState(3);
  const [customCols, setCustomCols] = useState(3);
  const [withHeaderRow, setWithHeaderRow] = useState(true);
  
  const fontRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineSpacingRef = useRef<HTMLDivElement>(null);
  const changeCaseRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const getFixedStyle = (ref: React.RefObject<HTMLDivElement | null>, width = 160) => {
    if (typeof window === 'undefined' || !ref.current) {
      return { position: 'fixed' as const, top: 120, left: 16, zIndex: 100 };
    }
    const rect = ref.current.getBoundingClientRect();
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 12);
    return {
      position: 'fixed' as const,
      top: `${rect.bottom + 4}px`,
      left: `${left}px`,
      zIndex: 100,
    };
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fontRef.current && !fontRef.current.contains(event.target as Node)) setFontMenuOpen(false);
      if (sizeRef.current && !sizeRef.current.contains(event.target as Node)) setSizeMenuOpen(false);
      if (colorRef.current && !colorRef.current.contains(event.target as Node)) setColorMenuOpen(false);
      if (highlightRef.current && !highlightRef.current.contains(event.target as Node)) setHighlightMenuOpen(false);
      if (lineSpacingRef.current && !lineSpacingRef.current.contains(event.target as Node)) setLineSpacingMenuOpen(false);
      if (changeCaseRef.current && !changeCaseRef.current.contains(event.target as Node)) setChangeCaseMenuOpen(false);
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) setExportMenuOpen(null);
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) setTablePickerOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editor) {
    return (
      <div className="h-[140px] bg-[var(--theme-bg-surface)] border-b border-[var(--theme-border-subtle)] flex items-center justify-center text-[var(--theme-text-muted)] shrink-0">
        Loading workspace...
      </div>
    );
  }

  // Clipboard Actions
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      editor.commands.insertContent(text);
      toast.success("Content pasted successfully");
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      toast.error("Clipboard access denied. Please use Ctrl+V / Cmd+V");
    }
  };
  const handleCopy = () => {
    document.execCommand('copy');
    editor.commands.focus();
  };
  const handleCut = () => {
    document.execCommand('cut');
    editor.commands.focus();
  };

  // Link & Comment
  const handleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);
    
    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleComment = () => {
    const comment = window.prompt('Add a comment to this section:');
    if (comment) {
      editor.chain().focus().setHighlight({ color: 'rgba(184, 153, 255, 0.4)' }).run();
    }
  };

  const getExportHTML = (scope: 'chapter' | 'book') => {
    let html = '';
    let docTitle = '';

    if (scope === 'chapter') {
      const doc = documents?.find(d => d.id === activeDocumentId);
      docTitle = doc?.title || 'Capítulo';
      html = `<div class="chapter-content">${editor.getHTML()}</div>`;
    } else {
      docTitle = book?.title || 'Livro';
      // Concatena todos os capítulos
      if (documents) {
        html = documents.map((doc, index) => {
          // Add a page break before each chapter except the first
          const pageBreak = index > 0 ? '<div class="html2pdf__page-break"></div>' : '';
          return `
            ${pageBreak}
            <div class="chapter-content">
              <h2 style="text-align: center; margin-bottom: 2em; font-family: 'Cormorant Garamond', serif;">${doc.title}</h2>
              ${doc.content || ''}
            </div>
          `;
        }).join('');
      }
    }
    return { html, docTitle };
  };

  // Exports
  const handleExportPDF = (scope: 'chapter' | 'book') => {
    setExportMenuOpen(null);
    if (onPrintPreview) {
      onPrintPreview(scope);
    }
  };

  const handleExportDOCX = async (scope: 'chapter' | 'book') => {
    setExportMenuOpen(null);
    const toastId = toast.loading("Generating DOCX...");
    try {
      const { html, docTitle } = getExportHTML(scope);
      
      // Inject Title into HTML if it's a book
      const finalHtml = scope === 'book' ? `<h1 style="text-align:center;">${book?.title || 'Livro'}</h1>${html}` : html;

      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: finalHtml })
      });
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = scope === 'book' ? `${book?.title || 'livro'}.docx` : `${docTitle}.docx`;
      a.download = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("DOCX exported successfully", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to export DOCX", { id: toastId });
    }
  };

  const handleExportHRM = (scope: 'chapter' | 'book') => {
    setExportMenuOpen(null);
    if (!isPremium) {
      toast.error("A exportação .hrm é exclusiva para usuários Premium.");
      return;
    }
    try {
      const { html, docTitle } = getExportHTML(scope);
      
      const data = {
        type: "hermione_document",
        version: "1.1",
        scope: scope,
        timestamp: new Date().toISOString(),
        title: scope === 'book' ? book?.title : docTitle,
        html: html,
        json: scope === 'chapter' ? editor.getJSON() : documents?.map(d => ({ title: d.title, content: d.content }))
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = scope === 'book' ? `${book?.title || 'livro'}.hrm` : `${docTitle}.hrm`;
      a.download = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(".hrm exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export .hrm");
    }
  };

  // Typography
  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleSubscript = () => editor.chain().focus().toggleSubscript().run();
  const toggleSuperscript = () => editor.chain().focus().toggleSuperscript().run();
  
  const setAlign = (align: string) => editor.chain().focus().setTextAlign(align).run();
  
  const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
    
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();

  const increaseIndent = () => editor.chain().focus().indent().run();
  const decreaseIndent = () => editor.chain().focus().outdent().run();
  const setLineSpacing = (spacing: string) => {
    editor.chain().focus().setLineHeight(spacing).run();
    setLineSpacingMenuOpen(false);
  }

  
  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  const increaseFontSize = () => {
    const currentSize = editor.getAttributes('textStyle')?.fontSize || "16px";
    const num = parseInt(currentSize.replace('px', ''));
    if (!isNaN(num) && num < 120) {
      editor.chain().focus().setFontSize(`${num + 1}px`).run();
    }
  };

  
  const setChangeCase = (type: 'upper' | 'lower' | 'capitalize') => {
    if (type === 'upper') editor.chain().focus().setUppercase().run();
    else if (type === 'lower') editor.chain().focus().setLowercase().run();
    else if (type === 'capitalize') editor.chain().focus().setCapitalize().run();
    setChangeCaseMenuOpen(false);
  };

  const decreaseFontSize = () => {
    const currentSize = editor.getAttributes('textStyle')?.fontSize || "16px";
    const num = parseInt(currentSize.replace('px', ''));
    if (!isNaN(num) && num > 8) {
      editor.chain().focus().setFontSize(`${num - 1}px`).run();
    }
  };

  const setFontSize = (size: string) => {
    editor.chain().focus().setFontSize(size).run();
    setSizeMenuOpen(false);
  }

  const setFontFamily = (font: string) => {
    // Requires FontFamily extension mapping, using standard for MVP
    editor.chain().focus().setFontFamily(font).run();
    setFontMenuOpen(false);
  }

  const btnBase = "w-[36px] h-[36px] rounded-[10px] flex flex-col items-center justify-center transition-all duration-150 text-[var(--theme-text-muted)]";
  const btnHover = "hover:bg-[var(--theme-bg-surface-elevated)] hover:text-[var(--theme-text-main)]";
  const btnPrimaryActive = "bg-violet-600 text-white dark:bg-[#B899FF] dark:text-[#0A0D12]";
  const btnSmall = "w-[24px] h-[24px] rounded-[6px] flex items-center justify-center transition-all duration-150 text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg-surface-elevated)] hover:text-[var(--theme-text-main)]";

  const getBtnClass = (isActive: boolean) => {
    return `${btnBase} ${isActive ? btnPrimaryActive : btnHover}`;
  };

  // Obter atributos atuais do editor para exibir nos botões
  const currentFont = editor.getAttributes('textStyle')?.fontFamily || "";
  const currentSize = editor.getAttributes('textStyle')?.fontSize || "16px";
  const currentColor = editor.getAttributes('textStyle')?.color || "#F5F5F5";
  const currentHighlight = editor.getAttributes('highlight')?.color || "transparent";
  
  const getFontName = (font: string) => {
    if (font.includes("geist")) return "Geist";
    if (font.includes("cormorant")) return "Cormorant";
    return "Inter";
  };

  const RibbonGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="flex flex-col h-full min-h-[76px] justify-between py-2 px-2 xl:px-4 border-r border-[var(--theme-border-subtle)] last:border-0 shrink-0">
      <div className="flex items-center gap-1">
        {children}
      </div>
      <span className="text-[10px] md:text-[11px] text-[var(--theme-text-muted)] font-medium text-center uppercase tracking-wider mt-auto">{title}</span>
    </div>
  );

  return (
    <div className="w-full bg-[var(--theme-bg-surface)] border-b border-[var(--theme-border-subtle)] flex flex-col relative z-[60]">
      
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-2 overflow-x-auto scrollbar-hide">
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => setActiveTab('home')} className={`whitespace-nowrap px-4 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${activeTab === 'home' ? 'bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-text-main)] border border-b-0 border-[var(--theme-border-subtle)]' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)]/50'}`}>
          Página Inicial
        </button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => setActiveTab('insert')} className={`whitespace-nowrap px-4 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${activeTab === 'insert' ? 'bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-text-main)] border border-b-0 border-[var(--theme-border-subtle)]' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)]/50'}`}>
          Inserir
        </button>
        <button onMouseDown={(e) => e.preventDefault()} onClick={() => setActiveTab('tools')} className={`whitespace-nowrap px-4 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${activeTab === 'tools' ? 'bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-text-main)] border border-b-0 border-[var(--theme-border-subtle)]' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)]/50'}`}>
          Ferramentas
        </button>
      </div>

      {/* Ribbon Content */}
      <div className="min-h-[85px] md:min-h-[100px] py-1 md:py-0 w-full bg-[var(--theme-bg-surface-elevated)] flex items-center px-2 shrink-0 select-none overflow-x-auto custom-scrollbar md:overflow-visible flex-nowrap gap-1.5 md:gap-2 shadow-sm relative z-[60]">
        
        {activeTab === 'home' && (
          <>
      
      {/* Clipboard */}
      <RibbonGroup title={t.clipboard}>
        <div className="flex items-center gap-1">
          <button onMouseDown={(e) => e.preventDefault()} onClick={handlePaste} className={`${btnBase} opacity-50`} title={t.paste}><ClipboardPaste className="w-5 h-5 mb-1" /> <span className="text-[10px]">Paste</span></button>
          <div className="flex flex-col gap-1">
            <button onMouseDown={(e) => e.preventDefault()} onClick={handleCut} className={`${btnSmall} opacity-50`} title={t.cut}><Scissors className="w-3.5 h-3.5" /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={handleCopy} className={`${btnSmall} opacity-50`} title={t.copy}><Copy className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </RibbonGroup>

      {/* Typography */}
      <RibbonGroup title={t.font}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            
            {/* Custom Font Dropdown */}
            <div className="relative" ref={fontRef}>
              <button onMouseDown={(e) => e.preventDefault()} 
                onClick={() => setFontMenuOpen(!fontMenuOpen)}
                className="h-[32px] bg-[var(--theme-bg-surface-elevated)] hover:bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-md px-2 text-sm text-[var(--theme-text-main)] min-w-[100px] flex items-center justify-between transition-colors"
              >
                <span>{getFontName(currentFont)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--theme-text-muted)]" />
              </button>
              {fontMenuOpen && (
                <div 
                  className="fixed z-[100] min-w-[150px] bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-2xl py-1 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                  style={getFixedStyle(fontRef, 150)}
                >
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setFontFamily("Inter, sans-serif"); setFontMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs font-medium text-[var(--theme-text-main)] hover:bg-[var(--theme-accent)] hover:text-white font-sans">Inter</button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setFontFamily("var(--font-geist-sans), sans-serif"); setFontMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs font-medium text-[var(--theme-text-main)] hover:bg-[var(--theme-accent)] hover:text-white font-sans">Geist</button>
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setFontFamily("var(--font-cormorant-garamond), serif"); setFontMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs font-medium text-[var(--theme-text-main)] hover:bg-[var(--theme-accent)] hover:text-white font-serif">Cormorant</button>
                </div>
              )}
            </div>

            {/* Custom Size Dropdown */}
            <div className="relative" ref={sizeRef}>
              <button onMouseDown={(e) => e.preventDefault()} 
                onClick={() => setSizeMenuOpen(!sizeMenuOpen)}
                className="h-[32px] bg-[var(--theme-bg-surface-elevated)] hover:bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-md px-2 text-sm text-[var(--theme-text-main)] w-[56px] flex items-center justify-between transition-colors"
              >
                <span>{currentSize.replace('px', '')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--theme-text-muted)]" />
              </button>
              {sizeMenuOpen && (
                <div 
                  className="fixed z-[100] w-[70px] bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-2xl py-1 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                  style={getFixedStyle(sizeRef, 70)}
                >
                  {['12px', '14px', '17px', '20px', '24px', '34px'].map(size => (
                    <button onMouseDown={(e) => e.preventDefault()} key={size} onClick={() => { setFontSize(size); setSizeMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs font-medium text-[var(--theme-text-main)] hover:bg-[var(--theme-accent)] hover:text-white">{size.replace('px', '')}</button>
                  ))}
                </div>
              )}
            </div>

          </div>
          <div className="flex items-center gap-1">
            <button onMouseDown={(e) => e.preventDefault()} onClick={toggleBold} className={getBtnClass(editor.isActive('bold'))} title="Bold"><Bold className="w-4 h-4" /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={toggleItalic} className={getBtnClass(editor.isActive('italic'))} title="Italic"><Italic className="w-4 h-4" /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={toggleUnderline} className={getBtnClass(editor.isActive('underline'))} title="Underline"><Underline className="w-4 h-4" /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={toggleStrike} className={getBtnClass(editor.isActive('strike'))} title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={toggleSubscript} className={getBtnClass(editor.isActive('subscript'))} title="Subscript"><Subscript className="w-4 h-4" /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={toggleSuperscript} className={getBtnClass(editor.isActive('superscript'))} title="Superscript"><Superscript className="w-4 h-4" /></button>
          <div className="w-[1px] h-6 bg-[var(--theme-border)] mx-1" />
          <button onMouseDown={(e) => e.preventDefault()} onClick={clearFormatting} className={`${btnBase} ${btnHover}`} title="Limpar Formatação"><Eraser className="w-4 h-4" /></button>
            
            <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
            
            {/* Font Color */}
            <div className="relative" ref={colorRef}>
              <button onMouseDown={(e) => e.preventDefault()} 
                onClick={() => setColorMenuOpen(!colorMenuOpen)}
                className={`${btnBase} ${btnHover}`}
                title="Font Color"
              >
                <div className="flex flex-col items-center">
                  <Palette className="w-4 h-4" />
                  <div className="w-3 h-1 mt-[2px] rounded-full" style={{ backgroundColor: currentColor }}></div>
                </div>
              </button>
              {colorMenuOpen && (
                <div 
                  className="fixed z-[100] p-2 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-2xl grid grid-cols-5 gap-1 w-[140px] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                  style={getFixedStyle(colorRef, 140)}
                >
                  {['#F5F5F5', '#8A94A0', '#B899FF', '#F98181', '#FBCE41', '#4D96FF', '#68CE86', '#0A0D12'].map(color => (
                    <button onMouseDown={(e) => e.preventDefault()} 
                      key={color} 
                      onClick={() => { editor.chain().focus().setColor(color).run(); setColorMenuOpen(false); }}
                      className="w-5 h-5 rounded-full border border-[var(--theme-border)] hover:scale-110 transition-transform" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().unsetColor().run(); setColorMenuOpen(false); }} className="col-span-5 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] mt-1">{t.reset}</button>
                </div>
              )}
            </div>

            {/* Highlight Color */}
            <div className="relative" ref={highlightRef}>
              <button onMouseDown={(e) => e.preventDefault()} 
                onClick={() => setHighlightMenuOpen(!highlightMenuOpen)}
                className={`${btnBase} ${highlightMenuOpen ? 'bg-[var(--theme-bg-surface-elevated)]' : ''}`}
                title={t.highlightColor}
              >
                <div className="flex flex-col items-center">
                  <Highlighter className="w-4 h-4" />
                  <div className="w-3 h-1 mt-[2px] rounded-full" style={{ backgroundColor: currentHighlight !== 'transparent' ? currentHighlight : '#B899FF' }}></div>
                </div>
              </button>
              {highlightMenuOpen && (
                <div 
                  className="fixed z-[100] p-2 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-2xl grid grid-cols-4 gap-1 w-[120px] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                  style={getFixedStyle(highlightRef, 120)}
                >
                  {['#B899FF50', '#F9818150', '#FBCE4150', '#4D96FF50', '#68CE8650'].map(color => (
                    <button onMouseDown={(e) => e.preventDefault()} 
                      key={color} 
                      onClick={() => { editor.chain().focus().setHighlight({ color }).run(); setHighlightMenuOpen(false); }}
                      className="w-5 h-5 rounded-md border border-[var(--theme-border)] hover:scale-110 transition-transform" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().unsetHighlight().run(); setHighlightMenuOpen(false); }} className="col-span-4 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] mt-1">{t.reset}</button>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </RibbonGroup>

      {/* Paragraph */}
      <RibbonGroup title={t.paragraph}>
        <div className="grid grid-cols-5 gap-1">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => setAlign('left')} className={getBtnClass(editor.isActive({ textAlign: 'left' }))} title="Align Left"><AlignLeft className="w-4 h-4" /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => setAlign('center')} className={getBtnClass(editor.isActive({ textAlign: 'center' }))} title="Align Center"><AlignCenter className="w-4 h-4" /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => setAlign('right')} className={getBtnClass(editor.isActive({ textAlign: 'right' }))} title="Align Right"><AlignRight className="w-4 h-4" /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => setAlign('justify')} className={getBtnClass(editor.isActive({ textAlign: 'justify' }))} title="Justify"><AlignJustify className="w-4 h-4" /></button>
          
          <div className="relative" ref={lineSpacingRef}>
             <button onMouseDown={(e) => e.preventDefault()} onClick={() => setLineSpacingMenuOpen(!lineSpacingMenuOpen)} className={`${btnBase} ${btnHover}`} title="Line Spacing"><ArrowUpDown className="w-4 h-4" /></button>
             {lineSpacingMenuOpen && (
                <div 
                  className="fixed z-[100] w-24 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-2xl py-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                  style={getFixedStyle(lineSpacingRef, 96)}
                >
                  {['1', '1.15', '1.5', '2'].map(spacing => (
                    <button onMouseDown={(e) => e.preventDefault()} key={spacing} onClick={() => { setLineSpacing(spacing); setLineSpacingMenuOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs font-medium text-[var(--theme-text-main)] hover:bg-[var(--theme-accent)] hover:text-white">{spacing}</button>
                  ))}
                </div>
             )}
          </div>
          
          <button onMouseDown={(e) => e.preventDefault()} onClick={toggleBulletList} className={getBtnClass(editor.isActive('bulletList'))} title="Bullet List"><List className="w-4 h-4" /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={toggleOrderedList} className={getBtnClass(editor.isActive('orderedList'))} title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={decreaseIndent} className={`${btnBase} ${btnHover}`} title="Decrease Indent"><IndentDecrease className="w-4 h-4" /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={increaseIndent} className={`${btnBase} ${btnHover}`} title="Increase Indent"><IndentIncrease className="w-4 h-4" /></button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={toggleBlockquote} className={getBtnClass(editor.isActive('blockquote'))} title="Quote"><Quote className="w-4 h-4" /></button>
        </div>
      </RibbonGroup>

      {/* Styles */}
      <RibbonGroup title={t.styles}>
        <div className="flex items-center gap-0.5">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${getBtnClass(editor.isActive('heading', { level: 1 }))} !w-[56px] !h-[56px] !rounded-xl`}>
            <span className="text-xl font-bold font-serif mb-1 leading-none">Aa</span>
            <span className="text-[9px] uppercase tracking-wider">{t.title}</span>
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${getBtnClass(editor.isActive('heading', { level: 2 }))} !w-[56px] !h-[56px] !rounded-xl`}>
            <span className="text-lg font-semibold font-serif mb-1 leading-none">Aa</span>
            <span className="text-[9px] uppercase tracking-wider">{t.chapter}</span>
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().setParagraph().run()} className={`${getBtnClass(editor.isActive('paragraph'))} !w-[56px] !h-[56px] !rounded-xl`}>
            <span className="text-sm font-medium font-sans mb-1 leading-none">Aa</span>
            <span className="text-[9px] uppercase tracking-wider">{t.normal}</span>
          </button>
        </div>
      </RibbonGroup>

      {/* Edição */}
      <RibbonGroup title="Edição">
        <div className="flex flex-col gap-1 justify-center h-full">
          <button 
            onMouseDown={(e) => e.preventDefault()} 
            onClick={() => setIsFindReplaceOpen(!isFindReplaceOpen)} 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-150 ${isFindReplaceOpen ? 'bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-text-main)]' : 'text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg-surface-elevated)] hover:text-[var(--theme-text-main)]'}`}
          >
            <Search className="w-4 h-4" />
            <span className="text-xs font-medium">Localizar</span>
            <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
          </button>
        </div>
      </RibbonGroup>

      </>
        )}

        {activeTab === 'insert' && (
          <>
      {/* Insert */}
      <RibbonGroup title={t.insert}>
        <div className="flex items-center gap-0.5">
          
          <div className="relative" ref={tableRef}>
            <button 
              onMouseDown={(e) => e.preventDefault()} 
              onClick={() => setTablePickerOpen(!tablePickerOpen)} 
              className={`${getBtnClass(editor.isActive('table'))} !w-[48px] !h-[48px] relative flex flex-col items-center justify-center`} 
              title="Inserir Tabela Personalizada"
            >
              <TableIcon className="w-4 h-4 mb-1" />
              <span className="text-[9px]">Tabela</span>
            </button>

            {tablePickerOpen && (
              <div 
                className="fixed z-[100] p-3 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-2xl shadow-2xl min-w-[240px] text-[var(--theme-text-main)] flex flex-col gap-3 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                style={getFixedStyle(tableRef, 240)}
              >
                {editor.isActive('table') && (
                  <div className="pb-2 border-b border-[var(--theme-border-subtle)]">
                    <button
                      onClick={() => {
                        editor.chain().focus().deleteTable().run();
                        setTablePickerOpen(false);
                      }}
                      className="w-full py-1.5 px-3 bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-red-500/20 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover Tabela Selecionada
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-[var(--theme-border-subtle)] pb-2">
                  <span className="text-xs font-semibold flex items-center gap-1.5">
                    <TableIcon className="w-3.5 h-3.5 text-[var(--theme-accent,#3b82f6)]" />
                    Inserir Tabela
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[var(--theme-accent,#3b82f6)] bg-[var(--theme-accent,#3b82f6)]/10 px-2 py-0.5 rounded">
                    {hoverCols} x {hoverRows}
                  </span>
                </div>

                {/* Grid Selector 10x10 */}
                <div className="flex flex-col gap-1 items-center justify-center p-2 bg-[var(--theme-bg-surface)] rounded-lg border border-[var(--theme-border-subtle)]">
                  {Array.from({ length: 10 }).map((_, rIndex) => (
                    <div key={rIndex} className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, cIndex) => {
                        const isSelected = rIndex < hoverRows && cIndex < hoverCols;
                        return (
                          <div
                            key={cIndex}
                            onMouseEnter={() => {
                              setHoverRows(rIndex + 1);
                              setHoverCols(cIndex + 1);
                            }}
                            onClick={() => {
                              editor.chain().focus().insertTable({ rows: rIndex + 1, cols: cIndex + 1, withHeaderRow }).run();
                              setTablePickerOpen(false);
                            }}
                            className={`w-3.5 h-3.5 rounded-sm transition-all duration-75 cursor-pointer border ${
                              isSelected
                                ? "bg-[var(--theme-accent,#3b82f6)] border-[var(--theme-accent,#3b82f6)] shadow-sm"
                                : "bg-transparent border-[var(--theme-border-subtle)] hover:border-[var(--theme-border)]"
                            }`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Manual inputs & header toggle */}
                <div className="flex flex-col gap-2 pt-1 border-t border-[var(--theme-border-subtle)]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center justify-between text-[11px] text-[var(--theme-text-muted)]">
                      <span>Colunas:</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={customCols}
                        onChange={(e) => setCustomCols(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 h-6 px-1 text-center bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded text-xs text-[var(--theme-text-main)] outline-none focus:border-[var(--theme-accent)]"
                      />
                    </div>
                    <div className="flex-1 flex items-center justify-between text-[11px] text-[var(--theme-text-muted)]">
                      <span>Linhas:</span>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={customRows}
                        onChange={(e) => setCustomRows(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 h-6 px-1 text-center bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded text-xs text-[var(--theme-text-main)] outline-none focus:border-[var(--theme-accent)]"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-[11px] text-[var(--theme-text-muted)] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={withHeaderRow}
                      onChange={(e) => setWithHeaderRow(e.target.checked)}
                      className="rounded accent-[var(--theme-accent,#3b82f6)] cursor-pointer"
                    />
                    Linha de Cabeçalho
                  </label>

                  <button
                    onClick={() => {
                      editor.chain().focus().insertTable({ rows: customRows, cols: customCols, withHeaderRow }).run();
                      setTablePickerOpen(false);
                    }}
                    className="w-full mt-1 py-1.5 bg-[var(--theme-accent,#3b82f6)] text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Inserir Tabela ({customCols}x{customRows})
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative w-[48px] h-[48px]">
            <UploadImageButton editor={editor} />
            <button onMouseDown={(e) => e.preventDefault()} className={`${btnBase} !w-[48px] !h-[48px] pointer-events-none`}>
              <ImageIcon className="w-4 h-4 mb-1" />
              <span className="text-[9px]">{t.image}</span>
            </button>
          </div>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => {
            const url = window.prompt('URL')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }} className={`${btnBase} !w-[48px] !h-[48px] ${editor.isActive('link') ? 'bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-text-main)]' : ''}`}>
            <LinkIcon className="w-4 h-4 mb-1" />
            <span className="text-[9px]">{t.link}</span>
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={handleComment} className={`${btnBase} !w-[48px] !h-[48px] opacity-50`}>
            <MessageSquare className="w-4 h-4 mb-1" />
            <span className="text-[9px]">{t.comment}</span>
          </button>
        </div>
      </RibbonGroup>

      {/* Ferramentas Contextuais da Tabela */}
      {editor.isActive('table') && (
        <RibbonGroup title="Tabela">
          <div className="flex items-center gap-0.5">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className={`${btnBase} !h-[48px] px-2 flex-col`}
              title="Adicionar Coluna à Esquerda"
            >
              <ArrowLeftToLine className="w-4 h-4 mb-0.5" />
              <span className="text-[9px]">+ Col Esq</span>
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className={`${btnBase} !h-[48px] px-2 flex-col`}
              title="Adicionar Coluna à Direita"
            >
              <ArrowRightToLine className="w-4 h-4 mb-0.5" />
              <span className="text-[9px]">+ Col Dir</span>
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className={`${btnBase} !h-[48px] px-2 flex-col text-red-400 hover:text-red-500`}
              title="Excluir Coluna"
            >
              <Trash className="w-4 h-4 mb-0.5" />
              <span className="text-[9px]">Del Col</span>
            </button>

            <div className="w-[1px] h-6 bg-[var(--theme-border)] mx-1" />

            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className={`${btnBase} !h-[48px] px-2 flex-col`}
              title="Adicionar Linha Acima"
            >
              <ArrowUpToLine className="w-4 h-4 mb-0.5" />
              <span className="text-[9px]">+ Lin Acima</span>
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className={`${btnBase} !h-[48px] px-2 flex-col`}
              title="Adicionar Linha Abaixo"
            >
              <ArrowDownToLine className="w-4 h-4 mb-0.5" />
              <span className="text-[9px]">+ Lin Abaixo</span>
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteRow().run()}
              className={`${btnBase} !h-[48px] px-2 flex-col text-red-400 hover:text-red-500`}
              title="Excluir Linha"
            >
              <Trash className="w-4 h-4 mb-0.5" />
              <span className="text-[9px]">Del Lin</span>
            </button>

            <div className="w-[1px] h-6 bg-[var(--theme-border)] mx-1" />

            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().mergeCells().run()}
              className={`${btnBase} !h-[48px] px-2 flex-col`}
              title="Mesclar Células"
            >
              <Combine className="w-4 h-4 mb-0.5" />
              <span className="text-[9px]">Mesclar</span>
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().splitCell().run()}
              className={`${btnBase} !h-[48px] px-2 flex-col`}
              title="Dividir Célula"
            >
              <SplitSquareHorizontal className="w-4 h-4 mb-0.5" />
              <span className="text-[9px]">Dividir</span>
            </button>

            <div className="w-[1px] h-6 bg-[var(--theme-border)] mx-1" />

            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteTable().run()}
              className={`${btnBase} !h-[48px] px-2 flex-col text-red-500 hover:text-red-600`}
              title="Excluir Tabela Completa"
            >
              <Trash2 className="w-4 h-4 mb-0.5" />
              <span className="text-[9px]">Excluir Tab</span>
            </button>
          </div>
        </RibbonGroup>
      )}

      </>
        )}

        {activeTab === 'tools' && (
          <>
      {/* Export */}
      <RibbonGroup title={t.export}>
        <div className="flex items-center gap-0.5 relative" ref={exportRef}>
          {/* DOCX Menu */}
          <div className="relative">
            <button onMouseDown={(e) => e.preventDefault()} 
              onClick={() => setExportMenuOpen(exportMenuOpen === 'docx' ? null : 'docx')}
              className={`${btnBase} !w-[48px] !h-[48px] hover:text-[var(--theme-accent)] transition-colors ${exportMenuOpen === 'docx' ? 'text-[var(--theme-accent)] bg-[var(--theme-bg-surface-elevated)]' : ''}`}
            >
              <FileText className="w-4 h-4 mb-1" />
              <span className="text-[9px]">DOCX</span>
            </button>
            {exportMenuOpen === 'docx' && (
              <div 
                className="fixed z-[100] w-48 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-2xl py-1 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                style={getFixedStyle(exportRef, 190)}
              >
                <div className="flex flex-col">
                  <button onMouseDown={(e) => e.preventDefault()} 
                    onClick={() => { handleExportDOCX('chapter'); setExportMenuOpen(null); }}
                    className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--theme-text-main)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors"
                  >
                    <span>{t.currentChapter}</span>
                  </button>
                  <button onMouseDown={(e) => e.preventDefault()} 
                    onClick={() => { handleExportDOCX('book'); setExportMenuOpen(null); }}
                    className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--theme-text-main)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors border-t border-[var(--theme-border-subtle)]"
                  >
                    <span>{t.entireBook}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* HRM Menu */}
          <div className="relative">
            <button onMouseDown={(e) => e.preventDefault()} 
              onClick={() => setExportMenuOpen(exportMenuOpen === 'hrm' ? null : 'hrm')}
              className={`${btnBase} !w-[48px] !h-[48px] hover:text-[var(--theme-accent)] transition-colors ${exportMenuOpen === 'hrm' ? 'text-[var(--theme-accent)] bg-[var(--theme-bg-surface-elevated)]' : ''}`}
            >
              <Download className="w-4 h-4 mb-1" />
              <span className="text-[9px]">.HRM</span>
            </button>
            {exportMenuOpen === 'hrm' && (
              <div 
                className="fixed z-[100] w-48 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-2xl py-1 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                style={getFixedStyle(exportRef, 190)}
              >
                <div className="flex flex-col">
                  <button onMouseDown={(e) => e.preventDefault()} 
                    onClick={() => { handleExportHRM('chapter'); setExportMenuOpen(null); }}
                    className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--theme-text-main)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors"
                  >
                    <span>{t.currentChapter}</span>
                  </button>
                  <button onMouseDown={(e) => e.preventDefault()} 
                    onClick={() => { handleExportHRM('book'); setExportMenuOpen(null); }}
                    className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--theme-text-main)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors border-t border-[var(--theme-border-subtle)]"
                  >
                    <span>{t.entireBook}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Print / PDF Menu */}
          <div className="relative">
            <button onMouseDown={(e) => e.preventDefault()} 
              onClick={() => setExportMenuOpen(exportMenuOpen === 'pdf' ? null : 'pdf')}
              className={`${btnBase} !w-[48px] !h-[48px] hover:text-[var(--theme-accent)] transition-colors ${exportMenuOpen === 'pdf' ? 'text-[var(--theme-accent)] bg-[var(--theme-bg-surface-elevated)]' : ''}`}
            >
              <File className="w-4 h-4 mb-1" />
              <span className="text-[9px]">PDF</span>
            </button>
            {exportMenuOpen === 'pdf' && (
              <div 
                className="fixed z-[100] w-48 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl shadow-2xl py-1 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
                style={getFixedStyle(exportRef, 190)}
              >
                <div className="flex flex-col">
                  <button onMouseDown={(e) => e.preventDefault()} 
                    onClick={() => {
                      if (onPrintPreview) onPrintPreview('chapter');
                      setExportMenuOpen(null);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--theme-text-main)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors"
                  >
                    <span>{t.currentChapter}</span>
                  </button>
                  <button onMouseDown={(e) => e.preventDefault()} 
                    onClick={() => {
                      if (onPrintPreview) onPrintPreview('book');
                      setExportMenuOpen(null);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[var(--theme-text-main)] hover:bg-[var(--theme-accent)] hover:text-white transition-colors border-t border-[var(--theme-border-subtle)]"
                  >
                    <span>{t.entireBook}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </RibbonGroup>

      {/* Intelligence */}
      <RibbonGroup title={t.intelligence}>
        <button onMouseDown={(e) => e.preventDefault()} 
          onClick={onToggleAssistant}
          className={`${btnBase} !w-[48px] !h-[48px] ${isAssistantOpen ? 'bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-accent)] shadow-inner' : 'hover:text-[var(--theme-accent)]'}`}
        >
          <Wand2 className="w-4 h-4 mb-1" />
          <span className="text-[9px]">{t.assistant}</span>
        </button>
      </RibbonGroup>
          </>
        )}

      </div>
    
      <FindAndReplace 
        editor={editor}
        isOpen={isFindReplaceOpen}
        onClose={() => setIsFindReplaceOpen(false)}
        lang={lang}
      />
    </div>
  );
}



