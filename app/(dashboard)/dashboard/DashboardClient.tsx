"use client"

import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { criarLivroAction, deletarLivroAction } from "@/app/actions/book"
import { salvarMasterPinAction } from "@/app/actions/user"
import { MessageSquare, Settings, BookOpen, Plus, Trash2, Lock } from "lucide-react"

interface Book {
  id: string
  title: string
  category: string | null
  createdAt: Date
  documentCount: number
}

export default function DashboardClient({ initialBooks, userName, hasMasterPin }: { initialBooks: Book[], userName: string, hasMasterPin: boolean }) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [isPending, startTransition] = useTransition()
  const [showPinModal, setShowPinModal] = useState(false)
  const [masterPin, setMasterPin] = useState("")

  useEffect(() => {
    // Só mostrar o modal se o utilizador NÃO tiver PIN salvo no banco de dados
    if (!hasMasterPin) {
      setShowPinModal(true)
    }
  }, [hasMasterPin])

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (masterPin.length === 4) {
      // Salvar no banco de dados (vinculado ao email)
      const result = await salvarMasterPinAction(masterPin)
      if (result.success) {
        // Também salvar no localStorage como cache
        localStorage.setItem("master_pin", masterPin)
        setShowPinModal(false)
      }
    }
  }

  const handleCriarLivro = () => {
    startTransition(async () => {
      try {
        const id = await criarLivroAction()
        window.location.href = `/editor/${id}`
      } catch (e) {
        console.error(e)
      }
    })
  }

  const handleDeletar = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm("Tem certeza que deseja deletar este livro?")) {
      startTransition(async () => {
        try {
          await deletarLivroAction(id)
          setBooks(books.filter(b => b.id !== id))
        } catch (e) {
          console.error(e)
        }
      })
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto w-full pb-20">
      {/* Header de Boas Vindas */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
          Olá, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{userName}</span>
        </h1>
        <p className="text-zinc-400 text-lg">O que vamos criar hoje?</p>
      </div>

      {/* Acesso Rápido (Hub) */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
          Acesso Rápido
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/chat">
            <div className="group bg-gradient-to-br from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl p-6 transition-all duration-300 flex items-center gap-6 cursor-pointer">
              <div className="bg-indigo-500/20 p-4 rounded-xl text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-100 mb-1">Chat com Hermione</h3>
                <p className="text-sm text-zinc-400">Ideias, pesquisas e assistência inteligente.</p>
              </div>
            </div>
          </Link>

          <Link href="/configuracoes">
            <div className="group bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-all duration-300 flex items-center gap-6 cursor-pointer">
              <div className="bg-zinc-800 p-4 rounded-xl text-zinc-400 group-hover:scale-110 group-hover:bg-zinc-700 group-hover:text-white transition-all duration-300">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-100 mb-1">Configurações</h3>
                <p className="text-sm text-zinc-400">Ajuste seu perfil e preferências.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Meus Livros */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Meus Livros
          </h2>
          
          <button
            onClick={handleCriarLivro}
            disabled={isPending}
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Novo Livro
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => (
            <Link href={`/editor/${book.id}`} key={book.id}>
              <div className="group bg-zinc-900/40 border border-zinc-800/80 hover:border-indigo-500/50 hover:bg-zinc-900/80 rounded-2xl p-6 transition-all duration-300 cursor-pointer relative overflow-hidden h-48 flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-zinc-100 mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">{book.title}</h3>
                  <span className="inline-block px-3 py-1 bg-zinc-800 text-xs font-medium text-zinc-400 rounded-full">
                    {book.category || 'Sem categoria'}
                  </span>
                </div>
                
                <div className="relative z-10 flex items-center justify-between text-zinc-500 text-sm">
                  <span>{book.documentCount} Capítulos</span>
                  
                  <button
                    onClick={(e) => handleDeletar(book.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}

          {books.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
              <BookOpen className="w-12 h-12 text-zinc-700 mb-4" />
              <h3 className="text-lg font-bold text-zinc-300 mb-2">Nenhum livro criado</h3>
              <p className="text-zinc-500 mb-6 text-sm">Inicie um novo projeto para começar a escrever.</p>
              <button
                onClick={handleCriarLivro}
                disabled={isPending}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                Criar Primeiro Livro
              </button>
            </div>
          )}
        </div>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full transform animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Lock className="w-6 h-6" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center text-white mb-2">PIN Mestre de Segurança</h2>
            <p className="text-sm text-zinc-400 text-center mb-6 leading-relaxed">
              Para desbloquear seus livros na versão Web, insira o seu PIN Mestre. 
              <strong> Utilize o mesmo de 4 dígitos configurado no seu celular.</strong>
            </p>
            <form onSubmit={handleSavePin}>
              <input
                type="password"
                value={masterPin}
                onChange={(e) => setMasterPin(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={4}
                placeholder="••••"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-2xl tracking-[0.7em] text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-6 font-mono"
                autoFocus
              />
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={masterPin.length !== 4}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl disabled:opacity-50 transition-colors"
                >
                  Salvar PIN neste Navegador
                </button>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="w-full py-3 bg-transparent hover:bg-zinc-800 text-zinc-400 font-medium rounded-xl transition-colors"
                >
                  Pular por enquanto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
