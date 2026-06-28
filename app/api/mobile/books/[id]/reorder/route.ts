import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const body = await request.json()
    const { documentIds } = body // Array of document IDs in the new order

    if (!Array.isArray(documentIds)) {
      return NextResponse.json({ error: "Formato inválido." }, { status: 400 })
    }

    // Update each document's order within a transaction
    const updatePromises = documentIds.map((docId, index) => {
      return prisma.document.update({
        where: { id: docId, bookId: id, userId: user.id },
        data: { order: index },
      })
    })

    await prisma.$transaction(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro na reordenação", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
