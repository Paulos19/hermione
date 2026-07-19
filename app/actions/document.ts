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

  let finalContent = content
  if ((book?.securityType === 'pin' || book?.securityType === 'biometrics') && book.pin) {
    finalContent = encryptData(content, book.pin) || content
  }

  await prisma.document.update({
    where: { 
      id,
      userId: session.user.id
    },
    data: {
      content: finalContent,
    }
  })
}
