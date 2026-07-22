"use client"

import React, { useState, useEffect, useRef, useTransition } from "react"
import {
  criarSessaoAction,
  deletarSessaoAction,
  carregarMensagensAction
} from "@/app/actions/chat"
import { checkAndIncrementAiCallsAction } from "@/app/actions/limits"
import { useChatWebSocket } from "@/app/hooks/useChatWebSocket"

import ChatSidebar from "./Chat/ChatSidebar"
import ChatTopbar from "./Chat/ChatTopbar"
import ChatMessage from "./Chat/ChatMessage"
import ChatComposer from "./Chat/ChatComposer"
import ChatEmptyState from "./Chat/ChatEmptyState"

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
        // Optimistic update protection
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
  }, [messages, isSending, systemMessage])

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
          title: "New Conversation",
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

  const [showLimitModal, setShowLimitModal] = useState(false)

  // Handle message send
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || !activeSessionId || isSending || !isConnected) return

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

    // Optimistic update
    const tempId = Date.now().toString();
    const tempUserMessage: Message = {
      id: tempId,
      role: "user",
      content: messageText,
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, tempUserMessage])

    try {
      sendChatMessage(messageText);

      // Update session title locally if it was the first message
      const activeSession = sessions.find((s) => s.id === activeSessionId)
      if (activeSession && activeSession.title === "New Conversation") {
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
    <div className="flex h-screen w-screen bg-[#0A0D12] text-[#F5F5F5] overflow-hidden font-sans">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        currentUser={currentUser}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        isPending={isPending}
        isLoadingMessages={isLoadingMessages}
      />

      <main className="flex-1 flex flex-col h-full bg-[#11161D] relative">
        <ChatTopbar
          title={sessions.find(s => s.id === activeSessionId)?.title}
          isConnected={isConnected}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-12 py-8 flex flex-col items-center custom-scrollbar">
          <div className="w-full max-w-[920px] flex flex-col gap-10">
            {!activeSessionId ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
                <ChatEmptyState />
              </div>
            ) : isLoadingMessages ? (
              <div className="w-full flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#B899FF] animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
                <ChatEmptyState />
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage key={msg.id} id={msg.id} role={msg.role} content={msg.content} />
              ))
            )}

            {/* Typing Indicator */}
            {(isSending || systemMessage) && (
              <div className="flex w-full justify-start mt-[-20px] mb-8">
                <div className="bg-[#141A22] border border-white/5 rounded-[18px] rounded-bl-sm px-6 py-4 flex items-center gap-2 text-[#8A94A0] text-[15px] shadow-sm">
                  {systemMessage || (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#8A94A0] rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-[#8A94A0] rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-[#8A94A0] rounded-full animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-[20px]" />
          </div>
        </div>

        {activeSessionId && (
          <ChatComposer
            input={input}
            setInput={setInput}
            onSendMessage={handleSendMessage}
            isSending={isSending}
          />
        )}
      </main>

      {showLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--theme-bg-surface-elevated)] border border-[var(--theme-border)] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--theme-accent-light)] text-[var(--theme-accent)] rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--theme-text-main)] mb-2">Limite Alcançado</h3>
            <p className="text-sm text-[var(--theme-text-muted)] mb-6">
              Você atingiu o limite de 7 chamadas grátis da IA Hermione. Assine o plano Premium para continuar conversando.
            </p>
            <div className="flex w-full gap-3">
              <button 
                onClick={() => setShowLimitModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-[var(--theme-text-muted)] hover:bg-gray-100 dark:hover:bg-white/5 font-medium transition-colors"
              >
                Cancelar
              </button>
              <a 
                href={`/pt/subscribe`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
              >
                Fazer Upgrade
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
