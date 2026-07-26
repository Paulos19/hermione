import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const code = (await params).code;

    const shareCode = await prisma.bookShareCode.findUnique({
      where: { code },
      include: { 
        book: { 
          select: { 
            title: true, 
            coverImage: true,
            user: {
              select: {
                name: true
              }
            }
          } 
        } 
      }
    });

    if (!shareCode) {
      return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 404 });
    }

    return NextResponse.json({ 
      bookTitle: shareCode.book.title,
      coverImage: shareCode.book.coverImage,
      ownerName: shareCode.book.user.name,
      permissions: shareCode.permissions
    });
  } catch (error: any) {
    console.error("Get share code error:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
