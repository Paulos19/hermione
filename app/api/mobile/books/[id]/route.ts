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
    const id = (await params).id;
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const book = await prisma.book.findUnique({
      where: { id, userId: user.id },
      include: {
        documents: {
          orderBy: { order: 'asc' }
        },
        characters: true,
        notes: true,
      }
    })

    if (!book) return NextResponse.json({ error: "Livro não encontrado." }, { status: 404 })

    return NextResponse.json({ book })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    const body = await request.json()
    const { 
      title, coverImage, targetWords, 
      defaultFontSize, defaultFontFamily, defaultFontWeight, defaultParagraphIndent,
      securityType, pin,
      defaultThemeBgColor, defaultThemeBgImage, defaultThemeFontColor, defaultThemeToolbarColor, defaultThemeToolsToolbarColor,
      applyToAllChapters
    } = body

    const book = await prisma.book.update({
      where: { id, userId: user.id },
      data: {
        ...(title !== undefined && { title }),
        ...(coverImage !== undefined && { coverImage }),
        ...(targetWords !== undefined && { targetWords }),
        ...(defaultFontSize !== undefined && { defaultFontSize }),
        ...(defaultFontFamily !== undefined && { defaultFontFamily }),
        ...(defaultFontWeight !== undefined && { defaultFontWeight }),
        ...(defaultParagraphIndent !== undefined && { defaultParagraphIndent }),
        ...(securityType !== undefined && { securityType }),
        ...(pin !== undefined && { pin }),
        ...(defaultThemeBgColor !== undefined && { defaultThemeBgColor }),
        ...(defaultThemeBgImage !== undefined && { defaultThemeBgImage }),
        ...(defaultThemeFontColor !== undefined && { defaultThemeFontColor }),
        ...(defaultThemeToolbarColor !== undefined && { defaultThemeToolbarColor }),
        ...(defaultThemeToolsToolbarColor !== undefined && { defaultThemeToolsToolbarColor }),
      },
    })

    if (applyToAllChapters) {
      await prisma.document.updateMany({
        where: { bookId: id, userId: user.id },
        data: {
          ...(defaultThemeBgColor !== undefined && { themeBgColor: defaultThemeBgColor }),
          ...(defaultThemeBgImage !== undefined && { themeBgImage: defaultThemeBgImage }),
          ...(defaultThemeFontColor !== undefined && { themeFontColor: defaultThemeFontColor }),
          ...(defaultThemeToolbarColor !== undefined && { themeToolbarColor: defaultThemeToolbarColor }),
          ...(defaultThemeToolsToolbarColor !== undefined && { themeToolsToolbarColor: defaultThemeToolsToolbarColor }),
        }
      })
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error("Error updating book settings:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const user = getUserFromRequest(request)
    if (!user || !user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

    await prisma.book.delete({
      where: { id, userId: user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
