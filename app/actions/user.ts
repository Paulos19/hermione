"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function salvarRagAction(prevState: any, formData: FormData): Promise<{ success?: string; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autorizado." }
  }

  const ragContext = formData.get("ragContext") as string

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ragContext: ragContext || null,
      },
    })

    revalidatePath("/configuracoes")
    return { success: "Configurações de RAG salvas com sucesso!" }
  } catch (error) {
    console.error("Erro ao salvar RAG:", error)
    return { error: "Erro ao salvar as configurações. Tente novamente." }
  }
}

export async function salvarMasterPinAction(pin: string): Promise<{ success?: string; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Não autorizado." }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        masterPin: pin,
      },
    })

    return { success: "PIN Mestre salvo com sucesso!" }
  } catch (error) {
    console.error("Erro ao salvar PIN Mestre:", error)
    return { error: "Erro ao salvar o PIN Mestre. Tente novamente." }
  }
}
