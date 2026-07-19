"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { encryptData } from "@/lib/encryption"

export async function salvarDocumentoAction(id: string, content: string, bookId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  // Check if book has security enabled
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { securityType: true, pin: true }
  })
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { masterPin: true }
  })

  const pinToUse = user?.masterPin || book?.pin;

  let finalContent = content
  if ((book?.securityType === 'pin' || book?.securityType === 'biometrics') && pinToUse) {
    finalContent = encryptData(content, pinToUse) || content
  }

  const doc = await prisma.document.findUnique({ where: { id }, select: { userId: true } })
  if (doc?.userId !== session.user.id) throw new Error("Não autorizado")

  await prisma.document.update({
    where: { id },
    data: {
      content: finalContent,
    }
  })
}
