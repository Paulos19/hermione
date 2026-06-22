"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { formatarRespostaN8N } from "@/lib/n8nParser"

export async function criarSessaoAction() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado.")
  }

  const chatSession = await prisma.chatSession.create({
    data: {
      userId: session.user.id,
      title: "Nova Conversa",
    },
  })

  revalidatePath("/")
  return chatSession.id
}

export async function deletarSessaoAction(sessionId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado.")
  }

  // Confirm ownership
  const existingSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  })

  if (!existingSession || existingSession.userId !== session.user.id) {
    throw new Error("Conversa não encontrada ou permissão negada.")
  }

  await prisma.chatSession.delete({
    where: { id: sessionId },
  })

  revalidatePath("/")
}

export async function enviarMensagemAction(sessionId: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado.")
  }

  // Create user message in DB
  const userMessage = await prisma.chatMessage.create({
    data: {
      sessionId,
      role: "user",
      content,
    },
  })

  let assistantReply = "Desculpe, ocorreu um erro de conexão com o cérebro da Hermione. Tente novamente."

  try {
    const response = await fetch("https://n8n-n8n.qqfurw.easypanel.host/webhook/hermione", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: content,
        sessionId,
      }),
      // Set a reasonable timeout so it doesn't hang forever
      signal: AbortSignal.timeout(30000),
    })

    if (response.ok) {
      const data = await response.json()
      assistantReply = formatarRespostaN8N(data)
    } else {
      console.error("n8n webhook error status:", response.status)
    }
  } catch (error) {
    console.error("Erro ao chamar n8n webhook:", error)
  }

  // Create assistant message in DB
  const assistantMessage = await prisma.chatMessage.create({
    data: {
      sessionId,
      role: "assistant",
      content: assistantReply,
    },
  })

  // If the session title is still the default, let's update it to the first few words of the user's message
  const chatSession = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  })

  if (chatSession && chatSession.title === "Nova Conversa") {
    const newTitle = content.length > 25 ? content.substring(0, 25) + "..." : content
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title: newTitle },
    })
  }

  revalidatePath("/")
  return assistantMessage
}

export async function carregarMensagensAction(sessionId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado.")
  }

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  })

  return messages
}
