"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createNoteAction(data: { title: string; content?: string; bookId: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const book = await prisma.book.findFirst({
    where: { id: data.bookId, userId: session.user.id }
  })
  if (!book) throw new Error("Livro não encontrado ou não pertence a você")

  const note = await prisma.bookNote.create({
    data: {
      title: data.title,
      content: data.content,
      bookId: data.bookId,
      category: "note"
    }
  })

  revalidatePath("/[lang]/(dashboard)/dashboard/notes", "page")
  return note
}

export async function updateNoteAction(id: string, data: { title?: string; content?: string; bookId?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const existing = await prisma.bookNote.findFirst({
    where: { id, book: { userId: session.user.id }, category: "note" }
  })
  if (!existing) throw new Error("Anotação não encontrada")

  if (data.bookId) {
    const book = await prisma.book.findFirst({
      where: { id: data.bookId, userId: session.user.id }
    })
    if (!book) throw new Error("Livro inválido")
  }

  const note = await prisma.bookNote.update({
    where: { id },
    data
  })

  revalidatePath("/[lang]/(dashboard)/dashboard/notes", "page")
  return note
}

export async function deleteNoteAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const existing = await prisma.bookNote.findFirst({
    where: { id, book: { userId: session.user.id }, category: "note" }
  })
  if (!existing) throw new Error("Anotação não encontrada")

  await prisma.bookNote.delete({
    where: { id }
  })

  revalidatePath("/[lang]/(dashboard)/dashboard/notes", "page")
  return true
}
