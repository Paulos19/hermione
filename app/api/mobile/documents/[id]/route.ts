import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
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
    if (body.content !== undefined) dataToUpdate.content = body.content
    if (body.wordGoal !== undefined) dataToUpdate.wordGoal = body.wordGoal
    if (body.customGoal !== undefined) dataToUpdate.customGoal = body.customGoal

    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document || document.userId !== user.id) {
      return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 })
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
