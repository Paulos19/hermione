"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Sparkles, Check, ArrowLeft, Loader2 } from "lucide-react"
import { dict } from "@/lib/dictionaries"
import { Locale } from "@/lib/i18n-config"
import { DashboardTopbar } from "@/app/components/Dashboard/DashboardTopbar"
import { createStripeCheckoutSessionAction } from "@/app/actions/stripe"
import { toast } from "sonner"

export default function SubscribeClient({ lang, isPremium }: { lang: string; isPremium: boolean }) {
  const t = dict[lang as Locale].subscription
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
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

  const handleSubscribe = async () => {
    try {
      setIsProcessing(true)
      const url = await createStripeCheckoutSessionAction(lang)
      window.location.href = url
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar checkout")
      setIsProcessing(false)
    }
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} antialiased`}>
      <div className="flex flex-col h-screen w-full font-sans bg-gray-50 dark:bg-[#0A0D12] text-gray-900 dark:text-[#F5F5F5] transition-colors duration-200">
        <DashboardTopbar theme={theme} onToggleTheme={toggleTheme} lang={lang} />
        
        <main className="flex-1 overflow-y-auto flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <Link 
              href={`/${lang}/dashboard`}
              className="inline-flex items-center gap-2 text-gray-500 dark:text-[#8A94A0] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors mb-10"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.cancel}
            </Link>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-violet-100 dark:bg-[#141A22] border border-violet-200 dark:border-white/5 mb-6">
                  <Sparkles className="w-8 h-8 text-violet-600 dark:text-[#B899FF]" />
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-semibold text-gray-900 dark:text-white mb-6 leading-tight">
                  {t.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-[#8A94A0] mb-8 leading-relaxed">
                  {t.subtitle}
                </p>
                
                <div className="space-y-4">
                  {[t.feature1, t.feature2, t.feature3, t.feature4].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-violet-600 dark:text-[#B899FF]" />
                      </div>
                      <span className="text-gray-700 dark:text-[#F5F5F5] font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#141A22] border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-xl">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.premiumPlan}</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{t.price}</span>
                    <span className="text-gray-500 dark:text-[#8A94A0] mb-1">{t.period}</span>
                  </div>
                </div>

                {isPremium ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-2xl p-6 text-center">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                    <h4 className="font-semibold text-green-900 dark:text-green-400 mb-1">{t.activePlan}</h4>
                    <p className="text-sm text-green-700 dark:text-green-500/80">{t.activePlanDesc}</p>
                  </div>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-semibold transition-all shadow-[0_8px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_8px_25px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t.processing}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        {t.subscribeNow}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
