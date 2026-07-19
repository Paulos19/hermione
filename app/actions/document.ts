"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function salvarDocumentoAction(id: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  await prisma.document.update({
    where: { 
      id,
      userId: session.user.id
    },
    data: {
      content,
    }
  })
}
