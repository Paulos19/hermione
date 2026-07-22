"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function checkAndIncrementAiCallsAction() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Não autorizado")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { selectedPlan: true, aiCallsCount: true }
  })

  if (user?.selectedPlan === "free" && user.aiCallsCount >= 7) {
    throw new Error("LIMIT_REACHED")
  }

  // Increment
  await prisma.user.update({
    where: { id: session.user.id },
    data: { aiCallsCount: { increment: 1 } }
  })

  return { success: true, aiCallsCount: (user?.aiCallsCount || 0) + 1 }
}
