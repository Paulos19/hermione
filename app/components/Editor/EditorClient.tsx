"use client"

import { useState } from "react"
import Link from "next/link"
import TiptapYjsEditor from "./TiptapYjsEditor"

interface EditorClientProps {
  book: any
  documents: any[]
  currentUser: any
  wsToken: string
}

export default function EditorClient({ book, documents, currentUser, wsToken }: EditorClientProps) {
  const [activeDocumentId, setActiveDocumentId] = useState<string>(
    documents.length > 0 ? documents[0].id : ""
  )

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Sidebar - Navegação de Capítulos */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/30 backdrop-blur-xl flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Voltar
          </Link>
        </div>
        
        <div className="p-4 border-b border-zinc-800">
          <h2 className="font-bold text-zinc-100 truncate">{book.title}</h2>
          <p className="text-xs text-zinc-500 mt-1">{documents.length} Capítulos</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setActiveDocumentId(doc.id)}
              className={`p-3 rounded-xl cursor-pointer text-sm font-medium transition-all ${
                activeDocumentId === doc.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              {doc.title}
            </div>
          ))}
        </div>
      </aside>

      {/* Área Principal do Editor */}
      <main className="flex-1 h-full bg-[#0B0F12] relative flex flex-col">
        {/* Header do Documento */}
        <header className="h-14 border-b border-zinc-800/50 flex items-center px-6 justify-between shrink-0 bg-[#0B0F12]/80 backdrop-blur-md z-10">
          <h1 className="text-zinc-300 font-medium">
            {documents.find(d => d.id === activeDocumentId)?.title || "Selecione um capítulo"}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Yjs Sync Ativo
            </div>
          </div>
        </header>

        {/* Tiptap + Yjs Editor Workspace */}
        <div className="flex-1 overflow-y-auto w-full relative">
          {activeDocumentId ? (
            <TiptapYjsEditor 
              documentId={activeDocumentId} 
              currentUser={currentUser} 
              wsToken={wsToken} 
            />
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500">
              Crie ou selecione um capítulo no menu lateral.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
