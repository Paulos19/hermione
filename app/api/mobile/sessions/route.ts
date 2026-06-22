import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const sessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const chatSession = await prisma.chatSession.create({
      data: {
        userId: user.id,
        title: "Nova Conversa",
      },
    })

    return NextResponse.json({ session: chatSession }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
