"use client"

import { useEffect, useState } from "react"
import { Book, CheckCircle2, X, Printer, Feather } from "lucide-react"
import { dict } from "@/lib/dictionaries"
import { Locale as Language } from "@/lib/i18n-config"

interface PrintPreviewProps {
  book: any
  documents: any[]
  activeDocumentId: string
  scope: 'chapter' | 'book'
  onClose: () => void
  lang: Language
}

export default function PrintPreview({ book, documents, activeDocumentId, scope, onClose, lang }: PrintPreviewProps) {
  const t = dict[lang].printPreview;
  const [htmlContent, setHtmlContent] = useState<{title: string, content: string}[]>([])
  
  // Calculate word count for footer
  const wordCount = htmlContent.reduce((acc, curr) => {
    // Strip HTML to count words
    const text = curr.content.replace(/<[^>]*>?/gm, '');
    return acc + (text.match(/\S+/g)?.length || 0);
  }, 0);
  
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  useEffect(() => {
    // Esc prevents closing if print dialog is open, but good for UX generally
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (scope === 'chapter') {
      const doc = documents.find(d => d.id === activeDocumentId)
      if (doc) setHtmlContent([{ title: doc.title, content: doc.content }])
    } else {
      setHtmlContent(documents.map(d => ({ title: d.title, content: d.content })))
    }
  }, [scope, documents, activeDocumentId])

  const handlePrint = () => {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write('<!DOCTYPE html><html><head><title>Hermione Export</title>');

    // Copy all styles from the parent document (Tailwind + our custom styles)
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((style) => {
      iframeDoc.write(style.outerHTML);
    });

    iframeDoc.write('</head><body style="background: white !important; margin: 0; padding: 0;">');
    
    // We wrap the content in a div that resets the preview styling for the actual print
    iframeDoc.write('<div style="padding: 24mm; max-width: 100%;">');
    iframeDoc.write(printArea.innerHTML);
    iframeDoc.write('</div>');
    
    iframeDoc.write('</body></html>');
    iframeDoc.close();

    // Small delay to ensure styles are parsed before printing
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Cleanup after print dialog opens
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 500);
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-900/90 backdrop-blur-sm overflow-y-auto no-print">
      
      {/* Floating Action Bar (Hidden in Print) */}
      <div className="sticky top-0 z-[110] flex justify-between items-center p-4 bg-zinc-950/80 border-b border-white/10 backdrop-blur-md">
        <div className="text-zinc-300 font-medium">
          {scope === 'chapter' ? t.titleChapter : t.titleBook}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" /> {t.cancel}
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors flex items-center gap-2 shadow-lg shadow-violet-900/20"
          >
            <Printer className="w-4 h-4" /> {t.print}
          </button>
        </div>
      </div>

      {/* Printable Area - The wrapper creates the scrollable area on desktop */}
      <div className="flex-1 w-full flex justify-center py-10 md:py-16">
        
        <style dangerouslySetInnerHTML={{__html: `
          .print-prose {
            font-family: 'Cormorant Garamond', serif;
            font-size: 21px;
            line-height: 2;
            color: #202020;
            text-align: left;
            hyphens: auto;
          }
          .print-prose p {
            margin-bottom: 28px;
          }
          .print-prose > p:first-of-type::first-letter {
            float: left;
            font-size: 72px;
            line-height: 1;
            font-weight: 600;
            color: #7C3AED;
            margin-right: 12px;
            margin-top: -6px;
          }
          .print-prose blockquote {
            border-left: 4px solid #8B5CF6;
            padding-left: 24px;
            font-style: italic;
            color: #3F3F46;
            margin: 40px 0;
            break-inside: avoid;
          }
          .print-prose hr {
            margin: 64px 0;
            border-top: 1px solid #ECECEC;
          }
          .print-prose h2, .print-prose h3 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 36px;
            font-weight: 600;
            color: #18181B;
            margin-bottom: 24px;
            break-after: avoid;
          }
          .print-prose img {
            border-radius: 12px;
            max-width: 100%;
            height: auto;
            margin: 32px auto;
            break-inside: avoid;
          }

          /* Global Print Styles (Used by the iframe) */
          @media print {
            @page { 
              margin: 0;
              size: A4;
            }
            body { 
              background: white !important; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print { display: none !important; }
            
            .chapter-break {
              page-break-before: always;
              break-before: page;
            }
          }
        `}} />

        {/* The Paper Sheet (Print Container) */}
        <div id="print-area" className="w-full md:max-w-[900px] min-h-[1273px] bg-white md:rounded-[18px] md:border border-zinc-200 shadow-[0_16px_60px_rgba(0,0,0,.08)] p-8 md:p-24 relative overflow-hidden">
          
          {htmlContent.map((chapter, index) => (
            <div key={index} className={index > 0 ? "chapter-break" : ""}>
              
              {/* TOP HEADER */}
              <header className="flex items-center justify-between mb-20 font-sans text-[14px] text-gray-500 font-medium">
                <div className="flex items-center gap-3">
                  <Book className="w-4 h-4" />
                  <span>{book?.title || t.untitledBook}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="font-semibold text-gray-900">{chapter.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Saved</span>
                  <CheckCircle2 className="w-4 h-4 text-violet-500" />
                </div>
              </header>

              {/* CHAPTER LABEL */}
              <div className="uppercase tracking-[0.35em] text-[13px] font-semibold text-violet-600 text-center mb-5 font-sans">
                {scope === 'book' ? `${t.chapterLabel} ${index + 1}` : t.chapterLabel}
              </div>

              {/* MAIN TITLE */}
              <h1 className="font-serif text-[68px] leading-none font-semibold text-center text-zinc-900 mb-7">
                {chapter.title}
              </h1>

              {/* ORNAMENT */}
              <div className="flex items-center justify-center gap-4 mb-20">
                <div className="flex-1 h-px bg-zinc-200"></div>
                <div className="text-violet-500 text-lg leading-none">♦</div>
                <div className="flex-1 h-px bg-zinc-200"></div>
              </div>

              {/* CONTENT COLUMN */}
              <div className="max-w-[720px] mx-auto print-content">
                <div 
                  className="print-prose"
                  dangerouslySetInnerHTML={{ __html: chapter.content || `<p>${t.emptyChapter}</p>` }} 
                />
              </div>

              {/* SECTION DIVIDER IF NOT LAST CHAPTER (Visual only for scroll, ignored in print due to page-break) */}
              {index < htmlContent.length - 1 && (
                <div className="my-32 border-t-2 border-dashed border-zinc-200 no-print" />
              )}
            </div>
          ))}

          {/* FOOTER */}
          <footer className="mt-24 pt-8 border-t border-zinc-200 flex justify-between items-center text-sm text-zinc-500 font-sans font-medium">
            <div className="flex items-center gap-6">
              <span>{wordCount.toLocaleString()} {t.words}</span>
              <span>{lang.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 text-violet-500 opacity-80">
              <Feather className="w-4 h-4" />
              <span>Hermione</span>
            </div>
            <div>
              ~ {readingTime} {t.readTime}
            </div>
          </footer>

        </div>
      </div>
    </div>
  )
}

