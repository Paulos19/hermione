"use client"

import { useState, useTransition, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { criarLivroAction, deletarLivroAction } from "@/app/actions/book"
import {
  BookOpen,
  Plus,
  Trash2,
  Clock,
  Search,
  Filter,
  SortDesc,
  Tag
} from "lucide-react"
import { DashboardSidebar } from "@/app/components/Dashboard/DashboardSidebar"
import { DashboardTopbar } from "@/app/components/Dashboard/DashboardTopbar"
import { dict } from "@/lib/dictionaries"
import { Locale } from "@/lib/i18n-config"
import { useRouter } from "next/navigation"

interface Book {
  id: string
  title: string
  category: string | null
  coverImage?: string | null
  updatedAt: Date
  documentCount: number
  wordCount: number
}

interface ProjectsProps {
  books: Book[]
  userName: string
  userImage?: string | null
  wordsToday: number
  lang: string
  isPremium: boolean
  selectedPlan: string
  projectsCount: number
  aiCallsCount: number
}

function formatDate(date: Date, locale: string) {
  const loc = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US'
  return new Intl.DateTimeFormat(loc, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

export default function ProjectsClient({ books: initialBooks, userName, userImage, wordsToday, lang, isPremium,
  selectedPlan,
  projectsCount,
  aiCallsCount }: ProjectsProps) {
  const t = dict[lang as Locale].dashboard
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterSort, setFilterSort] = useState<'recent'|'oldest'|'words_desc'|'words_asc'|'alpha'>('recent')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const filterRef = useRef<HTMLDivElement>(null)

  const [isPending, startTransition] = useTransition()
  
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCriarLivro = () => {
    startTransition(async () => {
      try {
        const id = await criarLivroAction()
        toast.success(t.projectCreated || "Projeto criado!")
        window.location.href = `/${lang}/editor/${id}`
      } catch (e: any) {
        toast.error(e.message || t.failedCreate || "Falha ao criar")
      }
    })
  }

  const handleDeletar = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm(t.confirmDelete || "Tem certeza que deseja excluir?")) {
      startTransition(async () => {
        try {
          await deletarLivroAction(id)
          setBooks(books.filter(b => b.id !== id))
          toast.success(t.projectDeleted || "Projeto excluído!")
        } catch (e: any) {
          toast.error(e.message || t.failedDelete || "Falha ao excluir")
        }
      })
    }
  }

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(books.map(b => b.category || 'NOVEL')))
  }, [books])

  const filteredBooks = useMemo(() => {
    let result = books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (filterCategory !== 'all') {
      result = result.filter(b => (b.category || 'NOVEL') === filterCategory)
    }

    result.sort((a, b) => {
      switch (filterSort) {
        case 'recent': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'oldest': return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case 'words_desc': return b.wordCount - a.wordCount
        case 'words_asc': return a.wordCount - b.wordCount
        case 'alpha': return a.title.localeCompare(b.title)
        default: return 0
      }
    })

    return result
  }, [books, searchQuery, filterSort, filterCategory])

  return (
    <div className="antialiased">
      <div className="flex h-screen w-full font-sans bg-[var(--theme-bg-main)] text-[var(--theme-text-main)] overflow-hidden transition-colors duration-200">

        {/* Responsive Retractable Sidebar */}
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

        {/* Main Column */}
        <div className="flex-1 flex flex-col h-screen min-w-0">

          {/* Fixed Topbar with Mobile Drawer Toggle */}
          <DashboardTopbar
            
            lang={lang}
            userImage={userImage}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          />

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 py-6 md:py-10 space-y-6 md:space-y-10 pb-32">

              {/* HERO SECTION - PROJECTS BANNER */}
              <section className="relative overflow-hidden rounded-[24px] bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] shadow-sm">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-[var(--theme-accent-light)] rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between p-8 md:p-10 gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--theme-accent-light)] flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h1 className="text-[32px] md:text-[40px] font-serif text-[var(--theme-text-main)] font-semibold leading-tight tracking-tight">
                        Meus Projetos
                      </h1>
                    </div>
                    <p className="text-[16px] text-[var(--theme-text-muted)] max-w-lg">
                      Gerencie todos os seus livros, histórias e rascunhos em um só lugar.
                    </p>
                  </div>

                  <button
                    onClick={handleCriarLivro}
                    disabled={isPending}
                    className="px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white dark:bg-[#F5F5F5] dark:hover:bg-white dark:text-[#0A0D12] font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-gray-900/10 dark:shadow-white/10 shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                    Novo Projeto
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
                    placeholder="Buscar projetos..."
                    className="w-full bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-[var(--theme-text-main)] placeholder:text-gray-500 focus:outline-none focus:border-[var(--theme-accent)]/50 transition-colors shadow-sm"
                  />
                </div>
                
                <div className="relative flex items-center gap-2 w-full sm:w-auto" ref={filterRef}>
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--theme-bg-surface-elevated)] border ${isFilterOpen ? 'border-violet-500 dark:border-[#B899FF]' : 'border-[var(--theme-border-subtle)]'} rounded-xl text-[14px] font-medium text-[var(--theme-text-main)] hover:bg-gray-50 dark:hover:bg-[#181F28] transition-colors shadow-sm`}
                  >
                    <Filter className="w-4 h-4" />
                    Filtrar
                  </button>

                  {/* Filter Dropdown */}
                  {isFilterOpen && (
                    <div className="absolute top-full mt-2 right-0 w-64 bg-[var(--theme-bg-surface)] border border-[var(--theme-border)] rounded-xl shadow-xl shadow-black/10 py-3 z-50">
                      
                      <div className="px-4 pb-2 mb-2 border-b border-gray-100 dark:border-white/5">
                        <p className="text-[12px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider flex items-center gap-2 mb-2">
                          <SortDesc className="w-3.5 h-3.5" /> Ordenar Por
                        </p>
                        <select 
                          value={filterSort}
                          onChange={(e) => setFilterSort(e.target.value as any)}
                          className="w-full bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-lg px-3 py-2 text-[13px] text-[var(--theme-text-main)] focus:outline-none focus:border-violet-500"
                        >
                          <option value="recent">Mais recentes</option>
                          <option value="oldest">Mais antigos</option>
                          <option value="alpha">A-Z</option>
                          <option value="words_desc">Mais palavras</option>
                          <option value="words_asc">Menos palavras</option>
                        </select>
                      </div>

                      <div className="px-4 pt-1">
                        <p className="text-[12px] font-semibold text-[var(--theme-text-muted)] uppercase tracking-wider flex items-center gap-2 mb-2">
                          <Tag className="w-3.5 h-3.5" /> Categoria
                        </p>
                        <select 
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="w-full bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-lg px-3 py-2 text-[13px] text-[var(--theme-text-main)] focus:outline-none focus:border-violet-500"
                        >
                          <option value="all">Todas as Categorias</option>
                          {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* GRID */}
              <section>
                {filteredBooks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
                    {filteredBooks.map(book => (
                      <div key={book.id} className="group flex flex-col gap-4">
                        <Link href={`/${lang}/editor/${book.id}`}>
                          <div className="aspect-[3/4] bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-2xl overflow-hidden relative transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:border-violet-500/30">
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#10151B] dark:to-[#0A0D12]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                            
                            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-medium px-2.5 py-1 bg-white/90 dark:bg-black/40 text-gray-900 dark:text-[#8A94A0] rounded-sm uppercase tracking-wider backdrop-blur-md shadow-sm">
                                  {book.category || "NOVEL"}
                                </span>
                              </div>
                              
                              <div>
                                <h3 className="text-2xl font-serif text-white font-semibold leading-snug line-clamp-3 mb-2 drop-shadow-md">
                                  {book.title}
                                </h3>
                                <div className="flex items-center gap-3 text-white/80 text-[12px] font-medium">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    {book.documentCount} cap
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-white/50" />
                                  <span>{book.wordCount.toLocaleString()} pal.</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>

                        <div className="flex items-start justify-between px-1">
                          <div>
                            <p className="text-[14px] text-[var(--theme-text-main)] font-medium line-clamp-1 mb-0.5">{book.title}</p>
                            <p className="text-[12px] text-[var(--theme-text-muted)] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Atualizado em {formatDate(book.updatedAt, lang)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeletar(book.id, e)}
                            className="p-2 text-[var(--theme-text-muted)] hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                            title="Excluir projeto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-32 border border-[var(--theme-border-subtle)] border-dashed rounded-[24px] bg-[var(--theme-bg-surface-elevated)]/50 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-20 h-20 bg-[var(--theme-bg-surface)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--theme-border-subtle)] shadow-inner">
                      <BookOpen className="w-10 h-10 text-[var(--theme-text-muted)]" />
                    </div>
                    <h3 className="text-[22px] font-medium text-[var(--theme-text-main)] mb-3">Nenhum projeto encontrado</h3>
                    <p className="text-[16px] text-[var(--theme-text-muted)] mb-8 max-w-md">
                      {searchQuery 
                        ? "Não encontramos nenhum livro com esse título ou filtro. Tente mudar os parâmetros." 
                        : "Você ainda não tem nenhum livro criado. Comece sua jornada literária agora mesmo!"}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={handleCriarLivro}
                        className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-[#0A0D12] font-medium rounded-xl transition-colors shadow-md"
                      >
                        Criar meu primeiro livro
                      </button>
                    )}
                  </div>
                )}
              </section>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

