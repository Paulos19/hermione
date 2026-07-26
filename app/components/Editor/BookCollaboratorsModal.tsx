"use client"

import { useState, useEffect, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Copy, Users, Loader2, Trash2, Power, PowerOff, UserPlus } from "lucide-react"
import { toast } from "sonner"
import {
  generateShareCodeAction,
  getBookCollaboratorsAction,
  toggleCollaboratorAccessAction,
  deleteShareCodeAction
} from "@/app/actions/collaboration"

export function BookCollaboratorsModal({ 
  bookId, 
  isOpen, 
  onClose,
  isOwner
}: { 
  bookId: string; 
  isOpen: boolean; 
  onClose: () => void;
  isOwner: boolean;
}) {
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [shareCodes, setShareCodes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const loadData = async () => {
    setIsLoading(true)
    const res = await getBookCollaboratorsAction(bookId)
    if (res.success) {
      setCollaborators(res.collaborators || [])
      setShareCodes(res.shareCodes || [])
    } else {
      toast.error("Erro ao carregar colaboradores")
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (isOpen && isOwner) {
      loadData()
    }
  }, [isOpen, isOwner])

  const handleGenerateCode = (permission: string) => {
    startTransition(async () => {
      const res = await generateShareCodeAction(bookId, [permission])
      if (res.success) {
        toast.success("Código gerado!")
        loadData()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Código copiado!")
  }

  const handleToggleAccess = (collabId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleCollaboratorAccessAction(collabId, !currentStatus)
      if (res.success) {
        toast.success("Acesso alterado!")
        loadData()
      } else {
        toast.error(res.error)
      }
    })
  }

  const handleDeleteCode = (codeId: string) => {
    startTransition(async () => {
      const res = await deleteShareCodeAction(codeId)
      if (res.success) {
        toast.success("Código deletado!")
        loadData()
      } else {
        toast.error(res.error)
      }
    })
  }

  if (!isOwner) return null;

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
            className="relative bg-[var(--theme-bg-surface)] border border-[var(--theme-border-subtle)] rounded-3xl p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-6 max-h-[80vh] overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[var(--theme-text-muted)] hover:text-white bg-[var(--theme-bg-surface-elevated)] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-[var(--theme-accent)]" />
                Escritor Colaborativo
              </h2>
              <p className="text-sm text-[var(--theme-text-muted)]">
                Gerencie quem tem acesso ao seu livro e crie novos códigos de convite.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
              
              {/* Gerar Códigos */}
              <section>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Gerar Convite
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleGenerateCode("READ")}
                    disabled={isPending}
                    className="flex-1 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] hover:border-[var(--theme-accent)] text-white py-2 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    Leitor (Somente Leitura)
                  </button>
                  <button
                    onClick={() => handleGenerateCode("WRITE")}
                    disabled={isPending}
                    className="flex-1 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] border border-[var(--theme-accent)]/30 hover:bg-[var(--theme-accent)] hover:text-white py-2 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    Co-Autor (Escrita)
                  </button>
                </div>
              </section>

              {/* Códigos Ativos */}
              <section>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Códigos Ativos</h3>
                {isLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-[var(--theme-accent)]" /></div>
                ) : shareCodes.length > 0 ? (
                  <div className="space-y-2">
                    {shareCodes.map(code => (
                      <div key={code.id} className="flex items-center justify-between bg-[var(--theme-bg-main)] p-3 rounded-xl border border-[var(--theme-border-subtle)]">
                        <div>
                          <p className="font-mono text-white font-bold tracking-widest">{code.code}</p>
                          <p className="text-xs text-[var(--theme-text-muted)]">
                            Permissão: {code.permissions.includes("WRITE") ? "Escrita" : "Leitura"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleCopy(code.code)} className="p-2 bg-[var(--theme-bg-surface-elevated)] rounded-lg hover:text-white text-[var(--theme-text-muted)]">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteCode(code.id)} disabled={isPending} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--theme-text-muted)]">Nenhum código ativo.</p>
                )}
              </section>

              {/* Colaboradores */}
              <section>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Colaboradores</h3>
                {isLoading ? (
                  <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-[var(--theme-accent)]" /></div>
                ) : collaborators.length > 0 ? (
                  <div className="space-y-2">
                    {collaborators.map(collab => (
                      <div key={collab.id} className={`flex items-center justify-between p-3 rounded-xl border ${collab.isActive ? 'bg-[var(--theme-bg-main)] border-[var(--theme-border-subtle)]' : 'bg-red-500/5 border-red-500/10'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--theme-bg-surface-elevated)] flex items-center justify-center overflow-hidden">
                            {collab.user.image ? <img src={collab.user.image} className="w-full h-full object-cover" /> : <UserPlus className="w-5 h-5 text-[var(--theme-text-muted)]" />}
                          </div>
                          <div>
                            <p className={`font-semibold ${collab.isActive ? 'text-white' : 'text-[var(--theme-text-muted)] line-through'}`}>{collab.user.name}</p>
                            <p className="text-xs text-[var(--theme-text-muted)]">
                              {collab.permissions.includes("WRITE") ? "Leitura/Escrita" : "Apenas Leitura"}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleToggleAccess(collab.id, collab.isActive)}
                          disabled={isPending}
                          className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${collab.isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                        >
                          {collab.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          {collab.isActive ? "Desligar Acesso" : "Religar"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--theme-text-muted)]">Ninguém acessou este livro ainda.</p>
                )}
              </section>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
