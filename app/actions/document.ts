"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { encryptData } from "@/lib/encryption"

async function isAuthorizedForBook(bookId: string, userId: string) {
  const book = await prisma.book.findUnique({ where: { id: bookId }, select: { userId: true } })
  if (book?.userId === userId) return true

  const collab = await prisma.bookCollaborator.findUnique({
    where: { bookId_userId: { bookId, userId } }
  })
  if (collab && collab.isActive && collab.permissions.includes("WRITE")) return true
  
  return false
}

async function checkDocAuth(docId: string, userId: string) {
  const doc = await prisma.document.findUnique({ where: { id: docId }, select: { userId: true, bookId: true, wordCount: true } })
  if (!doc) return { authorized: false, doc: null }
  if (doc.userId === userId) return { authorized: true, doc }

  if (doc.bookId) {
    const isAuth = await isAuthorizedForBook(doc.bookId, userId)
    if (isAuth) return { authorized: true, doc }
  }

  return { authorized: false, doc }
}

export async function salvarDocumentoAction(id: string, content: string, bookId: string, wordCount?: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const { authorized, doc } = await checkDocAuth(id, session.user.id)
  if (!authorized || !doc) throw new Error("Não autorizado")

  const dataToUpdate: any = { content }

  if (wordCount !== undefined) {
    dataToUpdate.wordCount = wordCount;
    const wordsDiff = wordCount - (doc.wordCount || 0);

    if (wordsDiff !== 0) {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      
      await prisma.dailyProgress.upsert({
        where: {
           userId_date: { userId: session.user.id, date: today }
        },
        update: {
           words: { increment: wordsDiff }
        },
        create: {
           userId: session.user.id,
           date: today,
           words: Math.max(0, wordsDiff)
        }
      });
    }
  }

  await prisma.document.update({
    where: { id },
    data: dataToUpdate
  })
}

export async function renomearDocumentoAction(id: string, title: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const { authorized } = await checkDocAuth(id, session.user.id)
  if (!authorized) throw new Error("Não autorizado")

  await prisma.document.update({
    where: { id },
    data: { title }
  })
}

export async function criarDocumentoAction(bookId: string, title: string, order: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const isAuth = await isAuthorizedForBook(bookId, session.user.id)
  if (!isAuth) throw new Error("Não autorizado")

  const newDoc = await prisma.document.create({
    data: {
      userId: session.user.id,
      bookId,
      title,
      order,
    }
  })

  return { id: newDoc.id, title: newDoc.title, order: newDoc.order }
}

export async function excluirDocumentoAction(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const { authorized } = await checkDocAuth(id, session.user.id)
  if (!authorized) throw new Error("Não autorizado")

  await prisma.document.delete({
    where: { id }
  })
}
