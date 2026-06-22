import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    // Await params as required in Next.js 15+ (if using Turbopack Next.js 16)
    const { id: sessionId } = await params

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
