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
    const { sessionId, content, bookId } = await request.json()

    if (!sessionId || !content) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 })
    }

    // DEMO BYPASS for Landing Page
    if (sessionId.startsWith("demo-")) {
      let assistantReply = "Desculpe, ocorreu um erro de conexão com o cérebro da Hermione. Tente novamente."
      try {
        const webhookUrl = process.env.N8N_WEBHOOK_URL || "https://n8n-n8n.khdya3.easypanel.host/webhook/hermione";
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            message: content, 
            sessionId,
            userName: "Visitante",
            ragContext: "Usuário testando a plataforma pela página inicial. Responda de forma sucinta e instigante para mostrar seu potencial."
          }),
          signal: AbortSignal.timeout(30000),
        })

        if (webhookResponse.ok) {
          const data = await webhookResponse.json()
          assistantReply = formatarRespostaN8N(data)
        }
      } catch (error) {
        console.error("Erro ao chamar n8n webhook na demo:", error)
      }

      return NextResponse.json({ message: { role: "assistant", content: assistantReply } })
    }

    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    // Verify session ownership and get user details
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { user: true }
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

    let enhancedRagContext = session.user.ragContext || "";

    // If bookId is provided, fetch Lore (Characters and Notes)
    if (bookId) {
      const book = await prisma.book.findUnique({
        where: { id: bookId, userId: user.id },
        include: { characters: true, notes: true }
      });

      if (book) {
        let loreContext = `\n\n--- INFORMAÇÕES DA HISTÓRIA (LIVRO: ${book.title}) ---\n`;
        
        if (book.synopsis) {
          loreContext += `\nSINOPSE DA HISTÓRIA:\n${book.synopsis}\n`;
        }

        if (book.summary) {
          loreContext += `\nRESUMO DA HISTÓRIA:\n${book.summary}\n`;
        }

        if (book.characters && book.characters.length > 0) {
          loreContext += "\nPERSONAGENS:\n";
          book.characters.forEach((c: any) => {
            loreContext += `- ${c.name} (${c.role || 'S/N'}): ${c.description || 'S/D'}\n`;
          });
        }

        if (book.notes && book.notes.length > 0) {
          loreContext += "\nNOTAS DE MUNDO (BÍBLIA):\n";
          book.notes.forEach((n: any) => {
            loreContext += `- ${n.title}: ${n.content || 'S/D'}\n`;
          });
        }
        
        enhancedRagContext += loreContext;
      }
    }

    try {
      const finalMessageToAI = enhancedRagContext 
        ? `[CONTEXTO DO SISTEMA E BÍBLIA DA HISTÓRIA (USE ESSAS INFORMAÇÕES OBRIGATORIAMENTE)]\n${enhancedRagContext}\n\n[MENSAGEM DO USUÁRIO]\n${content}`
        : content;

      const webhookUrl = process.env.N8N_WEBHOOK_URL || "https://n8n-n8n.khdya3.easypanel.host/webhook/hermione";
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: finalMessageToAI, 
          sessionId,
          userName: session.user.name,
          ragContext: enhancedRagContext
        }),
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
