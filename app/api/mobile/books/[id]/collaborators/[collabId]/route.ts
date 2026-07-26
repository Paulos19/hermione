import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"
import axios from "axios"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string, collabId: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const { id, collabId } = params
    if (!id || !collabId) {
      return NextResponse.json({ error: "Parâmetros ausentes." }, { status: 400 })
    }

    const body = await request.json()
    const { isActive } = body

    const collab = await prisma.bookCollaborator.findUnique({ 
      where: { id: collabId }, 
      include: { book: true } 
    });

    if (!collab || collab.book.userId !== user.id || collab.bookId !== id) {
      return NextResponse.json({ error: "Sem permissão para gerenciar este colaborador." }, { status: 403 })
    }

    await prisma.bookCollaborator.update({
      where: { id: collabId },
      data: { isActive }
    });

    if (!isActive) {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
        const httpUrl = wsUrl.replace('ws://', 'http://').replace('wss://', 'https://');
        
        await axios.post(`${httpUrl}/api/notify`, {
          targetUserId: collab.userId,
          message: `Seu acesso ao livro "${collab.book.title}" foi revogado.`,
          type: 'collaborator_removed',
          bookId: collab.bookId
        });
      } catch(e) {
        console.error("Failed to notify removed collaborator", e);
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Erro ao atualizar colaborador", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
