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

    const book = await prisma.book.findUnique({
      where: { id }
    })

    if (!book) {
      return NextResponse.json({ error: "Livro não encontrado." }, { status: 404 })
    }

    if (book.userId !== user.id) {
      return NextResponse.json({ error: "Apenas o dono pode gerenciar colaboradores." }, { status: 403 })
    }

    const collaborators = await prisma.bookCollaborator.findMany({
      where: { bookId: id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } }
      }
    })

    const shareCodes = await prisma.bookShareCode.findMany({
      where: { bookId: id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      collaborators,
      shareCodes
    })

  } catch (error) {
    console.error("Erro ao buscar colaboradores", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
