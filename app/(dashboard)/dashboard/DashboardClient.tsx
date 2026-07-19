"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { criarLivroAction, deletarLivroAction } from "@/app/actions/book"

interface Book {
  id: string
  title: string
  category: string | null
  createdAt: Date
  documentCount: number
}

export default function DashboardClient({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [isPending, startTransition] = useTransition()

  const handleCriarLivro = () => {
    startTransition(async () => {
      try {
        const id = await criarLivroAction()
        // Opcionalmente, pode redirecionar direto para o editor: window.location.href = `/editor/${id}`
        // Mas por enquanto vamos apenas atualizar a página ou deixar o revalidatePath atuar.
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
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Meus Livros</h1>
          <p className="text-zinc-400">Gerencie seus projetos literários sincronizados.</p>
        </div>
        
        <button
          onClick={handleCriarLivro}
          disabled={isPending}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Livro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map(book => (
          <Link href={`/editor/${book.id}`} key={book.id}>
            <div className="group bg-zinc-900/50 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-200 cursor-pointer relative overflow-hidden h-48 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-zinc-100 mb-2 group-hover:text-indigo-300 transition-colors">{book.title}</h3>
                <span className="inline-block px-3 py-1 bg-zinc-800 text-xs font-medium text-zinc-400 rounded-full">
                  {book.category || 'Sem categoria'}
                </span>
              </div>
              
              <div className="relative z-10 flex items-center justify-between text-zinc-500 text-sm">
                <span>{book.documentCount} Capítulos</span>
                
                <button
                  onClick={(e) => handleDeletar(book.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </Link>
        ))}

        {books.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <svg className="w-16 h-16 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <h3 className="text-xl font-bold text-zinc-300 mb-2">Nenhum livro ainda</h3>
            <p className="text-zinc-500 mb-6">Comece sua nova história criando seu primeiro livro.</p>
            <button
              onClick={handleCriarLivro}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
            >
              Criar Primeiro Livro
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
