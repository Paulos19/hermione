"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/app/components/Dashboard/DashboardSidebar"
import { DashboardTopbar } from "@/app/components/Dashboard/DashboardTopbar"
import { Target, TrendingUp, BarChart2, BookOpen, Edit2, Check, X } from "lucide-react"
import { updateDailyGoalAction } from "@/app/actions/metrics"
import { toast } from "sonner"

interface DailyProgress {
  date: string
  words: number
}

interface BookStats {
  id: string
  title: string
  totalWords: number
  chapterCount: number
  avgWordsPerChapter: number
}

interface MetricsProps {
  userImage?: string | null
  dailyGoal: number
  wordsToday: number
  history: DailyProgress[]
  booksStats: BookStats[]
  lang: string
  isPremium: boolean
  selectedPlan: string
  projectsCount: number
  aiCallsCount: number
}

export default function MetricsClient({
  userImage,
  dailyGoal,
  wordsToday,
  history,
  booksStats,
  lang,
  isPremium,
  selectedPlan,
  projectsCount,
  aiCallsCount
}: MetricsProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  

  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [editGoalValue, setEditGoalValue] = useState(dailyGoal.toString())
  const [isSavingGoal, setIsSavingGoal] = useState(false)

  const handleSaveGoal = async () => {
    const val = parseInt(editGoalValue, 10)
    if (isNaN(val) || val <= 0) {
      toast.error("Por favor, insira um número válido maior que zero.")
      return
    }
    
    setIsSavingGoal(true)
    try {
      await updateDailyGoalAction(val)
      toast.success("Meta atualizada com sucesso!")
      setIsEditingGoal(false)
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar meta.")
    } finally {
      setIsSavingGoal(false)
    }
  }

  const progressPercent = Math.min(100, Math.round((wordsToday / dailyGoal) * 100))
  const totalGlobalWords = booksStats.reduce((acc, b) => acc + b.totalWords, 0)

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
              
              {/* HEADER */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--theme-accent-light)] flex items-center justify-center text-[var(--theme-accent)]">
                  <Target className="w-5 h-5" />
                </div>
                <h1 className="text-[32px] md:text-[40px] font-serif font-semibold text-[var(--theme-text-main)] leading-tight">
                  Metas & Métricas
                </h1>
              </div>

              {/* OVERVIEW CARDS */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Meta Diária */}
                <div className="bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6 z-10">
                    <div className="text-[var(--theme-text-muted)] text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Progresso Hoje
                    </div>
                    {!isEditingGoal && (
                      <button 
                        onClick={() => setIsEditingGoal(true)}
                        className="text-gray-400 hover:text-violet-600 transition-colors p-1"
                        title="Editar Meta Diária"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-end gap-3 z-10 mb-6 min-h-[40px]">
                    <span className="text-4xl font-bold text-[var(--theme-text-main)]">{wordsToday}</span>
                    
                    {isEditingGoal ? (
                      <div className="flex items-center gap-2 pb-1">
                        <span className="text-[var(--theme-text-muted)]">/</span>
                        <input
                          type="number"
                          value={editGoalValue}
                          onChange={(e) => setEditGoalValue(e.target.value)}
                          className="w-20 bg-[var(--theme-bg-main)] border border-gray-300 dark:border-white/10 rounded-md px-2 py-1 text-sm text-[var(--theme-text-main)] outline-none focus:border-violet-500 transition-colors"
                          disabled={isSavingGoal}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveGoal()
                            if (e.key === 'Escape') setIsEditingGoal(false)
                          }}
                        />
                        <button onClick={handleSaveGoal} disabled={isSavingGoal} className="text-green-500 hover:text-green-600 p-1">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsEditingGoal(false)} disabled={isSavingGoal} className="text-red-500 hover:text-red-600 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[var(--theme-text-muted)] mb-1">/ {dailyGoal} palavras</span>
                    )}
                  </div>

                  <div className="w-full bg-[var(--theme-bg-surface-elevated)] h-3 rounded-full overflow-hidden z-10">
                    <div 
                      className="h-full bg-violet-600 dark:bg-[#B899FF] rounded-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Total Global */}
                <div className="bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="text-[var(--theme-text-muted)] text-sm font-medium flex items-center gap-2 mb-6">
                    <BarChart2 className="w-4 h-4" /> Palavras Globais Escritas
                  </div>
                  <div className="flex items-end gap-3 mt-auto">
                    <span className="text-4xl font-bold text-[var(--theme-text-main)]">{totalGlobalWords.toLocaleString('pt-BR')}</span>
                    <span className="text-[var(--theme-text-muted)] mb-1">total histórico</span>
                  </div>
                </div>

                {/* Projetos Ativos */}
                <div className="bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="text-[var(--theme-text-muted)] text-sm font-medium flex items-center gap-2 mb-6">
                    <BookOpen className="w-4 h-4" /> Projetos Criados
                  </div>
                  <div className="flex items-end gap-3 mt-auto">
                    <span className="text-4xl font-bold text-[var(--theme-text-main)]">{booksStats.length}</span>
                    <span className="text-[var(--theme-text-muted)] mb-1">livros</span>
                  </div>
                </div>
              </section>

              {/* POR PROJETO */}
              <section>
                <h3 className="text-xl font-semibold text-[var(--theme-text-main)] mb-6">Estatísticas por Livro</h3>
                {booksStats.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {booksStats.map(b => (
                      <div key={b.id} className="bg-[#FAFAFA] dark:bg-[#10151B] border border-[var(--theme-border-subtle)] rounded-2xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-4">
                          <BookOpen className="w-5 h-5 text-violet-500" />
                          <h4 className="text-lg font-medium text-[var(--theme-text-main)] truncate">{b.title}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div>
                            <div className="text-xs text-[var(--theme-text-muted)] mb-1 uppercase tracking-wider font-semibold">Total Palavras</div>
                            <div className="text-2xl font-semibold text-[var(--theme-text-main)]">{b.totalWords.toLocaleString('pt-BR')}</div>
                          </div>
                          <div>
                            <div className="text-xs text-[var(--theme-text-muted)] mb-1 uppercase tracking-wider font-semibold">Capítulos</div>
                            <div className="text-2xl font-semibold text-[var(--theme-text-main)]">{b.chapterCount}</div>
                          </div>
                          <div className="col-span-2 pt-4 border-t border-[var(--theme-border-subtle)]">
                            <div className="text-xs text-[var(--theme-text-muted)] mb-1 uppercase tracking-wider font-semibold">Média p/ Capítulo</div>
                            <div className="text-xl font-medium text-gray-700 dark:text-gray-300">{b.avgWordsPerChapter.toLocaleString('pt-BR')} <span className="text-sm font-normal text-gray-500">palavras</span></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 border border-[var(--theme-border-subtle)] border-dashed rounded-[24px] flex flex-col items-center justify-center text-center">
                    <p className="text-[var(--theme-text-muted)]">Nenhum livro criado ainda.</p>
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
