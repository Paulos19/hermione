"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import TiptapYjsEditor from "./TiptapYjsEditor"
import { decryptData, isEncrypted as isEncryptedText } from "@/lib/encryption"

interface EditorClientProps {
  book: any
  documents: any[]
  currentUser: any
  wsToken: string
  pin?: string | null
  isEncrypted?: boolean
}

export default function EditorClient({ book, documents, currentUser, wsToken, pin, isEncrypted }: EditorClientProps) {
  const [activeDocumentId, setActiveDocumentId] = useState<string>(
    documents.length > 0 ? documents[0].id : ""
  )
  const [unlocked, setUnlocked] = useState(!isEncrypted)
  const [inputPin, setInputPin] = useState("")
  const [pinError, setPinError] = useState(false)

  const decryptedDocuments = useMemo(() => {
    if (!unlocked || !inputPin) return documents
    return documents.map(doc => {
      let content = doc.content || ""
      if (isEncryptedText(content)) {
        const decrypted = decryptData(content, inputPin)
        if (decrypted !== "ERRO_DESCRIPTOGRAFIA" && decrypted !== null && decrypted !== undefined) {
          content = decrypted
        }
      }
      let title = doc.title || ""
      if (isEncryptedText(title)) {
        const decrypted = decryptData(title, inputPin)
        if (decrypted !== "ERRO_DESCRIPTOGRAFIA" && decrypted !== null && decrypted !== undefined) {
          title = decrypted
        }
      }
      return { ...doc, content, title }
    })
  }, [documents, unlocked, inputPin])

  const handleUnlock = () => {
    if (pin && inputPin === pin) {
      setUnlocked(true)
    } else {
      // Tentar descriptografar o primeiro documento criptografado para testar
      const testDoc = documents.find(d => isEncryptedText(d.content) || isEncryptedText(d.title))
      if (testDoc) {
        const textToDecrypt = isEncryptedText(testDoc.content) ? testDoc.content : testDoc.title
        const decrypted = decryptData(textToDecrypt, inputPin)
        if (decrypted !== "ERRO_DESCRIPTOGRAFIA") {
          setUnlocked(true)
          return
        }
      } else if (!pin) {
        // Se não há pin salvo nem documento criptografado, apenas liberar
        setUnlocked(true)
        return
      }
      setPinError(true)
    }
  }

  useEffect(() => {
    if (!unlocked && isEncrypted) {
      // 1. Tentar com o PIN do servidor (user.masterPin ou book.pin)
      if (pin) {
        const testDoc = documents.find(d => isEncryptedText(d.content) || isEncryptedText(d.title))
        if (testDoc) {
          const textToDecrypt = isEncryptedText(testDoc.content) ? testDoc.content : testDoc.title
          const decrypted = decryptData(textToDecrypt, pin)
          if (decrypted !== "ERRO_DESCRIPTOGRAFIA") {
            setInputPin(pin)
            setUnlocked(true)
            return
          }
        } else {
          // Livro marcado como encriptado mas sem docs encriptados
          setInputPin(pin)
          setUnlocked(true)
          return
        }
      }

      // 2. Fallback: tentar com o PIN do localStorage
      const savedPin = localStorage.getItem("master_pin")
      if (savedPin) {
        const testDoc = documents.find(d => isEncryptedText(d.content) || isEncryptedText(d.title))
        if (testDoc) {
          const textToDecrypt = isEncryptedText(testDoc.content) ? testDoc.content : testDoc.title
          const decrypted = decryptData(textToDecrypt, savedPin)
          if (decrypted !== "ERRO_DESCRIPTOGRAFIA") {
            setInputPin(savedPin)
            setUnlocked(true)
            return
          }
        }
      }
    }
  }, [unlocked, documents, pin, isEncrypted])

  if (!unlocked) {
    return (
      <div className="flex h-screen w-full bg-zinc-950 items-center justify-center p-4">
        <div className="bg-zinc-900/80 p-8 rounded-3xl border border-zinc-800/80 max-w-sm w-full text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Livro Protegido</h2>
          <p className="text-zinc-400 mb-8 text-sm">Digite o seu PIN Mestre para acessar o conteúdo deste livro.</p>
          
          <input 
            type="password"
            maxLength={4}
            value={inputPin}
            onChange={(e) => { setInputPin(e.target.value.replace(/[^0-9]/g, '')); setPinError(false); }}
            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 text-center text-3xl tracking-[1em] text-white mb-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-zinc-700 placeholder:tracking-normal"
            placeholder="••••"
            autoFocus
          />
          
          {pinError && <p className="text-red-400 text-sm mb-4 font-medium animate-pulse">PIN incorreto. Tente novamente.</p>}
          
          <button 
            onClick={handleUnlock}
            disabled={inputPin.length < 4}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-lg shadow-indigo-600/20"
          >
            Desbloquear
          </button>

          <Link href="/dashboard" className="block mt-6 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Voltar para o Dashboard
          </Link>
        </div>
      </div>
    )
  }

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
          <p className="text-xs text-zinc-500 mt-1">{decryptedDocuments.length} Capítulos</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {decryptedDocuments.map((doc) => (
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
            {decryptedDocuments.find(d => d.id === activeDocumentId)?.title || "Selecione um capítulo"}
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
          {activeDocumentId ? (() => {
            const activeDocument = decryptedDocuments.find(d => d.id === activeDocumentId)
            let initialContent = activeDocument?.content || ''
            return (
              <TiptapYjsEditor 
                documentId={activeDocumentId} 
                bookId={book.id}
                currentUser={currentUser} 
                wsToken={wsToken} 
                initialContent={initialContent}
              />
            )
          })() : (
            <div className="h-full flex items-center justify-center text-zinc-500">
              Crie ou selecione um capítulo no menu lateral.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
