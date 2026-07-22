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
  File
} from "lucide-react";
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
  const [exportMenuOpen, setExportMenuOpen] = useState<string | null>(null);
  
  const fontRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fontRef.current && !fontRef.current.contains(event.target as Node)) setFontMenuOpen(false);
      if (sizeRef.current && !sizeRef.current.contains(event.target as Node)) setSizeMenuOpen(false);
      if (colorRef.current && !colorRef.current.contains(event.target as Node)) setColorMenuOpen(false);
      if (highlightRef.current && !highlightRef.current.contains(event.target as Node)) setHighlightMenuOpen(false);
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) setExportMenuOpen(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editor) {
    return (
      <div className="h-[140px] bg-white dark:bg-[#11161D] border-b border-gray-200 dark:border-white/5 flex items-center justify-center text-gray-500 dark:text-[#8A94A0] shrink-0">
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
  
  const setAlign = (align: string) => editor.chain().focus().setTextAlign(align).run();
  
  const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const clearFormatting = () => editor.chain().focus().clearNodes().run();
  
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();

  const setFontSize = (size: string) => {
    editor.chain().focus().setFontSize(size).run();
    setSizeMenuOpen(false);
  }

  const setFontFamily = (font: string) => {
    // Requires FontFamily extension mapping, using standard for MVP
    editor.chain().focus().setFontFamily(font).run();
    setFontMenuOpen(false);
  }

  const btnBase = "w-[36px] h-[36px] rounded-[10px] flex flex-col items-center justify-center transition-all duration-150 text-gray-500 dark:text-[#8A94A0]";
  const btnHover = "hover:bg-gray-50 dark:bg-white/5 hover:text-gray-900 dark:text-[#F5F5F5]";
  const btnPrimaryActive = "bg-violet-600 text-white dark:bg-[#B899FF] dark:text-[#0A0D12]";
  const btnSmall = "w-[24px] h-[24px] rounded-[6px] flex items-center justify-center transition-all duration-150 text-gray-500 dark:text-[#8A94A0] hover:bg-gray-50 dark:bg-white/5 hover:text-gray-900 dark:text-[#F5F5F5]";

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
    <div className="flex flex-col h-full justify-between py-2 px-4 border-r border-gray-200 dark:border-white/5 last:border-0 shrink-0">
      <div className="flex items-center gap-1">
        {children}
      </div>
      <span className="text-[11px] text-gray-500 dark:text-[#8A94A0] font-medium text-center uppercase tracking-wider mt-auto">{title}</span>
    </div>
  );

  return (
    <div className="min-h-[84px] md:h-[140px] py-2 md:py-0 w-full bg-white dark:bg-[#11161D] border-b border-gray-200 dark:border-white/5 flex items-center px-2 shrink-0 select-none relative z-30 overflow-visible">
      
      {/* Clipboard */}
      <RibbonGroup title={t.clipboard}>
        <div className="flex items-center gap-1">
          <button onClick={handlePaste} className={`${btnBase} opacity-50`} title={t.paste}><ClipboardPaste className="w-5 h-5 mb-1" /> <span className="text-[10px]">Paste</span></button>
          <div className="flex flex-col gap-1">
            <button onClick={handleCut} className={`${btnSmall} opacity-50`} title={t.cut}><Scissors className="w-3.5 h-3.5" /></button>
            <button onClick={handleCopy} className={`${btnSmall} opacity-50`} title={t.copy}><Copy className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </RibbonGroup>

      {/* Typography */}
      <RibbonGroup title={t.font}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            
            {/* Custom Font Dropdown */}
            <div className="relative" ref={fontRef}>
              <button 
                onClick={() => setFontMenuOpen(!fontMenuOpen)}
                className="h-[32px] bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-md px-3 text-sm text-gray-900 dark:text-[#F5F5F5] min-w-[120px] flex items-center justify-between transition-colors"
              >
                <span>{getFontName(currentFont)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-[#8A94A0]" />
              </button>
              {fontMenuOpen && (
                <div className="absolute top-full left-0 mt-1 min-w-[150px] bg-white dark:bg-[#11161D] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl py-1 z-50 max-h-60 overflow-y-auto custom-scrollbar">
                  <button onClick={() => setFontFamily("Inter, sans-serif")} className="w-full text-left px-3 py-1.5 text-sm text-gray-900 dark:text-[#F5F5F5] hover:bg-violet-600 hover:text-white dark:hover:bg-[#B899FF] dark:hover:text-[#0A0D12] font-sans">Inter</button>
                  <button onClick={() => setFontFamily("var(--font-geist-sans), sans-serif")} className="w-full text-left px-3 py-1.5 text-sm text-gray-900 dark:text-[#F5F5F5] hover:bg-violet-600 hover:text-white dark:hover:bg-[#B899FF] dark:hover:text-[#0A0D12] font-sans">Geist</button>
                  <button onClick={() => setFontFamily("var(--font-cormorant-garamond), serif")} className="w-full text-left px-3 py-1.5 text-sm text-gray-900 dark:text-[#F5F5F5] hover:bg-violet-600 hover:text-white dark:hover:bg-[#B899FF] dark:hover:text-[#0A0D12] font-serif">Cormorant</button>
                </div>
              )}
            </div>

            {/* Custom Size Dropdown */}
            <div className="relative" ref={sizeRef}>
              <button 
                onClick={() => setSizeMenuOpen(!sizeMenuOpen)}
                className="h-[32px] bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-md px-3 text-sm text-gray-900 dark:text-[#F5F5F5] w-[70px] flex items-center justify-between transition-colors"
              >
                <span>{currentSize.replace('px', '')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-[#8A94A0]" />
              </button>
              {sizeMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-[#11161D] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl py-1 z-50 max-h-60 overflow-y-auto custom-scrollbar">
                  {['12px', '14px', '17px', '20px', '24px', '34px'].map(size => (
                    <button key={size} onClick={() => setFontSize(size)} className="w-full text-left px-3 py-1.5 text-sm text-gray-900 dark:text-[#F5F5F5] hover:bg-violet-600 hover:text-white dark:hover:bg-[#B899FF] dark:hover:text-[#0A0D12]">{size.replace('px', '')}</button>
                  ))}
                </div>
              )}
            </div>

          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleBold} className={getBtnClass(editor.isActive('bold'))} title="Bold"><Bold className="w-4 h-4" /></button>
            <button onClick={toggleItalic} className={getBtnClass(editor.isActive('italic'))} title="Italic"><Italic className="w-4 h-4" /></button>
            <button onClick={toggleUnderline} className={getBtnClass(editor.isActive('underline'))} title="Underline"><Underline className="w-4 h-4" /></button>
            <button onClick={toggleStrike} className={getBtnClass(editor.isActive('strike'))} title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>
            
            <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
            
            {/* Font Color */}
            <div className="relative" ref={colorRef}>
              <button 
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
                <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-[#11161D] border border-gray-200 dark:border-white/10 rounded-md shadow-xl z-50 grid grid-cols-5 gap-1 w-[140px]">
                  {['#F5F5F5', '#8A94A0', '#B899FF', '#F98181', '#FBCE41', '#4D96FF', '#68CE86', '#0A0D12'].map(color => (
                    <button 
                      key={color} 
                      onClick={() => { editor.chain().focus().setColor(color).run(); setColorMenuOpen(false); }}
                      className="w-5 h-5 rounded-full border border-gray-200 dark:border-white/10" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button onClick={() => { editor.chain().focus().unsetColor().run(); setColorMenuOpen(false); }} className="col-span-5 text-xs text-gray-500 dark:text-[#8A94A0] hover:text-gray-900 dark:text-[#F5F5F5] mt-1">{t.reset}</button>
                </div>
              )}
            </div>

            {/* Highlight Color */}
            <div className="relative" ref={highlightRef}>
              <button 
                onClick={() => setHighlightMenuOpen(!highlightMenuOpen)}
                className={`${btnBase} ${highlightMenuOpen ? 'bg-white/10' : ''}`}
                title={t.highlightColor}
              >
                <div className="flex flex-col items-center">
                  <Highlighter className="w-4 h-4" />
                  <div className="w-3 h-1 mt-[2px] rounded-full" style={{ backgroundColor: currentHighlight !== 'transparent' ? currentHighlight : '#B899FF' }}></div>
                </div>
              </button>
              {highlightMenuOpen && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-[#11161D] border border-gray-200 dark:border-white/10 rounded-md shadow-xl z-50 grid grid-cols-4 gap-1 w-[120px]">
                  {['#B899FF50', '#F9818150', '#FBCE4150', '#4D96FF50', '#68CE8650'].map(color => (
                    <button 
                      key={color} 
                      onClick={() => { editor.chain().focus().setHighlight({ color }).run(); setHighlightMenuOpen(false); }}
                      className="w-5 h-5 rounded-md border border-gray-200 dark:border-white/10" 
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button onClick={() => { editor.chain().focus().unsetHighlight().run(); setHighlightMenuOpen(false); }} className="col-span-4 text-xs text-gray-500 dark:text-[#8A94A0] hover:text-gray-900 dark:text-[#F5F5F5] mt-1">{t.reset}</button>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </RibbonGroup>

      {/* Paragraph */}
      <RibbonGroup title={t.paragraph}>
        <div className="grid grid-cols-4 gap-1">
          <button onClick={() => setAlign('left')} className={getBtnClass(editor.isActive({ textAlign: 'left' }))}><AlignLeft className="w-4 h-4" /></button>
          <button onClick={() => setAlign('center')} className={getBtnClass(editor.isActive({ textAlign: 'center' }))}><AlignCenter className="w-4 h-4" /></button>
          <button onClick={() => setAlign('right')} className={getBtnClass(editor.isActive({ textAlign: 'right' }))}><AlignRight className="w-4 h-4" /></button>
          <button onClick={() => setAlign('justify')} className={getBtnClass(editor.isActive({ textAlign: 'justify' }))}><AlignJustify className="w-4 h-4" /></button>
          
          <button onClick={toggleBulletList} className={getBtnClass(editor.isActive('bulletList'))}><List className="w-4 h-4" /></button>
          <button onClick={toggleOrderedList} className={getBtnClass(editor.isActive('orderedList'))}><ListOrdered className="w-4 h-4" /></button>
          <button onClick={toggleBlockquote} className={getBtnClass(editor.isActive('blockquote'))}><Quote className="w-4 h-4" /></button>
        </div>
      </RibbonGroup>

      {/* Styles */}
      <RibbonGroup title={t.styles}>
        <div className="flex items-center gap-1">
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${getBtnClass(editor.isActive('heading', { level: 1 }))} !w-[80px] !h-[80px]`}>
            <span className="text-2xl font-bold font-serif mb-1 leading-none">Aa</span>
            <span className="text-[10px] uppercase tracking-wider">{t.title}</span>
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${getBtnClass(editor.isActive('heading', { level: 2 }))} !w-[80px] !h-[80px]`}>
            <span className="text-xl font-semibold font-serif mb-1 leading-none">Aa</span>
            <span className="text-[10px] uppercase tracking-wider">{t.chapter}</span>
          </button>
          <button onClick={() => editor.chain().focus().setParagraph().run()} className={`${getBtnClass(editor.isActive('paragraph'))} !w-[80px] !h-[80px]`}>
            <span className="text-base font-medium font-sans mb-1 leading-none">Aa</span>
            <span className="text-[10px] uppercase tracking-wider">{t.normal}</span>
          </button>
        </div>
      </RibbonGroup>

      {/* Insert */}
      <RibbonGroup title={t.insert}>
        <div className="flex items-center gap-1">
          <div className="relative w-[52px] h-[52px]">
            <UploadImageButton editor={editor} />
            <button className={`${btnBase} !w-[52px] !h-[52px] pointer-events-none`}>
              <ImageIcon className="w-5 h-5 mb-1" />
              <span className="text-[10px]">{t.image}</span>
            </button>
          </div>
          <button onClick={() => {
            const url = window.prompt('URL')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }} className={`${btnBase} !w-[52px] !h-[52px] ${editor.isActive('link') ? 'bg-white/10 text-gray-900 dark:text-[#F5F5F5]' : ''}`}>
            <LinkIcon className="w-5 h-5 mb-1" />
            <span className="text-[10px]">{t.link}</span>
          </button>
          <button onClick={handleComment} className={`${btnBase} !w-[52px] !h-[52px] opacity-50`}>
            <MessageSquare className="w-5 h-5 mb-1" />
            <span className="text-[10px]">{t.comment}</span>
          </button>
        </div>
      </RibbonGroup>

      {/* Export */}
      <RibbonGroup title={t.export}>
        <div className="flex items-center gap-1 relative" ref={exportRef}>
          {/* DOCX Menu */}
          <div className="relative">
            <button 
              onClick={() => setExportMenuOpen(exportMenuOpen === 'docx' ? null : 'docx')}
              className={`${btnBase} !w-[52px] !h-[52px] hover:text-[#B899FF] hover:bg-[#B899FF]/10 transition-colors ${exportMenuOpen === 'docx' ? 'text-[#B899FF] bg-[#B899FF]/10' : ''}`}
            >
              <FileText className="w-5 h-5 mb-1" />
              <span className="text-[10px]">DOCX</span>
            </button>
            {exportMenuOpen === 'docx' && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#11161D] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="flex flex-col">
                  <button 
                    onClick={() => handleExportDOCX('chapter')}
                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-900 dark:text-[#F5F5F5] hover:bg-gray-50 dark:bg-white/5 transition-colors"
                  >
                    <span>{t.currentChapter}</span>
                  </button>
                  <button 
                    onClick={() => handleExportDOCX('book')}
                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-900 dark:text-[#F5F5F5] hover:bg-gray-50 dark:bg-white/5 transition-colors border-t border-gray-200 dark:border-white/5"
                  >
                    <span>{t.entireBook}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* HRM Menu */}
          <div className="relative">
            <button 
              onClick={() => setExportMenuOpen(exportMenuOpen === 'hrm' ? null : 'hrm')}
              className={`${btnBase} !w-[52px] !h-[52px] hover:text-[#B899FF] hover:bg-[#B899FF]/10 transition-colors ${exportMenuOpen === 'hrm' ? 'text-[#B899FF] bg-[#B899FF]/10' : ''}`}
            >
              <Download className="w-5 h-5 mb-1" />
              <span className="text-[10px]">.HRM</span>
            </button>
            {exportMenuOpen === 'hrm' && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#11161D] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="flex flex-col">
                  <button 
                    onClick={() => handleExportHRM('chapter')}
                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-900 dark:text-[#F5F5F5] hover:bg-gray-50 dark:bg-white/5 transition-colors"
                  >
                    <span>{t.currentChapter}</span>
                  </button>
                  <button 
                    onClick={() => handleExportHRM('book')}
                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-900 dark:text-[#F5F5F5] hover:bg-gray-50 dark:bg-white/5 transition-colors border-t border-gray-200 dark:border-white/5"
                  >
                    <span>{t.entireBook}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Print / PDF Menu */}
          <div className="relative">
            <button 
              onClick={() => setExportMenuOpen(exportMenuOpen === 'pdf' ? null : 'pdf')}
              className={`${btnBase} !w-[52px] !h-[52px] hover:text-[#B899FF] hover:bg-[#B899FF]/10 transition-colors ${exportMenuOpen === 'pdf' ? 'text-[#B899FF] bg-[#B899FF]/10' : ''}`}
            >
              <File className="w-5 h-5 mb-1" />
              <span className="text-[10px]">PDF</span>
            </button>
            {exportMenuOpen === 'pdf' && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#11161D] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="flex flex-col">
                  <button 
                    onClick={() => {
                      if (onPrintPreview) onPrintPreview('chapter');
                      setExportMenuOpen(null);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-900 dark:text-[#F5F5F5] hover:bg-gray-50 dark:bg-white/5 transition-colors"
                  >
                    <span>{t.currentChapter}</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (onPrintPreview) onPrintPreview('book');
                      setExportMenuOpen(null);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-sm text-gray-900 dark:text-[#F5F5F5] hover:bg-gray-50 dark:bg-white/5 transition-colors border-t border-gray-200 dark:border-white/5"
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
        <button 
          onClick={onToggleAssistant}
          className={`${btnBase} !w-[64px] !h-[52px] ${isAssistantOpen ? 'bg-white/10 text-[#B899FF] shadow-inner' : 'hover:text-[#B899FF]'}`}
        >
          <Wand2 className="w-5 h-5 mb-1" />
          <span className="text-[10px]">{t.assistant}</span>
        </button>
      </RibbonGroup>

    </div>
  );
}



