"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function criarLivroAction(title: string = "Novo Livro") {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const book = await prisma.book.create({
    data: {
      userId: session.user.id,
      title,
    },
  })

  // Criar um primeiro capítulo vazio
  await prisma.document.create({
    data: {
      userId: session.user.id,
      bookId: book.id,
      title: "Capítulo 1",
      order: 1,
    }
  })

  revalidatePath("/dashboard")
  return book.id
}

export async function listarLivrosAction() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const books = await prisma.book.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  })

  return books
}

export async function deletarLivroAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  await prisma.book.delete({
    where: { id, userId: session.user.id },
  })

  revalidatePath("/dashboard")
}
