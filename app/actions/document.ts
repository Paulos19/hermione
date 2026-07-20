"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { encryptData } from "@/lib/encryption"

export async function salvarDocumentoAction(id: string, content: string, bookId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  const doc = await prisma.document.findUnique({ where: { id }, select: { userId: true } })
  if (doc?.userId !== session.user.id) throw new Error("Não autorizado")

  await prisma.document.update({
    where: { id },
    data: {
      content,
    }
  })
}
