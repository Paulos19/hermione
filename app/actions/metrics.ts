"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateDailyGoalAction(dailyGoal: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autorizado")

  if (typeof dailyGoal !== 'number' || dailyGoal <= 0) {
    throw new Error("A meta deve ser um número maior que zero")
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { dailyGoal }
  })

  // Revalidate the metrics and dashboard routes so the new goal reflects everywhere
  revalidatePath("/[lang]/(dashboard)/dashboard", "layout")
  
  return true
}
