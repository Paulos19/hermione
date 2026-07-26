"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, KeyRound, Loader2, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { getShareCodeInfoAction, joinBookByCodeAction } from "@/app/actions/collaboration"
import { useRouter } from "next/navigation"

export function JoinBookModal({ isOpen, onClose, lang }: { isOpen: boolean; onClose: () => void; lang: string }) {
  const [code, setCode] = useState("")
  const [isPending, startTransition] = useTransition()
  const [previewBook, setPreviewBook] = useState<any>(null)
  const router = useRouter()

  const handleSearchCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    startTransition(async () => {
      const res = await getShareCodeInfoAction(code.trim())
      if (res.success) {
        setPreviewBook(res)
      } else {
        toast.error(res.error || "Código inválido")
      }
    })
  }

  const handleJoin = async () => {
    startTransition(async () => {
      const res = await joinBookByCodeAction(code.trim())
      if (res.success) {
        toast.success("Acesso liberado!")
        router.push(`/${lang}/editor/${res.bookId}`)
        onClose()
      } else {
        toast.error(res.error || "Erro ao acessar livro")
      }
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-6"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] hover:text-white bg-[var(--theme-bg-surface-elevated)] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                <KeyRound className="w-6 h-6 text-[var(--theme-accent)]" />
                Resgatar Código
              </h2>
              <p className="text-sm text-[var(--theme-text-muted)]">
                Insira o código de compartilhamento para acessar o livro de outro autor.
              </p>
            </div>

            {!previewBook ? (
              <form onSubmit={handleSearchCode} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="HERM-XXXX-XXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-[var(--theme-bg-main)] border border-[var(--theme-border-subtle)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--theme-accent)] transition-colors uppercase tracking-widest text-center"
                />
                <button
                  type="submit"
                  disabled={isPending || code.length < 5}
                  className="w-full bg-[var(--theme-text-main)] text-[var(--theme-bg-main)] font-semibold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buscar Livro"}
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="bg-[var(--theme-bg-main)] rounded-2xl p-4 flex gap-4 border border-[var(--theme-border-subtle)]">
                  <div className="w-20 h-28 bg-[var(--theme-bg-surface-elevated)] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {previewBook.book.coverImage ? (
                      <img src={previewBook.book.coverImage} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-8 h-8 text-[var(--theme-text-muted)] opacity-50" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-xs text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">
                      Você foi convidado(a)
                    </p>
                    <h3 className="text-lg font-serif font-bold text-white leading-tight mb-1">
                      {previewBook.book.title}
                    </h3>
                    <p className="text-sm text-[var(--theme-text-muted)]">
                      Autor: {previewBook.book.user.name}
                    </p>
                    <div className="mt-2 text-xs font-semibold px-2 py-1 bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] rounded w-fit">
                      {previewBook.permissions.includes("WRITE") ? "Leitura e Escrita" : "Apenas Leitura"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleJoin}
                  disabled={isPending}
                  className="w-full bg-[var(--theme-accent)] text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Acessar Projeto"}
                </button>
                <button
                  onClick={() => { setPreviewBook(null); setCode("") }}
                  className="w-full text-sm text-[var(--theme-text-muted)] hover:text-white transition-colors"
                >
                  Tentar outro código
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
