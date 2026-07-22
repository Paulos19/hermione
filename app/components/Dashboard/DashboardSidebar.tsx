"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { logoutAction } from "@/app/actions/auth"
import logoImg from "@/assets/design/logo.png"
import {
  BookOpen,
  Library,
  Users,
  Globe,
  PenTool,
  Search,
  MessageSquare,
  Star,
  LogOut,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Target,
  Crown,
  Zap,
  Infinity,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react"
import { dict } from "@/lib/dictionaries"
import { Locale } from "@/lib/i18n-config"

interface DashboardSidebarProps {
  streak?: number
  wordsToday?: number
  lang?: string
  isPremium?: boolean
  selectedPlan?: string
  projectsCount?: number
  aiCallsCount?: number
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  isMobileOpen?: boolean
  onCloseMobile?: () => void
}

export function DashboardSidebar({
  wordsToday = 0,
  lang = "pt",
  isPremium = false,
  selectedPlan = "free",
  projectsCount = 0,
  aiCallsCount = 0,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const t = dict[(lang || "pt") as Locale].nav

  const navItems = [
    { name: t.library, href: `/${lang}/dashboard`, icon: Library },
    { name: t.projects, href: `/${lang}/dashboard/projects`, icon: BookOpen },
    { name: t.characters, href: `/${lang}/dashboard/characters`, icon: Users },
    { name: t.worldBuilding, href: `/${lang}/dashboard/world`, icon: Globe },
    { name: t.notes, href: `/${lang}/dashboard/notes`, icon: PenTool },
    { name: "Metas & Métricas", href: `/${lang}/dashboard/metrics`, icon: Target },
    { name: "Feedback", href: `/${lang}/dashboard/feedback`, icon: Star },
  ]

  // Configuração dos estilos e iluminação de cada plano
  const planConfig = {
    premium: {
      title: "Premiere Unlimited",
      badgeText: "Premiere",
      icon: Crown,
      cardStyle: "bg-gradient-to-br from-[#1E170F] via-[#14100B] to-[#0B0D12] border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)]",
      badgeStyle: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      glowColor: "bg-amber-500/15",
      accentText: "text-amber-400",
      progressBg: "bg-amber-500",
      maxProjects: "∞",
      maxAiCalls: "∞",
      isUnlimited: true
    },
    pro: {
      title: "Pro Co-Author",
      badgeText: "Pro",
      icon: Zap,
      cardStyle: "bg-gradient-to-br from-[#161824] via-[#0F111A] to-[#0E0F14] border border-white/30 shadow-[0_0_25px_rgba(255,255,255,0.12)]",
      badgeStyle: "bg-white/10 text-white border-white/20",
      glowColor: "bg-white/10",
      accentText: "text-white",
      progressBg: "bg-white",
      maxProjects: 8,
      maxAiCalls: "Ampliado",
      isUnlimited: false
    },
    free: {
      title: "Plano Essencial",
      badgeText: "Grátis",
      icon: Sparkles,
      cardStyle: "bg-[#101218] border border-white/10 hover:border-white/20",
      badgeStyle: "bg-white/5 text-gray-400 border-white/10",
      glowColor: "bg-white/5",
      accentText: "text-gray-300",
      progressBg: "bg-gray-400",
      maxProjects: 3,
      maxAiCalls: 7,
      isUnlimited: false
    }
  }

  const currentConfig = planConfig[selectedPlan as keyof typeof planConfig] || planConfig.free
  const PlanIcon = currentConfig.icon

  // Cálculo de porcentagem de uso para barras de progresso
  const projectsPercent = typeof currentConfig.maxProjects === "number" 
    ? Math.min(100, Math.round((projectsCount / currentConfig.maxProjects) * 100))
    : 100

  const aiPercent = typeof currentConfig.maxAiCalls === "number"
    ? Math.min(100, Math.round((aiCallsCount / currentConfig.maxAiCalls) * 100))
    : 100

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-white dark:bg-[#0E1318] border-r border-gray-200 dark:border-white/5 h-screen flex flex-col shrink-0 transition-all duration-300 z-50 ${
          // Mobile state: slide-in drawer
          isMobileOpen
            ? "fixed inset-y-0 left-0 w-[280px] shadow-2xl translate-x-0"
            : "fixed inset-y-0 left-0 -translate-x-full md:relative md:translate-x-0"
        } ${
          // Desktop state: collapsed vs expanded
          isCollapsed ? "md:w-[72px]" : "md:w-[280px]"
        }`}
      >
        {/* Header Bar inside Sidebar */}
        <div className="p-4 md:p-6 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* White glass logo container badge with original H logo */}
            <div className="relative w-9 h-9 rounded-xl bg-white border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
              <Image 
                src={logoImg} 
                alt="Hermione Logo" 
                width={36} 
                height={36} 
                className="w-full h-full object-contain"
                priority
              />
            </div>
            {!isCollapsed && (
              <span className="text-gray-900 dark:text-[#F5F5F5] font-serif text-xl tracking-wide font-semibold whitespace-nowrap">
                Hermione
              </span>
            )}
          </div>

          {/* Close button for Mobile Drawer */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-[#8A94A0] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:text-[#8A94A0] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-all duration-150 ${
                  isActive
                    ? "bg-violet-50 dark:bg-[#141A22] text-violet-600 dark:text-[#B899FF] font-semibold shadow-sm"
                    : "text-gray-500 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#141A22]/50"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            )
          })}

          <div className="my-3 mx-2 h-px bg-gray-200 dark:bg-white/5" />

          <button
            onClick={() => logoutAction()}
            title={isCollapsed ? "Sair" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] text-gray-500 dark:text-[#8A94A0] hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150 text-left ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </nav>

        {/* Bottom Section (Usage & Dynamic Illuminated Plan Card) */}
        {!isCollapsed ? (
          <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#0A0C10] flex flex-col gap-3">
            
            {/* Dynamic Illuminated Plan Info Card */}
            <div className={`relative p-4 rounded-2xl ${currentConfig.cardStyle} transition-all duration-300 overflow-hidden group`}>
              
              {/* Radial ambient background light flare */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${currentConfig.glowColor} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

              {/* Card Header: Badge & Icon */}
              <div className="flex items-center justify-between mb-3.5 relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${currentConfig.badgeStyle}`}>
                    <PlanIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[12px] font-bold tracking-tight text-white">
                    {currentConfig.title}
                  </span>
                </div>
                
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${currentConfig.badgeStyle}`}>
                  {currentConfig.badgeText}
                </span>
              </div>

              {/* Stats & Progress Bars */}
              <div className="space-y-2.5 relative z-10">
                
                {/* Projetos */}
                <div>
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-gray-400 font-medium">Projetos</span>
                    <span className={`font-semibold ${currentConfig.accentText}`}>
                      {projectsCount} / {currentConfig.maxProjects}
                    </span>
                  </div>
                  {typeof currentConfig.maxProjects === "number" && (
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className={`h-full ${currentConfig.progressBg} rounded-full transition-all duration-500`} 
                        style={{ width: `${projectsPercent}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Hermione IA Calls */}
                <div>
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-gray-400 font-medium">Interações IA</span>
                    <span className={`font-semibold ${currentConfig.accentText}`}>
                      {currentConfig.isUnlimited ? (
                        <span className="flex items-center gap-1">
                          <Infinity className="w-3.5 h-3.5 text-amber-400" /> Ilimitado
                        </span>
                      ) : (
                        `${aiCallsCount} / ${currentConfig.maxAiCalls}`
                      )}
                    </span>
                  </div>
                  {typeof currentConfig.maxAiCalls === "number" && (
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className={`h-full ${aiPercent >= 85 ? "bg-amber-400" : currentConfig.progressBg} rounded-full transition-all duration-500`} 
                        style={{ width: `${aiPercent}%` }}
                      />
                    </div>
                  )}
                </div>

              </div>

              {/* Upgrade / Subscription Action link inside card */}
              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
                {selectedPlan === "free" ? (
                  <Link 
                    href={`/${lang}/configuracoes?tab=billings`} 
                    className="w-full inline-flex items-center justify-between text-[11px] font-bold text-white hover:text-emerald-400 transition-colors group/link"
                  >
                    <span>Fazer Upgrade para Pro</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </Link>
                ) : (
                  <Link 
                    href={`/${lang}/configuracoes?tab=billings`} 
                    className="w-full inline-flex items-center justify-between text-[11px] font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    <span>Gerenciar Assinatura</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

            </div>

            {/* Quick Chat Hermione Action */}
            <button
              onClick={() => {
                if (selectedPlan === "free" && aiCallsCount >= 7) {
                  router.push(`/${lang}/configuracoes?tab=billings`)
                } else {
                  router.push(`/${lang}/chat`)
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-gray-100 text-black rounded-xl text-[13px] font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 fill-current text-black" />
              {t.hermione}
            </button>
          </div>
        ) : (
          /* Collapsed Desktop Plan Badge */
          <div className="p-3 border-t border-gray-200 dark:border-white/5 flex flex-col items-center gap-2">
            <Link
              href={`/${lang}/configuracoes?tab=billings`}
              title={`Plano ${currentConfig.title} - Clique para gerenciar assinatura`}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentConfig.cardStyle} hover:scale-110 transition-transform`}
            >
              <PlanIcon className={`w-5 h-5 ${currentConfig.accentText}`} />
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
