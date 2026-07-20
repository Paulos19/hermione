"use client"

import { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import { Editor } from "@tiptap/react"
import { useRouter } from "next/navigation"

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
  currentUser: any
  wsToken: string
  pin?: string | null
  isEncrypted?: boolean
  lang: string
  isPremium?: boolean
}

export default function EditorClient({ book, documents, currentUser, wsToken, pin, isEncrypted, lang, isPremium = false }: EditorClientProps) {
  const router = useRouter()
  const [activeDocumentId, setActiveDocumentId] = useState<string>(
    documents.length > 0 ? documents[0].id : ""
  )
  
  // Editor State Lifted
  const [editor, setEditor] = useState<Editor | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [isSynced, setIsSynced] = useState(true)
  const [editorUpdateTick, setEditorUpdateTick] = useState(0)

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [isRibbonOpen, setIsRibbonOpen] = useState(true)
  const [printScope, setPrintScope] = useState<'chapter' | 'book' | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('hermione-theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('hermione-theme', next)
      return next
    })
  }

  const toggleAssistant = () => {
    if (!isPremium) {
      router.push(`/${lang}/subscribe`)
      return
    }
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
    const cleanBefore = before.replace(/(^\.\.\.|\.\.\.$)/g, '').trim();
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
    <div className={`${theme === 'dark' ? 'dark' : ''} antialiased`}>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-[#0A0D12] text-gray-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
        
        <div className="flex flex-col flex-1 h-screen overflow-hidden">
          {/* Topbar: Fixed at Top */}
        <Topbar 
          bookTitle={book.title} 
          isSynced={isSynced} 
          isRibbonOpen={isRibbonOpen}
          onToggleRibbon={() => setIsRibbonOpen(!isRibbonOpen)}
          lang={lang as Locale}
          theme={theme}
          onToggleTheme={toggleTheme}
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
        />
      )}

      {/* Workspace: Flex-1 remaining space */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar 
          documents={documents}
          activeDocumentId={activeDocumentId}
          setActiveDocumentId={setActiveDocumentId}
          wordCount={wordCount}
          readingTime={readingTime}
          isOpen={isLeftSidebarOpen}
          setIsOpen={setIsLeftSidebarOpen}
          lang={lang as Locale}
        />

        {/* Main Editor Area */}
        <main className="flex-1 h-full bg-gray-50 dark:bg-[#0A0D12] px-12 py-8 overflow-y-auto flex justify-center relative transition-colors duration-200">
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
    </div>
    </div>
  )
}

