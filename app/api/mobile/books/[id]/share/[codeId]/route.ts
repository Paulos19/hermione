import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string, codeId: string }> }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const resolvedParams = await params
    const { id, codeId } = resolvedParams
    if (!id || !codeId) {
      return NextResponse.json({ error: "Parâmetros ausentes." }, { status: 400 })
    }

    const shareCode = await prisma.bookShareCode.findUnique({
      where: { id: codeId },
      include: { book: true }
    });

    if (!shareCode || shareCode.book.userId !== user.id || shareCode.bookId !== id) {
      return NextResponse.json({ error: "Sem permissão para deletar este código." }, { status: 403 })
    }

    await prisma.bookShareCode.delete({
      where: { id: codeId }
    });

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Erro ao deletar código de compartilhamento", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
