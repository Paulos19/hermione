import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

function generateRandomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const p1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `HERM-${p1}-${p2}`;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "ID do livro ausente." }, { status: 400 })
    }

    const body = await request.json()
    const permissions = body.permissions || ["READ"]

    const book = await prisma.book.findUnique({
      where: { id }
    })

    if (!book || book.userId !== user.id) {
      return NextResponse.json({ error: "Livro não encontrado ou sem permissão." }, { status: 403 })
    }

    const code = generateRandomCode();

    const shareCode = await prisma.bookShareCode.create({
      data: {
        bookId: id,
        code,
        permissions,
      },
    });

    return NextResponse.json({
      success: true,
      shareCode
    })

  } catch (error) {
    console.error("Erro ao gerar código de compartilhamento", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
