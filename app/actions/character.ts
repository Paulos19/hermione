"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createCharacterAction(data: { name: string; role?: string; description?: string; bookId: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  // Verify book belongs to user
  const book = await prisma.book.findFirst({
    where: { id: data.bookId, userId: session.user.id }
  })
  if (!book) throw new Error("Livro não encontrado ou não pertence a você")

  const character = await prisma.character.create({
    data: {
      name: data.name,
      role: data.role,
      description: data.description,
      bookId: data.bookId
    }
  })

  revalidatePath("/[lang]/(dashboard)/dashboard/characters", "page")
  return character
}

export async function updateCharacterAction(id: string, data: { name?: string; role?: string; description?: string; bookId?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  // Verify character belongs to user (through book)
  const existing = await prisma.character.findFirst({
    where: { id, book: { userId: session.user.id } }
  })
  if (!existing) throw new Error("Personagem não encontrado")

  if (data.bookId) {
    const book = await prisma.book.findFirst({
      where: { id: data.bookId, userId: session.user.id }
    })
    if (!book) throw new Error("Livro inválido")
  }

  const character = await prisma.character.update({
    where: { id },
    data
  })

  revalidatePath("/[lang]/(dashboard)/dashboard/characters", "page")
  return character
}

export async function deleteCharacterAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const existing = await prisma.character.findFirst({
    where: { id, book: { userId: session.user.id } }
  })
  if (!existing) throw new Error("Personagem não encontrado")

  await prisma.character.delete({
    where: { id }
  })

  revalidatePath("/[lang]/(dashboard)/dashboard/characters", "page")
  return true
}
