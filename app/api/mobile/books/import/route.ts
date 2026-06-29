import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/jwt"

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  const token = authHeader.split(" ")[1]
  return verifyToken(token)
}

export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request)
    if (!user || !user.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const payload = await request.json()
    if (!payload || !payload.title) {
      return NextResponse.json({ error: "Payload inválido. Arquivo .hrm corrompido ou formato desconhecido." }, { status: 400 })
    }

    // Criar o livro base
    const newBook = await prisma.book.create({
      data: {
        userId: user.id,
        title: `${payload.title} (Importado)`,
        coverImage: payload.coverImage || null,
        targetWords: payload.targetWords || 50000,
        defaultFontSize: payload.defaultFontSize || "18px",
        defaultFontFamily: payload.defaultFontFamily || "Inter",
        defaultFontWeight: payload.defaultFontWeight || "400",
        defaultParagraphIndent: payload.defaultParagraphIndent || false,
      }
    })

    // Importar documentos (capítulos)
    if (payload.documents && Array.isArray(payload.documents)) {
      for (const doc of payload.documents) {
        await prisma.document.create({
          data: {
            userId: user.id,
            bookId: newBook.id,
            title: doc.title || "Capítulo Importado",
            content: doc.content || "",
            wordCount: doc.wordCount || 0,
            wordGoal: doc.wordGoal || 5000,
            customGoal: doc.customGoal || null,
            order: doc.order || 0,
            themeBgColor: doc.themeBgColor || null,
            themeBgImage: doc.themeBgImage || null,
            themeFontColor: doc.themeFontColor || null,
            themeToolbarColor: doc.themeToolbarColor || null,
            themeToolsToolbarColor: doc.themeToolsToolbarColor || null,
            chapterNotes: doc.chapterNotes || null,
            checklist: doc.checklist || null,
            aiHistory: doc.aiHistory || null,
          }
        })
      }
    }

    // Importar personagens
    if (payload.characters && Array.isArray(payload.characters)) {
      for (const char of payload.characters) {
        await prisma.character.create({
          data: {
            bookId: newBook.id,
            name: char.name || "Sem Nome",
            role: char.role || "",
            description: char.description || "",
            imageUrl: char.imageUrl || null,
          }
        })
      }
    }

    // Importar notas (Bíblia/Regras)
    if (payload.notes && Array.isArray(payload.notes)) {
      for (const note of payload.notes) {
        await prisma.bookNote.create({
          data: {
            bookId: newBook.id,
            title: note.title || "Nota",
            content: note.content || "",
          }
        })
      }
    }

    return NextResponse.json({ success: true, bookId: newBook.id })
  } catch (error) {
    console.error("Erro na importação:", error)
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 })
  }
}
