"use client"

import { useState, useTransition, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { 
  createNoteAction, 
  updateNoteAction, 
  deleteNoteAction 
} from "@/app/actions/note"
import {
  PenTool,
  Plus,
  Trash2,
  Search,
  BookOpen,
  X,
  FileText
} from "lucide-react"
import { DashboardSidebar } from "@/app/components/Dashboard/DashboardSidebar"
import { DashboardTopbar } from "@/app/components/Dashboard/DashboardTopbar"
import { dict } from "@/lib/dictionaries"
import { Locale } from "@/lib/i18n-config"

interface BookNote {
  id: string
  bookId: string
  bookTitle: string
  title: string
  content: string | null
  updatedAt: Date
}

interface BookSimple {
  id: string
  title: string
}

interface NotesProps {
  notes: BookNote[]
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

export default function NotesClient({ 
  notes: initialNotes, 
  books, 
  userName, 
  userImage, 
  wordsToday, 
  lang, 
  isPremium,
  selectedPlan,
  projectsCount,
  aiCallsCount 
}: NotesProps) {
  const t = dict[lang as Locale].dashboard
  const [notes, setNotes] = useState<BookNote[]>(initialNotes)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBookId, setFilterBookId] = useState<string>("all")
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    bookId: books.length > 0 ? books[0].id : ""
  })

  const [isPending, startTransition] = useTransition()
  

  const openModalNew = () => {
    setEditingId(null)
    setFormData({
      title: "",
      content: "",
      bookId: filterBookId !== "all" ? filterBookId : (books.length > 0 ? books[0].id : "")
    })
    setIsModalOpen(true)
  }

  const openModalEdit = (note: BookNote) => {
    setEditingId(note.id)
    setFormData({
      title: note.title,
      content: note.content || "",
      bookId: note.bookId
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.bookId) {
      toast.error("Título e Livro são obrigatórios")
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateNoteAction(editingId, formData)
          setNotes(prev => prev.map(n => n.id === editingId ? { ...n, ...formData, bookTitle: books.find(b => b.id === formData.bookId)?.title || n.bookTitle } : n))
          toast.success("Anotação atualizada!")
        } else {
          const newNote = await createNoteAction(formData)
          setNotes([{...newNote, bookTitle: books.find(b => b.id === newNote.bookId)?.title || "Livro"} as BookNote, ...notes])
          toast.success("Anotação criada!")
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
    if (confirm("Tem certeza que deseja excluir esta anotação?")) {
      startTransition(async () => {
        try {
          await deleteNoteAction(id)
          setNotes(notes.filter(n => n.id !== id))
          toast.success("Anotação excluída!")
        } catch (err: any) {
          toast.error(err.message || "Falha ao excluir")
        }
      })
    }
  }

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const filteredNotes = useMemo(() => {
    let result = notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase())))
    if (filterBookId !== 'all') {
      result = result.filter(n => n.bookId === filterBookId)
    }
    return result
  }, [notes, searchQuery, filterBookId])

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
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-[var(--theme-accent-light)] rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between p-8 md:p-10 gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--theme-accent-light)] flex items-center justify-center text-[var(--theme-accent)]">
                        <PenTool className="w-5 h-5" />
                      </div>
                      <h1 className="text-[32px] md:text-[40px] font-serif text-[var(--theme-text-main)] font-semibold leading-tight tracking-tight">
                        Anotações
                      </h1>
                    </div>
                    <p className="text-[16px] text-[var(--theme-text-muted)] max-w-lg">
                      Guarde rascunhos, fragmentos de capítulos e ideias rápidas para desenvolvimento futuro.
                    </p>
                  </div>

                  <button
                    onClick={openModalNew}
                    disabled={books.length === 0}
                    className="px-6 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-amber-900/20 shrink-0 disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                    Nova Anotação
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
                    placeholder="Buscar anotações..."
                    className="w-full bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-[var(--theme-text-main)] placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors shadow-sm"
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select 
                    value={filterBookId}
                    onChange={(e) => setFilterBookId(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-xl text-[14px] font-medium text-[var(--theme-text-main)] focus:outline-none focus:border-amber-500 shadow-sm"
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
                {filteredNotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredNotes.map(note => (
                      <div 
                        key={note.id} 
                        onClick={() => openModalEdit(note)}
                        className="group bg-[#FFFEF9] dark:bg-[#10151B] border border-[var(--theme-border-subtle)] hover:border-[var(--theme-accent)]/50 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] cursor-pointer relative overflow-hidden"
                      >
                        {/* Folded corner effect (aesthetic) */}
                        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white dark:from-[#141A22] to-transparent shadow-sm rounded-bl-xl opacity-70 group-hover:w-10 group-hover:h-10 transition-all" />

                        <div className="flex justify-between items-start pr-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-[var(--theme-accent)] rounded-md text-[10px] font-bold uppercase tracking-wider mb-2">
                            <BookOpen className="w-3 h-3" /> {note.bookTitle}
                          </span>
                          
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                              onClick={(e) => handleDelete(note.id, e)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[20px] font-serif font-semibold text-[var(--theme-text-main)] leading-tight mb-2">
                            {note.title}
                          </h3>
                        </div>

                        <div className="flex-1">
                          <p className="text-[14px] text-[var(--theme-text-muted)] line-clamp-5 leading-relaxed font-mono">
                            {note.content || "Vazio..."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 border border-[var(--theme-border-subtle)] border-dashed rounded-[24px] bg-[var(--theme-bg-surface-elevated)]/50 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-[var(--theme-bg-surface)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--theme-border-subtle)]">
                      <PenTool className="w-8 h-8 text-[var(--theme-text-muted)]" />
                    </div>
                    <h3 className="text-[20px] font-medium text-[var(--theme-text-main)] mb-2">Nenhum rascunho salvo</h3>
                    <p className="text-[14px] text-[var(--theme-text-muted)] mb-6 max-w-sm">
                      {books.length === 0 
                        ? "Crie um projeto primeiro para começar a fazer rascunhos." 
                        : "Esta área é para textos em desenvolvimento e ideias temporárias."}
                    </p>
                    {books.length > 0 && !searchQuery && (
                      <button
                        onClick={openModalNew}
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors"
                      >
                        Criar Anotação
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
                    <h3 className="text-[18px] font-semibold text-[var(--theme-text-main)] flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-500" />
                      {editingId ? "Editar Anotação" : "Novo Rascunho"}
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
                          Assunto / Título <span className="text-red-500">*</span>
                        </label>
                        <input
                          autoFocus
                          required
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          placeholder="Ex: Diálogo Capítulo 5, Ideia de Enredo..."
                          className="w-full bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-xl px-4 py-2.5 text-[14px] text-[var(--theme-text-main)] focus:outline-none focus:border-amber-500"
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
                          className="w-full bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-xl px-4 py-2.5 text-[14px] text-[var(--theme-text-main)] focus:outline-none focus:border-amber-500"
                        >
                          {books.map(b => (
                            <option key={b.id} value={b.id}>{b.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 h-full">
                      <label className="text-[13px] font-medium text-gray-700 dark:text-[#8A94A0]">
                        Rascunho
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                        placeholder="Escreva livremente..."
                        className="w-full flex-1 min-h-[220px] bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-xl px-4 py-3 text-[14px] text-[var(--theme-text-main)] focus:outline-none focus:border-amber-500 resize-none leading-relaxed font-mono"
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
                        className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-[14px] font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                      >
                        {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {editingId ? "Salvar Alterações" : "Criar Rascunho"}
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
