import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ConfigForm from "./ConfigForm"

export default async function ConfiguracoesPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect("/login")
  }

  const userId = session.user.id

  const [user, projectsCount, documentsCount, wordsResult] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        name: true,
        email: true,
        image: true,
        selectedPlan: true,
        isPremium: true,
        aiCallsCount: true,
        ragContext: true, 
        masterPin: true,
        createdAt: true
      },
    }),
    prisma.book.count({ where: { userId } }),
    prisma.document.count({ where: { userId } }),
    prisma.document.aggregate({
      where: { userId },
      _sum: { wordCount: true }
    })
  ])

  const totalWords = wordsResult._sum.wordCount || 0

  return (
    <ConfigForm 
      user={{
        id: user?.id || userId,
        name: user?.name || session.user.name || null,
        email: user?.email || session.user.email || "",
        image: user?.image || session.user.image || null,
        selectedPlan: user?.selectedPlan || "free",
        isPremium: user?.isPremium || false,
        aiCallsCount: user?.aiCallsCount || 0,
        projectsCount: projectsCount || 0,
        documentsCount: documentsCount || 0,
        totalWords: totalWords,
        ragContext: user?.ragContext || null,
        masterPin: user?.masterPin || null,
        createdAt: user?.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
      }} 
    />
  )
}
