"use client"

import { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import { Editor } from "@tiptap/react"
import { useRouter, useSearchParams } from "next/navigation"

import Topbar from "./Topbar"
import Ribbon from "./Ribbon"
import Sidebar from "./Sidebar"
import StatusBar from "./StatusBar"
import AssistantSidebar from "./AssistantSidebar"
import PrintPreview from "./PrintPreview"
import { dict } from "@/lib/dictionaries"
import { Locale } from "@/lib/i18n-config"
import { toast } from "sonner"

const TiptapYjsEditor = dynamic(() => import("./TiptapYjsEditor"), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-[#8A94A0]">Initializing editor...</div>
})

interface EditorClientProps {
  book: any
  documents: any[]
  characters?: any[]
  notes?: any[]
  dailyGoal?: number
  wordsToday?: number
  currentUser: any
  wsToken: string
  pin?: string | null
  isEncrypted?: boolean
  lang: string
  isPremium?: boolean
}

export default function EditorClient({ 
  book, 
  documents: initialDocuments, 
  characters = [], 
  notes = [], 
  dailyGoal = 1000, 
  wordsToday = 0,
  currentUser, 
  wsToken, 
  pin, 
  isEncrypted, 
  lang, 
  isPremium = false 
}: EditorClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get('search') || ""
  const urlDocId = searchParams.get('docId')

  const [documents, setDocuments] = useState<any[]>(initialDocuments)
  const [bookTitle, setBookTitle] = useState(book.title)
  
  const [activeDocumentId, setActiveDocumentId] = useState<string>(
    urlDocId && documents.some(d => d.id === urlDocId) 
      ? urlDocId 
      : (documents.length > 0 ? documents[0].id : "")
  )
  const [searchQuery, setSearchQuery] = useState(urlSearch)

  // Quick Edit Modal State
  const [quickEditModal, setQuickEditModal] = useState<{
    isOpen: boolean;
    type: 'character' | 'world' | 'note';
    item: any | null;
  }>({ isOpen: false, type: 'note', item: null })
  
  // Editor State Lifted
  const [editor, setEditor] = useState<Editor | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [isSynced, setIsSynced] = useState(true)
  const [editorUpdateTick, setEditorUpdateTick] = useState(0)

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [isRibbonOpen, setIsRibbonOpen] = useState(true)
  const [printScope, setPrintScope] = useState<'chapter' | 'book' | null>(null)
  

  const toggleAssistant = () => {

    setIsAssistantOpen((prev) => {
      const next = !prev
      if (next) setIsLeftSidebarOpen(false) // Collapse left if opening right
      return next
    })
  }

  // Calcule tempo de leitura (aprox 200 palavras por min)
  const readingTime = useMemo(() => {
    const minutes = Math.max(1, Math.ceil(wordCount / 200))
    if (minutes > 60) {
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      return `${h}h ${m}m`
    }
    return `${minutes} min`
  }, [wordCount])

  const handleApplyEdit = (before: string, after: string) => {
    if (!editor) return
    let found = false
    
    // Clean up ellipses and spaces just in case AI added them
    const cleanBefore = before
      .replace(/^(?:\.\.\.|…)\s*/, '')
      .replace(/\s*(?:\.\.\.|…)$/, '')
      .trim();
    if (!cleanBefore) return; // Prevent matching empty string
    
    editor.state.doc.descendants((node, pos) => {
      if (node.isText && node.text && node.text.includes(cleanBefore)) {
        const index = node.text.indexOf(cleanBefore)
        editor.chain().focus().setTextSelection({ from: pos + index, to: pos + index + cleanBefore.length }).insertContent(after).run()
        found = true
        return false // stop traversal
      }
    })

    if (found) {
      toast.success("Sugestão aplicada com sucesso!")
    } else {
      toast.error("Trecho não encontrado. Ele pode ter sido modificado.")
    }
  }

  return (
    <div className="antialiased">
      <div className="flex h-screen w-screen overflow-hidden bg-[var(--theme-bg-main)] text-[var(--theme-text-main)] font-sans transition-colors duration-200">
        
        <div className="flex flex-col flex-1 h-screen overflow-hidden">
          {/* Topbar: Fixed at Top */}
          <Topbar 
            bookId={book.id}
            bookTitle={bookTitle}
            setBookTitle={setBookTitle}
            isSynced={isSynced} 
            isRibbonOpen={isRibbonOpen}
            onToggleRibbon={() => setIsRibbonOpen(!isRibbonOpen)}
            lang={lang as Locale}
            onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          />

        {/* Ribbon: Conditionally rendered below Topbar */}
        {isRibbonOpen && (
          <Ribbon 
            editor={editor} 
            editorUpdateTick={editorUpdateTick} 
            onToggleAssistant={toggleAssistant} 
            isAssistantOpen={isAssistantOpen}
            book={book}
            documents={documents}
            activeDocumentId={activeDocumentId}
            onPrintPreview={setPrintScope}
            lang={lang as Locale}
            isPremium={isPremium}
          />
        )}

        {/* Workspace: Flex-1 remaining space */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar */}
          <Sidebar 
            bookId={book.id}
            documents={documents}
            setDocuments={setDocuments}
            characters={characters}
            notes={notes}
            dailyGoal={dailyGoal}
            wordsToday={wordsToday}
            activeDocumentId={activeDocumentId}
            setActiveDocumentId={setActiveDocumentId}
            wordCount={wordCount}
            readingTime={readingTime}
            isOpen={isLeftSidebarOpen}
            setIsOpen={setIsLeftSidebarOpen}
            onOpenQuickEdit={(type, item) => setQuickEditModal({ isOpen: true, type, item })}
            lang={lang as Locale}
          />

          {/* Main Editor Area */}
          <main className="flex-1 h-full bg-[var(--theme-bg-main)] p-2 sm:p-6 md:px-12 md:py-8 overflow-y-auto flex justify-center relative transition-colors duration-200 custom-scrollbar">
          {activeDocumentId ? (() => {
            const activeDocument = documents.find(d => d.id === activeDocumentId)
            let initialContent = activeDocument?.content || ''
            return (
              <TiptapYjsEditor 
                key={activeDocumentId}
                documentId={activeDocumentId} 
                bookId={book.id}
                currentUser={currentUser} 
                wsToken={wsToken} 
                initialContent={initialContent}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery("")}
                onEditorReady={setEditor}
                onWordCountChange={setWordCount}
                onSyncStatusChange={setIsSynced}
                onEditorStateChange={() => setEditorUpdateTick(t => t + 1)}
              />
            )
          })() : (
            <div className="h-full flex items-center justify-center text-[#8A94A0]">
              {dict[lang as Locale].editor.emptyState}
            </div>
          )}
        </main>
      </div>

      {/* StatusBar: Fixed at Bottom */}
      <StatusBar 
        wordCount={wordCount}
        readingTime={readingTime}
        isSynced={isSynced}
        lang={lang as Locale}
      />
      </div>

      {/* Assistant Sidebar: Full Height on Right */}
      {isAssistantOpen && (
        <AssistantSidebar 
          wsToken={wsToken}
          documentContext={editor ? editor.getText() : ""}
          onClose={() => setIsAssistantOpen(false)}
          lang={lang as Locale}
          isPremium={isPremium}
          onApplyEdit={handleApplyEdit}
          bookId={book.id}
        />
      )}
      
      {/* Print Preview Overlay */}
      {printScope && (
        <PrintPreview 
          book={book}
          documents={documents}
          activeDocumentId={activeDocumentId}
          scope={printScope}
          onClose={() => setPrintScope(null)}
          lang={lang as Locale}
        />
      )}

      {/* Quick Edit Modal */}
      {quickEditModal.isOpen && (
        <QuickEditModal 
          bookId={book.id}
          type={quickEditModal.type}
          item={quickEditModal.item}
          onClose={() => setQuickEditModal({ isOpen: false, type: 'note', item: null })}
        />
      )}
    </div>
    </div>
  )
}

