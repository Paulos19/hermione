import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const code = (await params).code;

    const shareCode = await prisma.bookShareCode.findUnique({
      where: { code },
      include: { book: { select: { title: true, userId: true } } }
    });

    if (!shareCode) {
      return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 404 });
    }

    if (shareCode.book.userId === user.id) {
      return NextResponse.json({ error: "Você já é o dono deste livro" }, { status: 400 });
    }

    const existingCollab = await prisma.bookCollaborator.findUnique({
      where: {
        bookId_userId: {
          bookId: shareCode.bookId,
          userId: user.id,
        }
      }
    });

    if (existingCollab && !existingCollab.isActive) {
      return NextResponse.json({ error: "Seu acesso a este livro foi revogado pelo proprietário." }, { status: 403 });
    }

    const collaborator = await prisma.bookCollaborator.upsert({
      where: {
        bookId_userId: {
          bookId: shareCode.bookId,
          userId: user.id,
        }
      },
      update: {
        permissions: shareCode.permissions,
      },
      create: {
        bookId: shareCode.bookId,
        userId: user.id,
        permissions: shareCode.permissions,
        isActive: true
      }
    });

    // Notify the owner
    try {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
      const httpUrl = wsUrl.replace('ws://', 'http://').replace('wss://', 'https://');
      const axios = (await import("axios")).default;
      
      await axios.post(`${httpUrl}/api/notify`, {
        targetUserId: shareCode.book.userId,
        message: `${dbUser?.name || 'Um novo escritor'} acessou o livro "${shareCode.book.title}".`,
        type: 'collaborator_joined',
        bookId: shareCode.bookId
      });
    } catch(e) {
      console.error("Failed to notify owner", e);
    }

    return NextResponse.json({ success: true, bookId: shareCode.bookId })
  } catch (error: any) {
    console.error("Join book error:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
