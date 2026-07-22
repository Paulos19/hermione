"use client"

import { useState, useTransition, useEffect, useMemo, useRef } from "react"
import { toast } from "sonner"
import { 
  createCharacterAction, 
  updateCharacterAction, 
  deleteCharacterAction 
} from "@/app/actions/character"
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  Search,
  BookOpen,
  X
} from "lucide-react"
import { DashboardSidebar } from "@/app/components/Dashboard/DashboardSidebar"
import { DashboardTopbar } from "@/app/components/Dashboard/DashboardTopbar"
import { dict } from "@/lib/dictionaries"
import { Locale } from "@/lib/i18n-config"

interface Character {
  id: string
  bookId: string
  bookTitle: string
  name: string
  role: string | null
  description: string | null
  updatedAt: Date
}

interface BookSimple {
  id: string
  title: string
}

interface CharactersProps {
  characters: Character[]
  books: BookSimple[]
  userName: string
  userImage?: string | null
  wordsToday: number
  lang: string
  isPremium: boolean
  selectedPlan: string
  projectsCount: number
  aiCallsCount: number
}

export default function CharactersClient({ 
  characters: initialCharacters, 
  books, 
  userName, 
  userImage, 
  wordsToday, 
  lang, 
  isPremium,
  selectedPlan,
  projectsCount,
  aiCallsCount 
}: CharactersProps) {
  const t = dict[lang as Locale].dashboard
  const [characters, setCharacters] = useState<Character[]>(initialCharacters)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBookId, setFilterBookId] = useState<string>("all")
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    description: "",
    bookId: books.length > 0 ? books[0].id : ""
  })

  const [isPending, startTransition] = useTransition()
  

  const openModalNew = () => {
    setEditingId(null)
    setFormData({
      name: "",
      role: "",
      description: "",
      bookId: filterBookId !== "all" ? filterBookId : (books.length > 0 ? books[0].id : "")
    })
    setIsModalOpen(true)
  }

  const openModalEdit = (char: Character) => {
    setEditingId(char.id)
    setFormData({
      name: char.name,
      role: char.role || "",
      description: char.description || "",
      bookId: char.bookId
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.bookId) {
      toast.error("Nome e Livro são obrigatórios")
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateCharacterAction(editingId, formData)
          // Optimistic update
          setCharacters(prev => prev.map(c => c.id === editingId ? { ...c, ...formData, bookTitle: books.find(b => b.id === formData.bookId)?.title || c.bookTitle } : c))
          toast.success("Personagem atualizado!")
        } else {
          const newChar = await createCharacterAction(formData)
          // Refresh or optimistic
          setCharacters([{...newChar, bookTitle: books.find(b => b.id === newChar.bookId)?.title || "Livro"} as Character, ...characters])
          toast.success("Personagem criado!")
        }
        setIsModalOpen(false)
      } catch (err: any) {
        toast.error(err.message || "Falha ao salvar")
      }
    })
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm("Tem certeza que deseja excluir este personagem?")) {
      startTransition(async () => {
        try {
          await deleteCharacterAction(id)
          setCharacters(characters.filter(c => c.id !== id))
          toast.success("Personagem excluído!")
        } catch (err: any) {
          toast.error(err.message || "Falha ao excluir")
        }
      })
    }
  }

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const filteredCharacters = useMemo(() => {
    let result = characters.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    if (filterBookId !== 'all') {
      result = result.filter(c => c.bookId === filterBookId)
    }
    return result
  }, [characters, searchQuery, filterBookId])

  return (
    <div className="antialiased">
      <div className="flex h-screen w-full font-sans bg-[var(--theme-bg-main)] text-[var(--theme-text-main)] overflow-hidden transition-colors duration-200">

        <DashboardSidebar
          wordsToday={wordsToday}
          lang={lang}
          isPremium={isPremium}
          selectedPlan={selectedPlan}
          projectsCount={projectsCount}
          aiCallsCount={aiCallsCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col h-screen min-w-0">

          <DashboardTopbar
            
            lang={lang}
            userImage={userImage}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          />

          <main className="flex-1 overflow-y-auto relative">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 py-6 md:py-10 space-y-6 md:space-y-10 pb-32">

              {/* HERO SECTION */}
              <section className="relative overflow-hidden rounded-[24px] bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] shadow-sm">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between p-8 md:p-10 gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <h1 className="text-[32px] md:text-[40px] font-serif text-[var(--theme-text-main)] font-semibold leading-tight tracking-tight">
                        Personagens
                      </h1>
                    </div>
                    <p className="text-[16px] text-[var(--theme-text-muted)] max-w-lg">
                      Gerencie as fichas do seu elenco. Hermione utilizará estes dados para não esquecer detalhes cruciais na hora de escrever.
                    </p>
                  </div>

                  <button
                    onClick={openModalNew}
                    disabled={books.length === 0}
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-900/20 shrink-0 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                    Novo Personagem
                  </button>
                </div>
              </section>

              {/* CONTROLS (SEARCH & FILTER) */}
              <section className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar personagem..."
                    className="w-full bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-[var(--theme-text-main)] placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors shadow-sm"
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select 
                    value={filterBookId}
                    onChange={(e) => setFilterBookId(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-xl text-[14px] font-medium text-[var(--theme-text-main)] focus:outline-none focus:border-emerald-500 shadow-sm"
                  >
                    <option value="all">Todos os Livros</option>
                    {books.map(b => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>
              </section>

              {/* GRID */}
              <section>
                {filteredCharacters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredCharacters.map(char => (
                      <div 
                        key={char.id} 
                        onClick={() => openModalEdit(char)}
                        className="group bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] hover:border-emerald-500/30 dark:hover:border-emerald-400/30 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3">
                              <BookOpen className="w-3 h-3" /> {char.bookTitle}
                            </span>
                            <h3 className="text-[22px] font-serif font-semibold text-[var(--theme-text-main)] leading-tight">
                              {char.name}
                            </h3>
                            {char.role && (
                              <p className="text-[13px] text-[var(--theme-text-muted)] font-medium mt-1">
                                {char.role}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleDelete(char.id, e)}
                              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 bg-[var(--theme-bg-surface)] border border-gray-100 dark:border-white/5 rounded-xl p-4">
                          <p className="text-[13px] text-[var(--theme-text-muted)] line-clamp-4 leading-relaxed">
                            {char.description || "Nenhuma descrição fornecida para este personagem."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 border border-[var(--theme-border-subtle)] border-dashed rounded-[24px] bg-[var(--theme-bg-surface-elevated)]/50 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-[var(--theme-bg-surface)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--theme-border-subtle)]">
                      <Users className="w-8 h-8 text-[var(--theme-text-muted)]" />
                    </div>
                    <h3 className="text-[20px] font-medium text-[var(--theme-text-main)] mb-2">Nenhum personagem aqui</h3>
                    <p className="text-[14px] text-[var(--theme-text-muted)] mb-6 max-w-sm">
                      {books.length === 0 
                        ? "Você precisa criar um livro primeiro antes de adicionar personagens." 
                        : "Construa seu elenco. Suas fichas ajudarão a IA a entender sua história."}
                    </p>
                    {books.length > 0 && !searchQuery && (
                      <button
                        onClick={openModalNew}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
                      >
                        Adicionar Personagem
                      </button>
                    )}
                  </div>
                )}
              </section>

            </div>

            {/* MODAL */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div 
                  className="bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-6 py-4 border-b border-[var(--theme-border-subtle)] flex items-center justify-between">
                    <h3 className="text-[18px] font-semibold text-[var(--theme-text-main)]">
                      {editingId ? "Editar Personagem" : "Novo Personagem"}
                    </h3>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-gray-700 dark:text-[#8A94A0]">
                          Nome do Personagem <span className="text-red-500">*</span>
                        </label>
                        <input
                          autoFocus
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="Ex: Harry Potter"
                          className="w-full bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-xl px-4 py-2.5 text-[14px] text-[var(--theme-text-main)] focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-medium text-gray-700 dark:text-[#8A94A0]">
                          Livro Relacionado <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.bookId}
                          onChange={e => setFormData({...formData, bookId: e.target.value})}
                          className="w-full bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-xl px-4 py-2.5 text-[14px] text-[var(--theme-text-main)] focus:outline-none focus:border-emerald-500"
                        >
                          {books.map(b => (
                            <option key={b.id} value={b.id}>{b.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-medium text-gray-700 dark:text-[#8A94A0]">
                        Papel na História (Opcional)
                      </label>
                      <input
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                        placeholder="Ex: Protagonista, Mentor, Vilão principal..."
                        className="w-full bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-xl px-4 py-2.5 text-[14px] text-[var(--theme-text-main)] focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 h-full">
                      <label className="text-[13px] font-medium text-gray-700 dark:text-[#8A94A0]">
                        Ficha & Descrição <span className="text-gray-400 font-normal">(Para o modelo IA ler)</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Descreva personalidade, aparência, arcos narrativos e segredos..."
                        className="w-full flex-1 min-h-[160px] bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-xl px-4 py-3 text-[14px] text-[var(--theme-text-main)] focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3 mt-auto">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-5 py-2.5 rounded-xl text-[14px] font-medium text-[var(--theme-text-muted)] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[14px] font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                      >
                        {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {editingId ? "Salvar Alterações" : "Criar Personagem"}
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            )}
            
          </main>
        </div>
      </div>
    </div>
  )
}
