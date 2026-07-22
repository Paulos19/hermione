"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { logoutAction } from "@/app/actions/auth"
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
  Target
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

  const maxProjects = selectedPlan === "free" ? 1 : "∞"
  const maxAiCalls = selectedPlan === "free" ? 7 : "∞"

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
            <div className="w-9 h-9 rounded-xl bg-violet-600 dark:bg-[#B899FF] flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
              <PenTool className="w-5 h-5 text-white dark:text-[#0A0D12]" />
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

        {/* Bottom Section (Usage & Plan) */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#10151B]/50 flex flex-col gap-3">
            
            {/* Plan Info Card */}
            <div className="bg-gray-50 dark:bg-[#141A22] p-3 rounded-xl border border-gray-200 dark:border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#8A94A0]">
                  Plano {selectedPlan}
                </span>
                {selectedPlan === "free" && (
                  <Link href={`/${lang}/subscribe`} className="text-[11px] font-medium text-violet-600 dark:text-[#B899FF] hover:underline">
                    Fazer Upgrade
                  </Link>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-gray-600 dark:text-[#A0AAB5]">Projetos</span>
                  <span className="font-medium text-gray-900 dark:text-white">{projectsCount} / {maxProjects}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-gray-600 dark:text-[#A0AAB5]">Magia da Hermione</span>
                  <span className="font-medium text-gray-900 dark:text-white">{aiCallsCount} / {maxAiCalls}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (selectedPlan === "free" && aiCallsCount >= 7) {
                  router.push(`/${lang}/subscribe`)
                } else {
                  router.push(`/${lang}/chat`)
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[13px] font-medium transition-all shadow-md shadow-violet-900/20"
            >
              <Sparkles className="w-4 h-4" />
              {t.hermione}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
