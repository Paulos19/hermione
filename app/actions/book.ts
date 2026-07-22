"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function criarLivroAction(title: string = "Novo Livro") {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  // Business Logic: Check plan limits
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { selectedPlan: true, _count: { select: { books: true } } }
  })

  if (user?.selectedPlan === "free" && user._count.books >= 1) {
    throw new Error("Limite do plano atingido. Faça upgrade para criar mais projetos.")
  }

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

export async function renomearLivroAction(id: string, title: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  await prisma.book.update({
    where: { id, userId: session.user.id },
    data: { title },
  })

  revalidatePath("/dashboard")
  revalidatePath(`/[lang]/(editor)/editor/${id}`, 'page')
}
