"use client"

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
  Sparkles,
  Star,
  LogOut,
  Trash2
} from "lucide-react"
import { dict } from "@/lib/dictionaries"
import { Locale } from "@/lib/i18n-config"

export function DashboardSidebar({ streak = 0, wordsToday = 0, lang = 'pt', isPremium = false }: { streak?: number; wordsToday?: number; lang?: string; isPremium?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const t = dict[lang as Locale].nav

  const navItems = [
    { name: t.library, href: `/${lang}/dashboard`, icon: Library },
    { name: t.projects, href: `/${lang}/dashboard/projects`, icon: BookOpen },
    { name: t.characters, href: `/${lang}/dashboard/characters`, icon: Users },
    { name: t.worldBuilding, href: `/${lang}/dashboard/world`, icon: Globe },
    { name: t.notes, href: `/${lang}/dashboard/notes`, icon: PenTool },
    { name: t.research, href: `/${lang}/dashboard/research`, icon: Search },
    { name: t.comments, href: `/${lang}/dashboard/comments`, icon: MessageSquare },
    { name: "Feedback", href: `/${lang}/dashboard/feedback`, icon: Star },
  ]

  return (
    <aside className="w-[280px] bg-white dark:bg-[#0E1318] border-r border-gray-200 dark:border-white/5 h-screen flex flex-col shrink-0">
      <div className="p-8 pb-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-600 dark:bg-[#B899FF] flex items-center justify-center">
          <PenTool className="w-4 h-4 text-white" />
        </div>
        <span className="text-gray-900 dark:text-[#F5F5F5] font-serif text-xl tracking-wide font-semibold">Hermione</span>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-all duration-150 ${isActive
                  ? "bg-violet-50 dark:bg-[#141A22] text-violet-600 dark:text-[#B899FF] font-medium"
                  : "text-gray-500 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#141A22]/50"
                }`}
            >
              <Icon className="w-[18px] h-[18px] opacity-80" />
              {item.name}
            </Link>
          )
        })}

        <div className="my-4 mx-4 h-px bg-gray-200 dark:bg-white/5" />

        <Link
          href={`/${lang}/dashboard/trash`}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] text-gray-500 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#141A22]/50 transition-all duration-150"
        >
          <Trash2 className="w-[18px] h-[18px] opacity-80" />
          {t.trash}
        </Link>
        <button
          onClick={() => logoutAction()}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] text-gray-500 dark:text-[#8A94A0] hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150 text-left"
        >
          <LogOut className="w-[18px] h-[18px] opacity-80" />
          Sair
        </button>
      </nav>

      {/* Bottom Section */}
      <div className="p-6 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-[#10151B]/50">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[12px] font-medium text-gray-500 dark:text-[#8A94A0]">{t.todaysProgress}</span>
            <span className="text-[12px] font-semibold text-violet-600 dark:text-[#B899FF]">{wordsToday} / 1000 w</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-[#141A22] rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 dark:bg-[#B899FF] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (wordsToday / 1000) * 100)}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => {
            if (!isPremium) {
              router.push(`/${lang}/subscribe`)
            } else {
              // Open Hermione AI modal/chat (future feature)
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 dark:bg-[#141A22] hover:bg-gray-100 dark:hover:bg-[#181F28] border border-gray-200 dark:border-white/5 rounded-lg text-[14px] text-gray-900 dark:text-[#F5F5F5] transition-all duration-150"
        >
          <Sparkles className="w-4 h-4 text-violet-600 dark:text-[#B899FF]" />
          {t.hermione}
        </button>
      </div>
    </aside>
  )
}
