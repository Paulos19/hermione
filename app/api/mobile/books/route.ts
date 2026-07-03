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

    const books = await prisma.book.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ books })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        _count: {
          select: { books: true }
        }
      }
    })

    if (!dbUser?.isPremium && dbUser?._count.books! >= 5) {
      return NextResponse.json({ error: "Limite de 5 projetos atingido no plano gratuito. Assine o premium para projetos ilimitados!" }, { status: 403 })
    }

    const body = await request.json()
    const { title, coverImage, securityType, pin } = body

    const book = await prisma.book.create({
      data: {
        userId: user.id,
        title: title || "Novo Livro",
        coverImage: coverImage || null,
        securityType: securityType || "none",
        pin: pin || null,
      },
    })

    return NextResponse.json({ book }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
