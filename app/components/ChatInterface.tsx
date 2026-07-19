"use client"

import React, { useState, useEffect, useRef, useTransition } from "react"
import {
  criarSessaoAction,
  deletarSessaoAction,
  carregarMensagensAction
} from "@/app/actions/chat"
import { logoutAction } from "@/app/actions/auth"
import { useChatWebSocket } from "@/app/hooks/useChatWebSocket"
import Link from "next/link"
import ReactMarkdown from "react-markdown"

interface User {
  id: string
  name: string | null
  email: string
}

interface Session {
  id: string
  title: string
  createdAt: Date
}

interface Message {
  id: string
  role: string
  content: string
  createdAt: Date
}

interface ChatInterfaceProps {
  initialSessions: Session[]
  currentUser: User
  wsToken: string
}

export default function ChatInterface({ initialSessions, currentUser, wsToken }: ChatInterfaceProps) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [systemMessage, setSystemMessage] = useState<string | null>(null)
  
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Configura WebSocket
  const { isConnected, sendChatMessage } = useChatWebSocket(
    activeSessionId,
    wsToken,
    (msg) => {
      // Quando recebe mensagem via WebSocket
      setMessages((prev) => {
        // Se a mensagem já existe (optimistic update), não duplica
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

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, isSending])

  // Load messages when active session changes
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      setIsLoadingMessages(true)
      try {
        const msgs = await carregarMensagensAction(activeSessionId)
        setMessages(msgs)
      } catch (err) {
        console.error("Erro ao carregar mensagens:", err)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    loadMessages()
  }, [activeSessionId])

  // Handle New Session creation
  const handleNewSession = () => {
    startTransition(async () => {
      try {
        const newId = await criarSessaoAction()
        const newSession: Session = {
          id: newId,
          title: "Nova Conversa",
          createdAt: new Date(),
        }
        setSessions([newSession, ...sessions])
        setActiveSessionId(newId)
      } catch (err) {
        console.error("Erro ao criar conversa:", err)
      }
    })
  }

  // Handle Session deletion
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    startTransition(async () => {
      try {
        await deletarSessaoAction(id)
        setSessions(sessions.filter((s) => s.id !== id))
        if (activeSessionId === id) {
          setActiveSessionId(null)
        }
      } catch (err) {
        console.error("Erro ao deletar conversa:", err)
      }
    })
  }

  // Handle message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !activeSessionId || isSending || !isConnected) return

    const messageText = input.trim()
    setInput("")

    // Optimistic update
    const tempId = Date.now().toString();
    const tempUserMessage: Message = {
      id: tempId,
      role: "user",
      content: messageText,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, tempUserMessage])
    setIsSending(true)

    try {
      // Envia via WebSocket em vez de Server Action
      sendChatMessage(messageText);

      // Update session title locally if it was the first message
      const activeSession = sessions.find((s) => s.id === activeSessionId)
      if (activeSession && activeSession.title === "Nova Conversa") {
        const newTitle = messageText.length > 25 ? messageText.substring(0, 25) + "..." : messageText
        setSessions(
          sessions.map((s) => (s.id === activeSessionId ? { ...s, title: newTitle } : s))
        )
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err)
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-zinc-800 bg-zinc-900/30 backdrop-blur-xl flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-pulse shadow-md shadow-indigo-500/30" />
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Hermione AI
            </span>
          </div>
        </div>

        {/* New chat button */}
        <div className="p-4">
          <button
            onClick={handleNewSession}
            disabled={isPending}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Conversa
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              Nenhuma conversa iniciada
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId
              return (
                <div
                  key={s.id}
                  onClick={() => !isLoadingMessages && setActiveSessionId(s.id)}
                  className={`group relative flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-zinc-800 text-white border border-zinc-700/50"
                      : "hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden pr-8">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="text-sm font-medium truncate">{s.title}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSession(s.id, e)}
                    className="absolute right-3 opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 rounded transition-opacity duration-200"
                    title="Deletar conversa"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Profile Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between gap-3">
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-zinc-200 truncate">
              {currentUser.name || "Usuário"}
            </p>
            <p className="text-xs text-zinc-500 truncate">{currentUser.email}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/configuracoes"
              className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
              title="Configurações de RAG"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                title="Sair"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Chat Panel */}
      <main className="flex-1 flex flex-col h-full bg-zinc-950 relative">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        {!activeSessionId ? (
          /* Empty / Welcome State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-8 transform rotate-3">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-3">
              Converse com a Hermione
            </h2>
            <p className="text-zinc-400 max-w-md mb-8">
              Inicie uma nova conversa para experimentar a inteligência da Hermione enriquecida com RAG e memória persistente em Redis.
            </p>

            <button
              onClick={handleNewSession}
              disabled={isPending}
              className="py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              Começar conversa &rarr;
            </button>
          </div>
        ) : (
          /* Active Chat State */
          <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
            {/* Header */}
            <header className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                    {sessions.find((s) => s.id === activeSessionId)?.title}
                    <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} title={isConnected ? "Sincronizado" : "Desconectado"} />
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Powered by Hermione AI & n8n
                  </p>
                </div>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="animate-spin h-8 w-8 text-indigo-500"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-zinc-500 text-sm font-medium">Carregando conversa...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                  Envie sua primeira mensagem para iniciar!
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === "user"
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-md leading-relaxed text-sm ${
                          isUser
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-zinc-900/60 backdrop-blur-md border border-zinc-800 text-zinc-200 rounded-bl-none w-full"
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="w-full">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-white bg-white/5 px-1 py-0.5 rounded">{children}</strong>,
                                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-zinc-300 mb-0.5 last:mb-0">{children}</li>,
                                code: ({ children }) => <code className="bg-zinc-950 px-1.5 py-0.5 rounded font-mono text-xs text-indigo-300 border border-zinc-800">{children}</code>,
                                pre: ({ children }) => <pre className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 my-3 overflow-x-auto text-xs font-mono">{children}</pre>,
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}

              {/* Typing indicator / System Message */}
              {(isSending || systemMessage) && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-2xl rounded-bl-none px-5 py-3.5 flex items-center gap-2 text-sm text-zinc-300">
                    {systemMessage || (
                      <>
                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                      </>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Envie uma mensagem para Hermione..."
                  disabled={isSending}
                  className="flex-1 px-4 py-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
