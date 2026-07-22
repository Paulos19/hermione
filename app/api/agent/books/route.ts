import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId é obrigatório" }, { status: 400 })
    }

    // Find the session to identify the user
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { userId: true }
    })

    if (!session) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
    }

    // Fetch user's books along with lore (characters and notes)
    const books = await prisma.book.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        title: true,
        synopsis: true,
        summary: true,
        characters: {
          select: {
            name: true,
            role: true,
            description: true
          }
        },
        notes: {
          select: {
            title: true,
            content: true
          }
        }
      }
    })

    return NextResponse.json({ books })
  } catch (error) {
    console.error("Erro na rota agent/books:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
