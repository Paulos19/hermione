import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"
import { formatarRespostaN8N } from "@/lib/n8nParser"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const { sessionId, content } = await request.json()

    if (!sessionId || !content) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 })
    }

    // Verify session ownership
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Sessão não encontrada ou negada." }, { status: 403 })
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "user",
        content,
      },
    })

    let assistantReply = "Desculpe, ocorreu um erro de conexão com o cérebro da Hermione. Tente novamente."

    try {
      const webhookResponse = await fetch("https://n8n-n8n.qqfurw.easypanel.host/webhook/hermione", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, sessionId }),
        signal: AbortSignal.timeout(30000),
      })

      if (webhookResponse.ok) {
        const data = await webhookResponse.json()
        assistantReply = formatarRespostaN8N(data)
      } else {
        console.error("n8n webhook error status:", webhookResponse.status)
      }
    } catch (error) {
      console.error("Erro ao chamar n8n webhook:", error)
    }

    // Save assistant message
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "assistant",
        content: assistantReply,
      },
    })

    // Update title if it's the first message
    if (session.title === "Nova Conversa") {
      const newTitle = content.length > 25 ? content.substring(0, 25) + "..." : content
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: newTitle },
      })
    }

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error("Chat mobile error:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
