"use client"

import React, { useActionState } from "react"
import { salvarRagAction } from "@/app/actions/user"
import Link from "next/link"

interface ConfigFormProps {
  initialRag: string | null
}

const initialState: { success?: string; error?: string } = {
  success: undefined,
  error: undefined,
}

export default function ConfigForm({ initialRag }: ConfigFormProps) {
  const [state, formAction, isPending] = useActionState(salvarRagAction, initialState)

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-50 overflow-hidden px-4">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors duration-200 text-sm font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar ao Chat
        </Link>
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Configurações de RAG
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Defina o contexto, dados e regras personalizadas que serão injetados no prompt da Hermione.
          </p>
        </div>

        {/* State Banners */}
        {state?.success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {state.success}
          </div>
        )}

        {state?.error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="ragContext" className="text-sm font-semibold text-zinc-300 block">
              Contexto do Usuário (RAG)
            </label>
            <textarea
              id="ragContext"
              name="ragContext"
              defaultValue={initialRag || ""}
              placeholder="Ex: O usuário se chama Paulo, é desenvolvedor e prefere respostas rápidas e sem rodeios. Hermione deve tratá-lo por 'Mestre' e adicionar um toque de humor nerd..."
              rows={10}
              className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 text-sm font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/"
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-xl border border-zinc-700 transition-colors duration-200 text-sm active:scale-[0.98]"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 active:scale-[0.98] text-sm disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Salvando..." : "Salvar Configurações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
