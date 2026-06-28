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

    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const { bookId } = body

    let order = 0
    if (bookId) {
      const count = await prisma.document.count({
        where: { bookId, userId: user.id }
      })
      order = count
    }

    const document = await prisma.document.create({
      data: {
        userId: user.id,
        bookId: bookId || null,
        title: "Sem Título",
        order,
        content: JSON.stringify({
          type: "doc",
          content: [
            {
              type: "paragraph",
            },
          ],
        }),
      },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
