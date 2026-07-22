import React, { useState, useEffect, useRef } from "react"
import { useChatWebSocket } from "@/app/hooks/useChatWebSocket"
import ReactMarkdown from "react-markdown"
import { X, Send, Sparkles } from "lucide-react"
import { criarSessaoAction } from "@/app/actions/chat"
import { checkAndIncrementAiCallsAction } from "@/app/actions/limits"
import { dict } from "@/lib/dictionaries"
import { Locale as Language } from "@/lib/i18n-config"

interface Message {
  id: string
  role: string
  content: string
  createdAt: Date
}

interface AssistantSidebarProps {
  wsToken: string
  documentContext: string
  onClose: () => void
  lang: Language
  isPremium: boolean
  onApplyEdit?: (before: string, after: string) => void
  bookId?: string
}

const CorrectionUI = ({ content, onApply, isFinished }: { content: string, onApply: (b: string, a: string) => void, isFinished?: boolean }) => {
  try {
    let cleanStr = content
      .replace(/```(?:undefined)?/g, '')
      .replace(/undefined$/, '')
      .trim();
      
    if (!cleanStr.startsWith('{')) cleanStr = '{' + cleanStr;
    if (!cleanStr.endsWith('}')) cleanStr = cleanStr + '}';

    const data = JSON.parse(cleanStr);
    if (!data.before || !data.after) throw new Error();
    return (
      <div className="my-4 border border-violet-200 dark:border-white/10 rounded-lg overflow-hidden bg-[var(--theme-bg-surface)] shadow-sm">
        <div className="bg-[var(--theme-bg-surface-elevated)] px-3 py-2 text-xs font-semibold text-[var(--theme-accent)] border-b border-[var(--theme-border-subtle)] flex justify-between items-center">
          <span>Sugestão de Hermione</span>
          <button 
            onClick={() => onApply(data.before, data.after)}
            className="px-3 py-1 bg-[var(--theme-accent)] hover:opacity-90 text-[var(--theme-bg-main)] rounded-md text-[10px] transition-colors font-bold"
          >
            Aplicar
          </button>
        </div>
        <div className="p-3 text-xs font-mono space-y-2 leading-relaxed">
          <div className="text-red-500 line-through bg-[var(--theme-bg-surface-elevated)] p-2 rounded border border-[var(--theme-border-subtle)]">{data.before}</div>
          <div className="text-emerald-500 bg-[var(--theme-bg-surface-elevated)] p-2 rounded border border-[var(--theme-border-subtle)]">{data.after}</div>
          {data.explanation && <div className="text-[var(--theme-text-muted)] font-sans text-[11px] pt-1 whitespace-pre-wrap break-words">{data.explanation}</div>}
        </div>
      </div>
    );
  } catch (e) {
    if (!isFinished) {
      return (
        <div className="my-4 animate-pulse bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] p-4 rounded-lg text-xs text-[var(--theme-text-muted)] flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-violet-400 animate-spin" />
          Gerando sugestão...
        </div>
      );
    } else {
      return (
        <div className="my-4 p-3 bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-lg text-xs text-red-500 font-mono whitespace-pre-wrap">
          <p className="font-semibold mb-2">Erro ao ler sugestão da IA:</p>
          {content}
        </div>
      );
    }
  }
}



export default function AssistantSidebar({ wsToken, documentContext, onClose, lang, isPremium, onApplyEdit, bookId }: AssistantSidebarProps) {
  const t = dict[lang].assistant;
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [systemMessage, setSystemMessage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  
  // Real session ID for database validation
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    criarSessaoAction()
      .then((id) => setSessionId(id))
      .catch((err) => console.error("Failed to create assistant session:", err))
  }, [])

  const { isConnected, sendChatMessage } = useChatWebSocket(
    sessionId,
    wsToken,
    (msg) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;
        
        // Clean any "undefined" that might come from the n8n webhook concatenation
        const cleanContent = typeof msg.content === 'string' 
          ? msg.content.replace(/undefined/g, '').trim() 
          : msg.content;
          
        return [...prev, { ...msg, content: cleanContent, createdAt: new Date(msg.createdAt || Date.now()) }];
      });
      setIsSending(false);
      setSystemMessage(null);
    },
    (sysMsg) => {
      setSystemMessage(sysMsg);
    },
    (errMsg) => {
      console.error("WS Error:", errMsg);
      setIsSending(false);
      setSystemMessage(null);
    }
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, systemMessage])

  const [showLimitModal, setShowLimitModal] = useState(false)

  // We no longer block the entire sidebar if !isPremium, instead we check the limit dynamically

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending || !isConnected) return

    const messageText = input.trim()

    setIsSending(true)

    try {
      // Limit Check
      await checkAndIncrementAiCallsAction()
    } catch (err: any) {
      setIsSending(false)
      if (err.message === "LIMIT_REACHED") {
        setShowLimitModal(true)
      } else {
        console.error(err)
      }
      return
    }

    setInput("")
    const tempId = Date.now().toString()
    setMessages((prev) => [...prev, {
      id: tempId,
      role: "user",
      content: messageText,
      createdAt: new Date(),
    }])

    try {
      // Inject document context if it's the first message or occasionally.
      // For MVP, we prefix the hidden context to the first message sent.
      const isFirstMessage = messages.length === 0;
      let finalMessage = messageText;
      if (isFirstMessage) {
         finalMessage = `[SYSTEM CONTEXT: The user is writing a document. Current text: "${documentContext.substring(0, 3000)}..."]

IMPORTANT INSTRUCTION: Se você for sugerir uma correção específica no texto, retorne a sugestão usando EXATAMENTE o seguinte formato JSON dentro de um bloco markdown com a linguagem 'correction':
\`\`\`correction
{
  "before": "texto original exato a ser substituído",
  "after": "texto corrigido",
  "explanation": "motivo da correção"
}
\`\`\`
Lembre-se: O campo 'before' deve ser IDENTICO ao texto que está no documento. NÃO use reticências (...) para encurtar. NÃO inclua NADA ALÉM DO JSON DENTRO DO BLOCO DE CÓDIGO.

User Question: ${messageText}`;
      }
      sendChatMessage(finalMessage, bookId);
    } catch (err) {
      console.error(err)
      setIsSending(false)
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[360px] md:relative md:w-[360px] bg-[var(--theme-bg-surface)] border-l border-[var(--theme-border-subtle)] flex flex-col h-full shrink-0 text-[var(--theme-text-main)] shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="h-[56px] border-b border-[var(--theme-border-subtle)] flex items-center justify-between px-4 bg-[var(--theme-bg-surface-elevated)] shrink-0 transition-colors duration-200">
        <div className="flex items-center gap-2 font-medium text-[var(--theme-accent)]">
          <Sparkles className="w-4 h-4" />
          {t.title}
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-[var(--theme-border-subtle)] rounded-md transition-colors text-[var(--theme-text-muted)]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <Sparkles className="w-8 h-8 text-[var(--theme-accent)] mb-3" />
            <h3 className="text-[var(--theme-text-main)] font-medium text-sm mb-1">{t.emptyState.title}</h3>
            <p className="text-xs text-[var(--theme-text-muted)]">{t.emptyState.description}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start w-full"}`}>
              {msg.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm bg-[var(--theme-accent)] text-[var(--theme-bg-main)] rounded-tr-sm">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : (
                <div className="w-full text-sm py-2">
                  <div className="flex items-center gap-2 mb-3 text-[var(--theme-accent)]">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium text-xs tracking-wide uppercase">Hermione</span>
                  </div>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none text-[var(--theme-text-main)]">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                          code: ({ className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '')
                            if (match && match[1] === 'correction') {
                              return <CorrectionUI content={String(children)} onApply={onApplyEdit || (() => {})} isFinished={true} />
                            }
                            return <code className="bg-[var(--theme-bg-surface-elevated)] px-1 py-0.5 rounded text-[var(--theme-accent)]">{children}</code>
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {(isSending || systemMessage) && (
           <div className="flex justify-start">
             <div className="bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
               {systemMessage ? (
                 <span className="text-xs text-[var(--theme-text-muted)]">{systemMessage}</span>
               ) : (
                 <>
                   <span className="w-1.5 h-1.5 bg-[var(--theme-text-muted)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                   <span className="w-1.5 h-1.5 bg-[var(--theme-text-muted)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                   <span className="w-1.5 h-1.5 bg-[var(--theme-text-muted)] rounded-full animate-bounce" />
                 </>
               )}
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--theme-border-subtle)] bg-[var(--theme-bg-surface-elevated)] shrink-0 transition-colors duration-200">
        <form onSubmit={handleSendMessage}>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border-subtle)] rounded-lg pl-3 pr-10 py-2.5 text-sm text-[var(--theme-text-main)] placeholder-[var(--theme-text-muted)] focus:outline-none focus:border-[var(--theme-accent)] transition-all"
              disabled={isSending || !isConnected}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending || !isConnected}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--theme-accent)] hover:bg-[var(--theme-bg-surface)] rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
              title={t.generate}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </aside>

    {showLimitModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[var(--theme-accent-light)] text-[var(--theme-accent)] rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[var(--theme-text-main)] mb-2">Limite Alcançado</h3>
          <p className="text-sm text-[var(--theme-text-muted)] mb-6">
            Você atingiu o limite de 7 chamadas grátis da IA Hermione. Assine o plano Premium para continuar recebendo sugestões ilimitadas.
          </p>
          <div className="flex w-full gap-3">
            <button 
              onClick={() => setShowLimitModal(false)}
              className="flex-1 px-4 py-2.5 rounded-xl text-[var(--theme-text-muted)] hover:bg-[var(--theme-bg-surface-elevated)] font-medium transition-colors"
            >
              Cancelar
            </button>
            <a 
              href={`/${lang}/subscribe`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--theme-accent)] hover:opacity-90 text-[var(--theme-bg-main)] font-medium transition-colors"
            >
              Fazer Upgrade
            </a>
          </div>
        </div>
      </div>
    )}
    </>
  )
}



