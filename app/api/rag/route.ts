import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { user: true },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const userRag = session.user.ragContext || "Nenhuma instrução ou contexto RAG adicional configurado pelo usuário no banco de dados."

    return NextResponse.json({
      user: {
        name: session.user.name,
        email: session.user.email,
      },
      ragContext: `Você é a Hermione, uma assistente virtual inteligente desenvolvida pela equipe da Google DeepMind. O usuário atual é o(a) ${session.user.name || "Visitante"} (${session.user.email}).
Aqui está o contexto RAG associado a este usuário recuperado do banco de dados:
---
${userRag}
---
Responda a todas as perguntas sempre em português do Brasil, de forma extremamente elegante, prestativa e objetiva. Use os dados dele quando apropriado.`,
    })
  } catch (error: any) {
    console.error("Erro na API RAG:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