function QuickEditModal({ bookId, type, item, onClose }: { bookId: string, type: 'character' | 'world' | 'note', item: any, onClose: () => void }) {
  const [title, setTitle] = useState(item?.name || item?.title || "");
  const [description, setDescription] = useState(item?.description || item?.content || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    
    try {
      if (type === 'character') {
        const { createCharacterAction, updateCharacterAction } = await import("@/app/actions/character");
        if (item) {
          await updateCharacterAction(item.id, { name: title, description });
        } else {
          await createCharacterAction({ bookId, name: title, description });
        }
      } else if (type === 'note') {
        const { createNoteAction, updateNoteAction } = await import("@/app/actions/note");
        if (item) {
          await updateNoteAction(item.id, { title, content: description });
        } else {
          await createNoteAction({ bookId, title, content: description });
        }
      } else if (type === 'world') {
        const { createWorldNoteAction, updateWorldNoteAction } = await import("@/app/actions/world");
        if (item) {
          await updateWorldNoteAction(item.id, { title, content: description });
        } else {
          await createWorldNoteAction({ bookId, title, content: description });
        }
      }
      toast.success("Salvo com sucesso!");
      router.refresh();
      onClose();
    } catch (e: any) {
      toast.error("Erro ao salvar.");
    } finally {
      setIsLoading(false);
    }
  };

  const titleLabels = {
    character: 'Nome do Personagem',
    world: 'Título do Elemento',
    note: 'Título da Anotação'
  };

  const modalTitles = {
    character: item ? 'Editar Personagem' : 'Novo Personagem',
    world: item ? 'Editar Mundo' : 'Novo Elemento do Mundo',
    note: item ? 'Editar Anotação' : 'Nova Anotação'
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-[var(--theme-border-subtle)] flex items-center justify-between">
          <h2 className="font-semibold text-lg text-[var(--theme-text-main)]">{modalTitles[type]}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--theme-bg-surface-elevated)] rounded-xl transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{titleLabels[type]}</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text-main)] focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="Digite o nome..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descrição</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text-main)] focus:outline-none focus:border-violet-500 transition-colors h-32 resize-none"
              placeholder="Adicione detalhes e informações..."
            />
          </div>
          
          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

