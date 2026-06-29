import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

function getWordCount(content: string) {
  if (!content) return 0;
  try {
    const json = JSON.parse(content);
    let text = "";
    function extract(node: any) {
      if (node.type === "text" && node.text) {
        text += node.text + " ";
      } else if (node.content && Array.isArray(node.content)) {
        node.content.forEach(extract);
      }
    }
    extract(json);
    return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  } catch (e) {
    return content.trim().split(/\s+/).filter((w) => w.length > 0).length;
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const id = (await params).id;

    const document = await prisma.document.findUnique({
      where: { id },
      include: { book: true }
    })

    if (!document || document.userId !== user.id) {
      return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const id = (await params).id;
    const body = await request.json()
    
    // Only update allowed fields
    const dataToUpdate: any = {}
    if (body.title !== undefined) dataToUpdate.title = body.title
    if (body.wordGoal !== undefined) dataToUpdate.wordGoal = body.wordGoal
    if (body.customGoal !== undefined) dataToUpdate.customGoal = body.customGoal
    if (body.themeBgColor !== undefined) dataToUpdate.themeBgColor = body.themeBgColor
    if (body.themeBgImage !== undefined) dataToUpdate.themeBgImage = body.themeBgImage
    if (body.themeFontColor !== undefined) dataToUpdate.themeFontColor = body.themeFontColor
    if (body.themeToolbarColor !== undefined) dataToUpdate.themeToolbarColor = body.themeToolbarColor

    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document || document.userId !== user.id) {
      return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 })
    }

    if (body.content !== undefined) {
      dataToUpdate.content = body.content
      const newWordCount = getWordCount(body.content)
      dataToUpdate.wordCount = newWordCount
      
      const wordsDiff = newWordCount - (document.wordCount || 0)
      
      if (wordsDiff !== 0) {
        const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
        
        await prisma.dailyProgress.upsert({
          where: {
             userId_date: { userId: user.id, date: today }
          },
          update: {
             words: { increment: wordsDiff }
          },
          create: {
             userId: user.id,
             date: today,
             words: Math.max(0, wordsDiff)
          }
        })
      }
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: dataToUpdate,
    })

    return NextResponse.json({ document: updatedDocument })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const id = (await params).id;

    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document || document.userId !== user.id) {
      return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 })
    }

    await prisma.document.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
