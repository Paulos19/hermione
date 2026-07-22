"use client"

import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { criarLivroAction, deletarLivroAction } from "@/app/actions/book"
import {
  BookOpen,
  MessageSquare,
  Users,
  Globe,
  Search,
  Plus,
  Trash2,
  PenTool,
  Clock,
  ChevronRight,
  MoreVertical
} from "lucide-react"
import { DashboardSidebar } from "@/app/components/Dashboard/DashboardSidebar"
import { DashboardTopbar } from "@/app/components/Dashboard/DashboardTopbar"
import { WeatherWidget } from "@/app/components/Dashboard/WeatherWidget"
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
  targetWords: number
}

interface Activity {
  id: string
  title: string
  bookTitle: string
  updatedAt: Date
}

interface DashboardProps {
  books: Book[]
  userName: string
  userImage?: string | null
  wordsToday: number
  recentActivity: Activity[]
  characterCount: number
  worldNoteCount: number
  lang: string
  isPremium: boolean
  selectedPlan: string
  projectsCount: number
  aiCallsCount: number
}

function formatDate(date: Date, locale: string) {
  const loc = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US'
  return new Intl.DateTimeFormat(loc, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

export default function DashboardClient({ books: initialBooks, userName, userImage, wordsToday, recentActivity, characterCount, worldNoteCount, lang, isPremium,
  selectedPlan,
  projectsCount,
  aiCallsCount }: DashboardProps) {
  const t = dict[lang as Locale].dashboard
  const tNav = dict[lang as Locale].nav
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [isPending, startTransition] = useTransition()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [greeting, setGreeting] = useState(t.goodMorning)
  const router = useRouter()

  useEffect(() => {
    // Calcular Saudação baseada no horário de Brasília (GMT-3)
    const updateGreeting = () => {
      const brTime = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      const hour = new Date(brTime).getHours()
      
      if (hour >= 5 && hour < 12) setGreeting("Bom dia")
      else if (hour >= 12 && hour < 18) setGreeting("Boa tarde")
      else setGreeting("Boa noite")
    }
    updateGreeting()
    
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

  useEffect(() => {
    // Solicitar localização ao entrar na plataforma e enviar para as métricas globais
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://services-websckt.khdya3.easypanel.host";
          const ws = new WebSocket(`${WS_URL}/ws/metrics`);
          
          ws.onopen = () => {
            ws.send(JSON.stringify({ type: "location", location: [latitude, longitude] }));
          };

          const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ping" }));
            }
          }, 30000);

          return () => {
            clearInterval(pingInterval);
            ws.close();
          };
        },
        (error) => {
          console.warn("Permissão de localização negada ou erro:", error);
        }
      );
    }
  }, []);

  const handleCriarLivro = () => {
    startTransition(async () => {
      try {
        const id = await criarLivroAction()
        toast.success(t.projectCreated)
        window.location.href = `/${lang}/editor/${id}`
      } catch (e: any) {
        toast.error(e.message || t.failedCreate)
      }
    })
  }

  const handleDeletar = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm(t.confirmDelete)) {
      startTransition(async () => {
        try {
          await deletarLivroAction(id)
          setBooks(books.filter(b => b.id !== id))
          toast.success(t.projectDeleted)
        } catch (e: any) {
          toast.error(e.message || t.failedDelete)
        }
      })
    }
  }

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const recentBook = books[0]

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} antialiased`}>
      <div className="flex h-screen w-full font-sans bg-gray-50 dark:bg-[#0A0D12] text-gray-900 dark:text-[#F5F5F5] overflow-hidden transition-colors duration-200">

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
            theme={theme}
            onToggleTheme={toggleTheme}
            lang={lang}
            userImage={userImage}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          />

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 py-6 md:py-10 space-y-6 md:space-y-10 pb-32">

              {/* HERO SECTION - UNIFIED CARD */}
              <section className="relative overflow-hidden rounded-[24px] bg-white dark:bg-[#10151B] border border-gray-200 dark:border-white/10 shadow-sm">
                {/* Background decorative gradients */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-violet-600/10 dark:bg-[#B899FF]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-48 h-48 bg-blue-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between p-8 md:p-10 gap-8">
                  <div className="flex-1">
                    <p className="text-violet-600 dark:text-[#B899FF] text-[16px] mb-2 font-medium tracking-wide uppercase text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-600 dark:bg-[#B899FF] animate-pulse" />
                      {greeting}
                    </p>
                    <h1 className="text-[40px] md:text-[48px] font-serif text-gray-900 dark:text-white font-semibold leading-tight tracking-tight mb-2">
                      {userName}
                    </h1>
                    <p className="text-[16px] md:text-[18px] text-gray-500 dark:text-[#8A94A0] opacity-90 max-w-lg">
                      {t.continueCreating}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 p-3 bg-gray-50/50 dark:bg-[#141A22]/60 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-inner">
                    
                    {/* Stat 1: Palavras Hoje */}
                    <div className="flex flex-col justify-center p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-gray-200/40 dark:border-white/5">
                      <p className="text-[11px] font-bold text-gray-500 dark:text-[#8A94A0] mb-1 uppercase tracking-wider">{t.wordsToday}</p>
                      <p className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-[#F5F5F5]">{wordsToday}</p>
                    </div>

                    {/* Stat 2: Sequência Atual */}
                    <div className="flex flex-col justify-center p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-gray-200/40 dark:border-white/5">
                      <p className="text-[11px] font-bold text-gray-500 dark:text-[#8A94A0] mb-1 uppercase tracking-wider">{t.currentStreak}</p>
                      <p className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-[#F5F5F5] flex items-baseline gap-1">
                        1 <span className="text-xs font-normal text-gray-500 dark:text-[#8A94A0]">{t.day}</span>
                      </p>
                    </div>

                    {/* Stat 3: Projetos Ativos */}
                    <div className="flex flex-col justify-center p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-gray-200/40 dark:border-white/5">
                      <p className="text-[11px] font-bold text-gray-500 dark:text-[#8A94A0] mb-1 uppercase tracking-wider">{t.projects}</p>
                      <p className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-[#F5F5F5]">{books.length}</p>
                    </div>

                    {/* Stat 4: Clima & Ambiente */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-gray-200/40 dark:border-white/5 min-w-[110px]">
                      <WeatherWidget lang={lang} />
                    </div>

                  </div>
                </div>
              </section>

              <hr className="border-gray-200 dark:border-white/5" />

              {/* CONTINUE WRITING */}
              <section>
                <h2 className="text-[16px] font-medium text-gray-500 dark:text-[#8A94A0] mb-4">{t.continueWriting}</h2>

                {recentBook ? (
                  <Link href={`/${lang}/editor/${recentBook.id}`}>
                    <div className="group relative bg-white dark:bg-[#141A22] border border-gray-200 dark:border-white/5 hover:border-violet-500/50 dark:hover:border-[#B899FF]/50 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-10 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-violet-900/5 overflow-hidden">
                      {/* Decorative Background Element */}
                      <div className="absolute top-0 right-0 -translate-y-10 translate-x-10 w-40 h-40 bg-violet-600/5 dark:bg-[#B899FF]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-600/10 dark:group-hover:bg-[#B899FF]/10 transition-colors duration-500" />
                      
                      <div className="w-full sm:w-[140px] h-[200px] bg-gray-100 dark:bg-[#0E1318] rounded-2xl flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-white/5 overflow-hidden relative shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                        {recentBook.coverImage ? (
                          <img src={recentBook.coverImage} alt={recentBook.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#10151B] dark:to-[#0A0D12] flex flex-col items-center justify-center relative">
                            <BookOpen className="w-10 h-10 text-gray-400 dark:text-[#8A94A0] opacity-40 mb-2" />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-2 z-10">
                        <div>
                          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                            <span className="text-[11px] font-bold px-3 py-1.5 bg-gray-100 dark:bg-[#10151B] text-gray-600 dark:text-[#8A94A0] rounded-lg uppercase tracking-wider border border-gray-200 dark:border-white/5 shadow-sm">
                              {recentBook.category || "Novel"}
                            </span>
                            <span className="text-[12px] text-gray-500 dark:text-[#8A94A0] flex items-center gap-1.5 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              {t.edited} {formatDate(recentBook.updatedAt, lang)}
                            </span>
                          </div>
                          
                          <h3 className="text-[32px] sm:text-[36px] font-serif font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-[#B899FF] transition-colors leading-tight">
                            {recentBook.title}
                          </h3>
                          
                          <p className="text-[15px] text-gray-500 dark:text-[#8A94A0] flex items-center gap-2">
                            <span className="font-medium text-gray-700 dark:text-[#A0AAB5]">{recentBook.documentCount}</span> {t.chapters} 
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20" />
                            <span className="font-medium text-gray-700 dark:text-[#A0AAB5]">{recentBook.wordCount.toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US')}</span> {t.words}
                          </p>
                        </div>

                        <div className="mt-8 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">Progresso do Projeto</span>
                            <span className="font-bold text-violet-600 dark:text-[#B899FF]">
                              {recentBook.targetWords > 0 ? Math.min(100, Math.round((recentBook.wordCount / recentBook.targetWords) * 100)) : 0}% {t.ofGoal}
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 dark:bg-[#10151B] rounded-full overflow-hidden border border-gray-200/50 dark:border-white/5 shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-violet-500 to-violet-600 dark:from-[#9D7BFF] dark:to-[#B899FF] rounded-full transition-all duration-700 ease-out relative overflow-hidden" 
                              style={{ width: `${recentBook.targetWords > 0 ? Math.min(100, Math.round((recentBook.wordCount / recentBook.targetWords) * 100)) : 0}%` }}
                            >
                              <div className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-[#5F6A7A] mt-1 text-right uppercase font-semibold tracking-wider">
                            Meta: {recentBook.targetWords.toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US')} palavras
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-white dark:bg-[#141A22] border border-gray-200 dark:border-white/5 rounded-[18px] p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white dark:bg-[#10151B] rounded-2xl flex items-center justify-center mb-6 border border-gray-200 dark:border-white/5">
                      <PenTool className="w-8 h-8 text-gray-500 dark:text-[#8A94A0]" />
                    </div>
                    <h3 className="text-[22px] font-semibold text-gray-900 dark:text-white mb-2">{t.startJourney}</h3>
                    <p className="text-[16px] text-gray-500 dark:text-[#8A94A0] mb-8 max-w-md">
                      {t.startJourneyDesc}
                    </p>
                    <button
                      onClick={handleCriarLivro}
                      disabled={isPending}
                      className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white dark:bg-[#F5F5F5] dark:hover:bg-white dark:text-[#0A0D12] font-semibold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                      {t.createFirstProject}
                    </button>
                  </div>
                )}
              </section>

              {/* QUICK ACTIONS & RECENT ACTIVITY GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

                {/* Left Column: Quick Actions */}
                <section className="xl:col-span-2">
                  <h2 className="text-[16px] font-medium text-gray-500 dark:text-[#8A94A0] mb-4">{t.quickActions}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { title: t.newProject, desc: t.newProjectDesc, icon: Plus, action: handleCriarLivro, color: "text-violet-600 dark:text-[#B899FF]" },
                      {
                        title: t.chatHermione,
                        desc: t.chatHermioneDesc,
                        icon: MessageSquare,
                        action: () => {
                          if (isPremium) {
                            router.push(`/${lang}/chat`)
                          } else {
                            router.push(`/${lang}/subscribe`)
                          }
                        },
                        color: "text-gray-900 dark:text-[#F5F5F5]"
                      },
                      { title: t.characters, desc: `${characterCount} criado${characterCount === 1 ? '' : 's'}`, icon: Users, action: () => router.push(`/${lang}/dashboard/characters`), color: "text-gray-900 dark:text-[#F5F5F5]" },
                      { title: t.worldBuilder, desc: `${worldNoteCount} anotaç${worldNoteCount === 1 ? 'ão' : 'ões'}`, icon: Globe, action: () => router.push(`/${lang}/dashboard/world`), color: "text-gray-900 dark:text-[#F5F5F5]" },
                    ].map((action, i) => (
                      <button
                        key={i}
                        onClick={action.action}
                        className="group flex items-center gap-4 bg-white dark:bg-[#141A22] hover:bg-gray-100 dark:hover:bg-[#181F28] border border-gray-200 dark:border-white/5 rounded-2xl p-5 text-left transition-all hover:-translate-y-0.5 hover:border-gray-200 dark:border-white/10"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#10151B] flex items-center justify-center border border-gray-200 dark:border-white/5 group-hover:scale-105 transition-transform">
                          <action.icon className={`w-5 h-5 ${action.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[16px] font-medium text-gray-900 dark:text-[#F5F5F5] mb-0.5">{action.title}</h4>
                          <p className="text-[14px] text-gray-500 dark:text-[#8A94A0]">{action.desc}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 dark:text-[#8A94A0] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </section>

                {/* Right Column: Recent Activity */}
                <section className="xl:col-span-1">
                  <h2 className="text-[16px] font-medium text-gray-500 dark:text-[#8A94A0] mb-4">{t.recentActivity}</h2>
                  <div className="bg-white dark:bg-[#141A22] border border-gray-200 dark:border-white/5 rounded-2xl p-6 h-[calc(100%-2rem)]">
                    {recentActivity.length > 0 ? (
                      <div className="space-y-6">
                        {recentActivity.map((activity, i) => (
                          <div key={activity.id} className="flex gap-4 relative">
                            {i !== recentActivity.length - 1 && (
                              <div className="absolute left-2 top-7 w-px h-[calc(100%-10px)] bg-gray-100 dark:bg-white/5" />
                            )}
                            <div className="w-4 h-4 rounded-full bg-white dark:bg-[#10151B] border-2 border-[#B899FF] mt-1 shrink-0 z-10" />
                            <div>
                              <p className="text-[14px] text-gray-900 dark:text-[#F5F5F5] mb-0.5">
                                {t.editedDoc} <span className="font-semibold text-gray-900 dark:text-white">{activity.title}</span>
                              </p>
                              <p className="text-[12px] text-gray-500 dark:text-[#8A94A0]">
                                {t.in} {activity.bookTitle} • {formatDate(activity.updatedAt, lang)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-[#8A94A0]">
                        <Clock className="w-8 h-8 mb-3 opacity-20" />
                        <p className="text-[14px]">{t.noActivity}<br />{t.noActivityDesc}</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <hr className="border-gray-200 dark:border-white/5" />

              {/* LIBRARY */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[16px] font-medium text-gray-500 dark:text-[#8A94A0]">{t.yourLibrary}</h2>
                  <button
                    onClick={handleCriarLivro}
                    className="text-[14px] text-gray-900 dark:text-[#F5F5F5] hover:text-violet-600 dark:hover:text-[#B899FF] flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t.newBook}
                  </button>
                </div>

                {books.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {books.map(book => (
                      <div key={book.id} className="group flex flex-col gap-3">
                        <Link href={`/${lang}/editor/${book.id}`}>
                          <div className="aspect-[3/4] bg-white dark:bg-[#141A22] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden relative transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)] group-hover:border-gray-200 dark:border-white/10">
                            {/* Placeholder or Real Cover */}
                            {book.coverImage ? (
                              <img src={book.coverImage} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-[#10151B] to-[#0A0D12]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D12] via-[#0A0D12]/20 to-transparent opacity-80" />
                            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                              <span className="text-[10px] font-medium px-2 py-1 bg-black/40 text-gray-500 dark:text-[#8A94A0] rounded-sm w-fit uppercase tracking-wider backdrop-blur-md">
                                {book.category || "NOVEL"}
                              </span>
                              <h3 className="text-xl font-serif text-gray-900 dark:text-white font-semibold leading-snug line-clamp-3">
                                {book.title}
                              </h3>
                            </div>
                          </div>
                        </Link>

                        <div className="flex items-start justify-between px-1">
                          <div>
                            <p className="text-[14px] text-gray-900 dark:text-[#F5F5F5] font-medium line-clamp-1">{book.title}</p>
                            <p className="text-[12px] text-gray-500 dark:text-[#8A94A0]">
                              {book.wordCount.toLocaleString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US')} {t.words}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeletar(book.id, e)}
                            className="p-1.5 text-gray-500 dark:text-[#8A94A0] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-400/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 border border-gray-200 dark:border-white/5 border-dashed rounded-2xl bg-white dark:bg-[#141A22]/50 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white dark:bg-[#10151B] rounded-2xl flex items-center justify-center mb-6 border border-gray-200 dark:border-white/5">
                      <BookOpen className="w-8 h-8 text-gray-500 dark:text-[#8A94A0]" />
                    </div>
                    <h3 className="text-[18px] font-medium text-gray-900 dark:text-white mb-2">{t.emptyLibrary}</h3>
                    <p className="text-[14px] text-gray-500 dark:text-[#8A94A0] mb-6">{t.emptyLibraryDesc}</p>
                    <button
                      onClick={handleCriarLivro}
                      className="px-5 py-2.5 bg-white dark:bg-[#141A22] hover:bg-gray-100 dark:hover:bg-[#181F28] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
                    >
                      {t.createNewBook}
                    </button>
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
