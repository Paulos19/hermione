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
}

export default function AssistantSidebar({ wsToken, documentContext, onClose, lang }: AssistantSidebarProps) {
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
        return [...prev, { ...msg, createdAt: new Date(msg.createdAt || Date.now()) }];
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isSending, systemMessage])

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
         finalMessage = `[SYSTEM CONTEXT: The user is writing a document. Current text: "${documentContext.substring(0, 3000)}..."]\n\nUser Question: ${messageText}`;
      }
      sendChatMessage(finalMessage);
    } catch (err) {
      console.error(err)
      setIsSending(false)
    }
  }

  return (
    <aside className="w-[360px] bg-white dark:bg-white dark:bg-[#10151B] border-l border-gray-200 dark:border-gray-200 dark:border-white/5 flex flex-col h-full shrink-0 text-gray-900 dark:text-gray-900 dark:text-[#F5F5F5] z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="h-[56px] border-b border-gray-200 dark:border-gray-200 dark:border-white/5 flex items-center justify-between px-4 bg-[#11161D]">
        <div className="flex items-center gap-2 font-medium text-[#B899FF]">
          <Sparkles className="w-4 h-4" />
          {t.title}
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-gray-500 dark:text-gray-500 dark:text-[#8A94A0]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <Sparkles className="w-8 h-8 text-[#B899FF]/50 mb-3" />
            <h3 className="text-gray-900 dark:text-gray-900 dark:text-[#F5F5F5] font-medium text-sm mb-1">{t.emptyState.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-500 dark:text-[#8A94A0]">{t.emptyState.description}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                msg.role === "user" 
                  ? "bg-[#B899FF] text-[#0A0D12] rounded-tr-sm" 
                  : "bg-gray-100 dark:bg-gray-100 dark:bg-white/5 border border-white/10 text-gray-900 dark:text-gray-900 dark:text-[#F5F5F5] rounded-tl-sm"
              }`}>
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        code: ({ children }) => <code className="bg-black/30 px-1 py-0.5 rounded text-[#B899FF]">{children}</code>
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {(isSending || systemMessage) && (
           <div className="flex justify-start">
             <div className="bg-gray-100 dark:bg-gray-100 dark:bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
               {systemMessage ? (
                 <span className="text-xs text-gray-500 dark:text-gray-500 dark:text-[#8A94A0]">{systemMessage}</span>
               ) : (
                 <>
                   <span className="w-1.5 h-1.5 bg-[#8A94A0] rounded-full animate-bounce [animation-delay:-0.3s]" />
                   <span className="w-1.5 h-1.5 bg-[#8A94A0] rounded-full animate-bounce [animation-delay:-0.15s]" />
                   <span className="w-1.5 h-1.5 bg-[#8A94A0] rounded-full animate-bounce" />
                 </>
               )}
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-200 dark:border-white/5 bg-[#11161D]">
        <form onSubmit={handleSendMessage}>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-gray-100 dark:bg-gray-100 dark:bg-white/5 border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm text-gray-900 dark:text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-gray-400 dark:placeholder-[#8A94A0] focus:outline-none focus:border-[#B899FF] transition-all"
              disabled={isSending || !isConnected}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending || !isConnected}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#B899FF] hover:bg-[#B899FF]/10 rounded-md transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
              title={t.generate}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </aside>
  )
}



