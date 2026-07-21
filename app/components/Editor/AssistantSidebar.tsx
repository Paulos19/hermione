import React, { useState, useEffect, useRef } from "react"
import { useChatWebSocket } from "@/app/hooks/useChatWebSocket"
import ReactMarkdown from "react-markdown"
import { X, Send, Sparkles } from "lucide-react"
import { criarSessaoAction } from "@/app/actions/chat"
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
      <div className="my-4 border border-violet-200 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-[#11161D] shadow-sm">
        <div className="bg-violet-50 dark:bg-white/5 px-3 py-2 text-xs font-semibold text-violet-700 dark:text-[#B899FF] border-b border-violet-200 dark:border-white/10 flex justify-between items-center">
          <span>Sugestão de Hermione</span>
          <button 
            onClick={() => onApply(data.before, data.after)}
            className="px-3 py-1 bg-violet-600 hover:bg-violet-700 dark:bg-[#B899FF] dark:hover:bg-[#a682ff] dark:text-[#0A0D12] text-white rounded-md text-[10px] transition-colors font-bold"
          >
            Aplicar
          </button>
        </div>
        <div className="p-3 text-xs font-mono space-y-2 leading-relaxed">
          <div className="text-red-600 dark:text-red-400 line-through bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-900/20">{data.before}</div>
          <div className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded border border-emerald-100 dark:border-emerald-900/20">{data.after}</div>
          {data.explanation && <div className="text-gray-500 dark:text-[#8A94A0] font-sans text-[11px] pt-1 whitespace-pre-wrap break-words">{data.explanation}</div>}
        </div>
      </div>
    );
  } catch (e) {
    if (!isFinished) {
      return (
        <div className="my-4 animate-pulse bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/10 p-4 rounded-lg text-xs text-gray-500 dark:text-[#8A94A0] flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-violet-400 animate-spin" />
          Gerando sugestão...
        </div>
      );
    } else {
      return (
        <div className="my-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg text-xs text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap">
          <p className="font-semibold mb-2">Erro ao ler sugestão da IA:</p>
          {content}
        </div>
      );
    }
  }
}



export default function AssistantSidebar({ wsToken, documentContext, onClose, lang, isPremium, onApplyEdit }: AssistantSidebarProps) {
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

  if (!isPremium) {
    return (
      <aside className="w-[380px] h-full bg-white dark:bg-[#10151B] border-l border-gray-200 dark:border-white/5 flex flex-col shrink-0">
        <div className="h-[56px] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-violet-600 dark:text-[#B899FF]">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-semibold">{t.title || "Hermione IA"}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500 dark:text-[#8A94A0]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center h-full gap-4">
          <Sparkles className="w-12 h-12 text-violet-600 dark:text-[#B899FF] opacity-50" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">Plano Premium Necessário</h3>
          <p className="text-gray-500 dark:text-[#8A94A0]">Assine o plano Premium para desbloquear a inteligência artificial da Hermione e aprimorar sua escrita.</p>
          <a href={`/${lang}/subscribe`} className="mt-4 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors">
            Assinar Agora
          </a>
        </div>
      </aside>
    )
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending || !isConnected) return

    const messageText = input.trim()
    setInput("")

    const tempId = Date.now().toString()
    setMessages((prev) => [...prev, {
      id: tempId,
      role: "user",
      content: messageText,
      createdAt: new Date(),
    }])
    setIsSending(true)

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
      sendChatMessage(finalMessage);
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

      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[360px] md:relative md:w-[360px] bg-white dark:bg-[#0A0D12] border-l border-gray-200 dark:border-white/5 flex flex-col h-full shrink-0 text-gray-900 dark:text-[#F5F5F5] shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="h-[56px] border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 bg-gray-50 dark:bg-[#11161D] shrink-0 transition-colors duration-200">
        <div className="flex items-center gap-2 font-medium text-violet-600 dark:text-[#B899FF]">
          <Sparkles className="w-4 h-4" />
          {t.title}
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition-colors text-gray-500 dark:text-[#8A94A0]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <Sparkles className="w-8 h-8 text-violet-400 dark:text-[#B899FF]/50 mb-3" />
            <h3 className="text-gray-900 dark:text-[#F5F5F5] font-medium text-sm mb-1">{t.emptyState.title}</h3>
            <p className="text-xs text-gray-500 dark:text-[#8A94A0]">{t.emptyState.description}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start w-full"}`}>
              {msg.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm bg-violet-600 text-white dark:bg-[#B899FF] dark:text-[#0A0D12] rounded-tr-sm">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : (
                <div className="w-full text-sm py-2">
                  <div className="flex items-center gap-2 mb-3 text-violet-600 dark:text-[#B899FF]">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium text-xs tracking-wide uppercase">Hermione</span>
                  </div>
                  {msg.role === "assistant" ? (
                    <div className="prose dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-[#F5F5F5]">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
                          code: ({ className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '')
                            if (match && match[1] === 'correction') {
                              return <CorrectionUI content={String(children)} onApply={onApplyEdit || (() => {})} isFinished={true} />
                            }
                            return <code className="bg-gray-200 dark:bg-black/30 px-1 py-0.5 rounded text-violet-700 dark:text-[#B899FF]">{children}</code>
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
             <div className="bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
               {systemMessage ? (
                 <span className="text-xs text-gray-500 dark:text-[#8A94A0]">{systemMessage}</span>
               ) : (
                 <>
                   <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-[#8A94A0] rounded-full animate-bounce [animation-delay:-0.3s]" />
                   <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-[#8A94A0] rounded-full animate-bounce [animation-delay:-0.15s]" />
                   <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-[#8A94A0] rounded-full animate-bounce" />
                 </>
               )}
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#11161D] shrink-0 transition-colors duration-200">
        <form onSubmit={handleSendMessage}>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#8A94A0] focus:outline-none focus:border-violet-500 dark:focus:border-[#B899FF] focus:ring-1 focus:ring-violet-500 dark:focus:ring-transparent transition-all"
              disabled={isSending || !isConnected}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending || !isConnected}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-violet-600 dark:text-[#B899FF] hover:bg-violet-50 dark:hover:bg-[#B899FF]/10 rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
              title={t.generate}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </aside>
    </>
  )
}



