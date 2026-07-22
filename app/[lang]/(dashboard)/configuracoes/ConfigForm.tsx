"use client"

import React, { useState, useTransition } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { salvarRagAction, salvarMasterPinAction, updateUserProfileServerAction } from "@/app/actions/user"
import { 
  User, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Crown, 
  Zap, 
  Sun, 
  Moon,
  BookOpen,
  FileText,
  Activity,
  Infinity,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  HardDrive
} from "lucide-react"

interface UserData {
  id: string
  name: string | null
  email: string
  image: string | null
  selectedPlan: string
  isPremium: boolean
  aiCallsCount: number
  projectsCount: number
  documentsCount: number
  totalWords: number
  ragContext: string | null
  masterPin: string | null
  createdAt: string
}

interface ConfigFormProps {
  user: UserData
}

export default function ConfigForm({ user }: ConfigFormProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const initialTab = searchParams.get("tab") || "billings"
  const [activeTab, setActiveTab] = useState<string>(initialTab)
  // Profile Form state
  const [name, setName] = useState(user.name || "")
  const [image, setImage] = useState(user.image || "")
  const [profileMsg, setProfileMsg] = useState<{ success?: string; error?: string }>({})
  const [isUpdatingProfile, startProfileTransition] = useTransition()

  // PIN Form state
  const [masterPin, setMasterPin] = useState(user.masterPin || "")
  const [pinMsg, setPinMsg] = useState<{ success?: string; error?: string }>({})
  const [isUpdatingPin, setIsUpdatingPin] = useState(false)

  // RAG Form state
  const [ragContext, setRagContext] = useState(user.ragContext || "")
  const [ragMsg, setRagMsg] = useState<{ success?: string; error?: string }>({})
  const [isUpdatingRag, setIsUpdatingRag] = useState(false)

  // Profile update handler
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg({})
    startProfileTransition(async () => {
      const res = await updateUserProfileServerAction(name, image)
      setProfileMsg(res)
    })
  }

  // PIN update handler
  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (masterPin.length !== 4) return
    setIsUpdatingPin(true)
    setPinMsg({})
    try {
      const res = await salvarMasterPinAction(masterPin)
      if (res.success) {
        localStorage.setItem("master_pin", masterPin)
        setPinMsg({ success: "PIN Mestre atualizado e sincronizado com E2EE!" })
      } else {
        setPinMsg({ error: res.error })
      }
    } catch {
      setPinMsg({ error: "Erro ao salvar o PIN Mestre." })
    } finally {
      setIsUpdatingPin(false)
    }
  }

  // RAG update handler
  const handleUpdateRag = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingRag(true)
    setRagMsg({})
    try {
      const formData = new FormData()
      formData.append("ragContext", ragContext)
      const res = await salvarRagAction(null, formData)
      setRagMsg(res)
    } catch {
      setRagMsg({ error: "Erro ao salvar o contexto RAG." })
    } finally {
      setIsUpdatingRag(false)
    }
  }

  // Plan Details Map
  const planInfo = {
    premium: {
      name: "Premiere Unlimited",
      amount: "R$ 49,99 / mês",
      cycle: "Mensal",
      nextDate: "16 Ago, 2026",
      maxProjects: "∞",
      maxAiCalls: "∞",
      badge: "Premiere",
      badgeStyle: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      icon: Crown,
    },
    pro: {
      name: "Pro Co-Author",
      amount: "R$ 19,99 / mês",
      cycle: "Mensal",
      nextDate: "16 Ago, 2026",
      maxProjects: 8,
      maxAiCalls: 500,
      badge: "Pro",
      badgeStyle: "bg-white/10 text-white border-white/30",
      icon: Zap,
    },
    free: {
      name: "Essencial",
      amount: "R$ 0,00 / mês",
      cycle: "Gratuito",
      nextDate: "Sem expiração",
      maxProjects: 3,
      maxAiCalls: 7,
      badge: "Grátis",
      badgeStyle: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      icon: Sparkles,
    }
  }[user.selectedPlan || "free"] || {
    name: "Essencial",
    amount: "R$ 0,00 / mês",
    cycle: "Gratuito",
    nextDate: "Sem expiração",
    maxProjects: 3,
    maxAiCalls: 7,
    badge: "Grátis",
    badgeStyle: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    icon: Sparkles,
  }

  // Helper para cálculo dinâmico da porcentagem de uso e cor da barra
  function getUsageMetric(used: number, max: number | string) {
    if (typeof max === "string") {
      return {
        percent: 100,
        label: "Ilimitado",
        displayText: `${used} (Sem limite)`,
        barColor: "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]",
        textColor: "text-emerald-400 font-bold",
        badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        isUnlimited: true,
      }
    }

    const percent = Math.min(100, Math.round((used / max) * 100))

    if (percent >= 85) {
      return {
        percent: percent,
        label: "Limite Próximo",
        displayText: `${used} de ${max} (${percent}%)`,
        barColor: "bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_12px_rgba(244,63,94,0.7)] animate-pulse",
        textColor: "text-rose-400 font-bold",
        badgeStyle: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        isUnlimited: false,
      }
    }

    if (percent >= 50) {
      return {
        percent: percent,
        label: "Uso Moderado",
        displayText: `${used} de ${max} (${percent}%)`,
        barColor: "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
        textColor: "text-amber-400 font-semibold",
        badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        isUnlimited: false,
      }
    }

    return {
      percent: percent,
      label: "Saudável",
      displayText: `${used} de ${max} (${percent}%)`,
      barColor: "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]",
      textColor: "text-emerald-400 font-medium",
      badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      isUnlimited: false,
    }
  }

  const projectsMetric = getUsageMetric(user.projectsCount, planInfo.maxProjects)
  const aiCallsMetric = getUsageMetric(user.aiCallsCount, planInfo.maxAiCalls)

  return (
    <div className={`min-h-screen w-full transition-colors duration-200 ${"bg-[var(--theme-bg-main)] text-[var(--theme-text-main)]"}`}>
      
      {/* Header Navigation Bar */}
      <header className={`sticky top-0 z-30 w-full border-b ${"bg-[var(--theme-bg-surface)]/90 border-[var(--theme-border-subtle)]"} backdrop-blur-md px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-3 text-xs font-medium">
            <Link 
              href="/pt/dashboard"
              className={`flex items-center gap-2 ${"text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)]"} transition-colors`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Hermione</span>
            </Link>
            <span className={"text-[var(--theme-border)]"}>/</span>
            <span className={"text-[var(--theme-text-muted)]"}>Configurações</span>
            <span className={"text-[var(--theme-border)]"}>/</span>
            <span className={`font-semibold ${"text-[var(--theme-text-main)]"}`}>
              Billings & Usage Limits
            </span>
          </div>

          {/* Controls: Theme & Dashboard */}
          <div className="flex items-center gap-3">
            

            <Link
              href="/pt/dashboard"
              className={`px-4 py-2 rounded-xl text-xs font-bold ${"bg-[var(--theme-text-main)] text-[var(--theme-bg-main)] hover:opacity-90 shadow-lg"} transition-all`}
            >
              Ir para o Dashboard
            </Link>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-light tracking-tight mb-2">
            Billings & Consumo do Plano
          </h1>
          <p className={`text-sm ${"text-[var(--theme-text-muted)]"} font-light`}>
            Acompanhe o consumo dos seus limites contratados, estatísticas de uso em tempo real e dados da conta.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className={`flex items-center gap-2 mb-8 border-b ${"border-[var(--theme-border)]"} pb-3 overflow-x-auto custom-scrollbar`}>
          {[
            { id: "billings", label: "Consumo & Limites do Plano", icon: Activity },
            { id: "account", label: "Perfil & Conta", icon: User },
            { id: "rag", label: "Contexto RAG & IA", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[var(--theme-text-main)] text-[var(--theme-bg-main)] shadow-md"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text-main)] hover:bg-[var(--theme-bg-surface-elevated)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB 1: CONSUMO & LIMITES DO PLANO (REAL CONSUMPTION METRICS WITH DYNAMIC PROGRESS BARS) */}
        {activeTab === "billings" && (
          <div className="space-y-10">
            
            {/* Active Plan Overview Header Banner */}
            <div className={`p-6 rounded-2xl border ${"bg-[var(--theme-bg-surface)] border-[var(--theme-border-subtle)] shadow-xl"} transition-all`}>
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400">
                    Plano Ativo no Momento
                  </h3>
                  <p className={`text-xs ${"text-[var(--theme-text-muted)]"}`}>
                    Informações sobre o ciclo de assinatura do autor.
                  </p>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${planInfo.badgeStyle}`}>
                  {user.selectedPlan === "premium" ? <Crown className="w-3.5 h-3.5" /> : user.selectedPlan === "pro" ? <Zap className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {planInfo.name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                    Valor do Plano
                  </span>
                  <span className="text-xl font-serif font-bold tracking-tight">
                    {planInfo.amount}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                    Ciclo de Cobrança
                  </span>
                  <span className="text-sm font-medium">
                    {planInfo.cycle}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold block mb-1">
                    Renovação
                  </span>
                  <span className="text-sm font-medium">
                    {planInfo.nextDate}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-center justify-start sm:justify-end">
                  <Link
                    href="/pt/subscribe"
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold ${"bg-[var(--theme-text-main)] text-[var(--theme-bg-main)] hover:opacity-90 shadow-lg"} transition-all flex items-center gap-1.5`}
                  >
                    <span>Mudar de Plano</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* REAL USAGE CONSUMPTION & LIMITS SECTION */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-serif font-bold mb-1">Consumo de Recursos & Limites</h3>
                <p className={`text-xs ${"text-[var(--theme-text-muted)]"}`}>
                  Medição em tempo real dos recursos consumidos na sua conta. As barras mudam de cor conforme a porcentagem de uso.
                </p>
              </div>

              {/* Usage Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* METRIC 1: Projetos de Livros */}
                <div className={`p-6 rounded-2xl border ${"bg-[var(--theme-bg-surface)] border-[var(--theme-border-subtle)] shadow-md"} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${"bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-text-main)]"}`}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">Projetos de Livros</h4>
                          <span className="text-[11px] text-gray-500 font-mono">Livros Ativos na Conta</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${projectsMetric.badgeStyle}`}>
                        {projectsMetric.label}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className={`text-2xl font-serif font-bold ${projectsMetric.textColor}`}>
                          {user.projectsCount}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {projectsMetric.displayText}
                        </span>
                      </div>

                      {/* Dynamic Progress Bar */}
                      <div className={`w-full h-3 rounded-full overflow-hidden ${"bg-[var(--theme-bg-surface-elevated)]"}`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${projectsMetric.barColor}`} 
                          style={{ width: `${projectsMetric.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className={`text-xs ${"text-[var(--theme-text-muted)]"} leading-relaxed pt-3 border-t ${"border-[var(--theme-border-subtle)]"}`}>
                    Cada projeto armazena capítulos, bíblia de personagens e lore sincronizados.
                  </p>
                </div>

                {/* METRIC 2: Interações com Hermione IA */}
                <div className={`p-6 rounded-2xl border ${"bg-[var(--theme-bg-surface)] border-[var(--theme-border-subtle)] shadow-md"} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${"bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-text-main)]"}`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">Interações Hermione IA</h4>
                          <span className="text-[11px] text-gray-500 font-mono">Coautoria & Análises</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${aiCallsMetric.badgeStyle}`}>
                        {aiCallsMetric.label}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className={`text-2xl font-serif font-bold ${aiCallsMetric.textColor}`}>
                          {user.aiCallsCount}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          {aiCallsMetric.displayText}
                        </span>
                      </div>

                      {/* Dynamic Progress Bar */}
                      <div className={`w-full h-3 rounded-full overflow-hidden ${"bg-[var(--theme-bg-surface-elevated)]"}`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${aiCallsMetric.barColor}`} 
                          style={{ width: `${aiCallsMetric.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className={`text-xs ${"text-[var(--theme-text-muted)]"} leading-relaxed pt-3 border-t ${"border-[var(--theme-border-subtle)]"}`}>
                    Gerações de texto, revisões ortográficas e consultas à Bíblia RAG.
                  </p>
                </div>

                {/* METRIC 3: Volume de Palavras Escritas */}
                <div className={`p-6 rounded-2xl border ${"bg-[var(--theme-bg-surface)] border-[var(--theme-border-subtle)] shadow-md"} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${"bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-text-main)]"}`}>
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">Total de Palavras Escritas</h4>
                          <span className="text-[11px] text-gray-500 font-mono">Volume no Banco de Dados</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        Sem Restrição
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-2xl font-serif font-bold text-emerald-400">
                          {user.totalWords.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          palavras salvas
                        </span>
                      </div>

                      {/* Infinite Progress Bar */}
                      <div className={`w-full h-3 rounded-full overflow-hidden ${"bg-[var(--theme-bg-surface-elevated)]"}`}>
                        <div className="h-full rounded-full w-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                      </div>
                    </div>
                  </div>

                  <p className={`text-xs ${"text-[var(--theme-text-muted)]"} leading-relaxed pt-3 border-t ${"border-[var(--theme-border-subtle)]"}`}>
                    Todas as palavras geradas e sincronizadas entre computador e aplicativo.
                  </p>
                </div>

                {/* METRIC 4: Manuscritos & Segurança */}
                <div className={`p-6 rounded-2xl border ${"bg-[var(--theme-bg-surface)] border-[var(--theme-border-subtle)] shadow-md"} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${"bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-text-main)]"}`}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">Capítulos Sincronizados</h4>
                          <span className="text-[11px] text-gray-500 font-mono">Criptografia E2EE</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        Protegido
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-2xl font-serif font-bold text-white">
                          {user.documentsCount}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          capítulos ativos
                        </span>
                      </div>

                      {/* Infinite Progress Bar */}
                      <div className={`w-full h-3 rounded-full overflow-hidden ${"bg-[var(--theme-bg-surface-elevated)]"}`}>
                        <div className="h-full rounded-full w-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                      </div>
                    </div>
                  </div>

                  <p className={`text-xs ${"text-[var(--theme-text-muted)]"} leading-relaxed pt-3 border-t ${"border-[var(--theme-border-subtle)]"}`}>
                    Backup contínuo na nuvem com chave PIN Mestre.
                  </p>
                </div>

              </div>

              {/* HIGH USAGE WARNING / UPGRADE CALLOUT BANNER */}
              {(user.selectedPlan === "free" && (user.aiCallsCount >= 5 || user.projectsCount >= 3)) && (
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#19130D] to-[#0D1017] border border-amber-500/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                      <AlertTriangle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">Você está próximo dos limites do Plano Essencial</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Faça o upgrade para o **Pro Co-Author** e libere até 8 projetos simultâneos e interações ilimitadas com a Hermione.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/pt/subscribe"
                    className="px-6 py-3 rounded-xl bg-white hover:bg-gray-100 text-black text-xs font-bold tracking-wider uppercase transition-all shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    Desbloquear Acesso Pro
                  </Link>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: ACCOUNT / PERFIL */}
        {activeTab === "account" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Card: User Avatar Info */}
            <div className={`p-6 rounded-2xl border ${"bg-[var(--theme-bg-surface)] border-[var(--theme-border-subtle)] shadow-md"} flex flex-col items-center text-center`}>
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-white/20 shadow-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                {image ? (
                  <img src={image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-serif font-bold text-white">
                    {(name || user.email).substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold font-serif">{name || "Autor Hermione"}</h2>
              <p className={`text-xs ${"text-[var(--theme-text-muted)]"} font-mono mb-4`}>{user.email}</p>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${planInfo.badgeStyle}`}>
                {user.selectedPlan === "premium" ? <Crown className="w-3 h-3" /> : user.selectedPlan === "pro" ? <Zap className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                Plano {planInfo.name}
              </span>
            </div>

            {/* Right Card: Profile Edit Form */}
            <div className={`lg:col-span-2 p-6 rounded-2xl border ${"bg-[var(--theme-bg-surface)] border-[var(--theme-border-subtle)] shadow-md"}`}>
              <h3 className="text-base font-bold mb-1">Dados de Perfil</h3>
              <p className={`text-xs ${"text-[var(--theme-text-muted)]"} mb-6`}>
                Atualize seu nome de exibição e foto de avatar.
              </p>

              {profileMsg.success && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
                  {profileMsg.success}
                </div>
              )}
              {profileMsg.error && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                  {profileMsg.error}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5">
                    Nome Completo / Pseudônimo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu Nome de Autor"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs border ${"bg-[var(--theme-bg-surface-elevated)] border-[var(--theme-border)] text-[var(--theme-text-main)]"} focus:outline-none focus:border-white/40`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5">
                    URL da Foto de Perfil (Avatar)
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://exemplo.com/sua-foto.jpg"
                    className={`w-full px-4 py-2.5 rounded-xl text-xs border ${"bg-[var(--theme-bg-surface-elevated)] border-[var(--theme-border)] text-[var(--theme-text-main)]"} focus:outline-none focus:border-white/40`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">
                    E-mail da Conta (Não editável)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.email}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs border ${"bg-transparent border-[var(--theme-border-subtle)] text-[var(--theme-text-muted)]"} cursor-not-allowed`}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold ${"bg-[var(--theme-text-main)] text-[var(--theme-bg-main)] hover:opacity-90 shadow-lg"} transition-all`}
                  >
                    {isUpdatingProfile ? "Salvando..." : "Salvar Perfil"}
                  </button>
                </div>
              </form>

              <hr className={`my-8 border-t ${"border-[var(--theme-border)]"}`} />

              {/* Master PIN Section */}
              <div>
                <h3 className="text-base font-bold mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security PIN (Criptografia E2EE)
                </h3>
                <p className={`text-xs ${"text-[var(--theme-text-muted)]"} mb-4`}>
                  PIN de 4 dígitos para desbloquear rascunhos com criptografia no navegador e app mobile.
                </p>

                {pinMsg.success && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
                    {pinMsg.success}
                  </div>
                )}
                {pinMsg.error && (
                  <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                    {pinMsg.error}
                  </div>
                )}

                <form onSubmit={handleUpdatePin} className="flex gap-3 items-center">
                  <input
                    type="password"
                    maxLength={4}
                    value={masterPin}
                    onChange={(e) => setMasterPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className={`w-32 px-4 py-2.5 rounded-xl text-xs font-mono text-center tracking-[0.5em] border ${"bg-[var(--theme-bg-surface-elevated)] border-[var(--theme-border)] text-[var(--theme-text-main)]"}`}
                  />
                  <button
                    type="submit"
                    disabled={masterPin.length !== 4 || isUpdatingPin}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border ${"border-[var(--theme-border)] hover:bg-[var(--theme-bg-surface-elevated)] text-[var(--theme-text-main)]"} disabled:opacity-50`}
                  >
                    {isUpdatingPin ? "Salvando..." : "Salvar PIN"}
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: RAG & PREFERÊNCIAS DE IA */}
        {activeTab === "rag" && (
          <div className={`p-6 rounded-2xl border ${"bg-[var(--theme-bg-surface)] border-[var(--theme-border-subtle)] shadow-md"}`}>
            <div className="mb-6">
              <h3 className="text-lg font-bold font-serif mb-1">Contexto Customizado do Usuário (RAG)</h3>
              <p className={`text-xs ${"text-[var(--theme-text-muted)]"}`}>
                Instrua a IA Hermione sobre seu estilo de escrita, vocabulário preferido e detalhes pessoais. Este contexto é utilizado em cada sugestão de texto e chat.
              </p>
            </div>

            {ragMsg.success && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
                {ragMsg.success}
              </div>
            )}
            {ragMsg.error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                {ragMsg.error}
              </div>
            )}

            <form onSubmit={handleUpdateRag} className="space-y-4">
              <textarea
                value={ragContext}
                onChange={(e) => setRagContext(e.target.value)}
                placeholder="Ex: O usuário se chama Paulo, é desenvolvedor e prefere respostas rápidas e sem rodeios. Hermione deve tratar o autor por 'Mestre' e adicionar toques de inteligência editorial..."
                rows={8}
                className={`w-full p-4 rounded-xl text-xs font-mono border leading-relaxed ${"bg-[var(--theme-bg-surface-elevated)] border-[var(--theme-border)] text-[var(--theme-text-main)]"} focus:outline-none focus:border-white/40`}
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingRag}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold ${"bg-[var(--theme-text-main)] text-[var(--theme-bg-main)] hover:opacity-90 shadow-lg"}`}
                >
                  {isUpdatingRag ? "Salvando..." : "Salvar Contexto RAG"}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

    </div>
  )
}
