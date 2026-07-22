import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import MetricsClient from "./MetricsClient"

export default async function MetricsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const today = new Date().toISOString().split('T')[0]

  const [user, progressToday, allProgress, books] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, image: true, dailyGoal: true, isPremium: true, selectedPlan: true, aiCallsCount: true, _count: { select: { books: true } } }
    }),
    prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    }),
    prisma.dailyProgress.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
      take: 30
    }),
    prisma.book.findMany({
      where: { userId: session.user.id },
      include: {
        documents: {
          select: { wordCount: true }
        }
      }
    })
  ])

  const serializedBooks = books.map(b => {
    const totalWords = b.documents.reduce((acc, doc) => acc + (doc.wordCount || 0), 0)
    const chapterCount = b.documents.length
    return {
      id: b.id,
      title: b.title,
      totalWords,
      chapterCount,
      avgWordsPerChapter: chapterCount > 0 ? Math.round(totalWords / chapterCount) : 0
    }
  })

  return (
    <div className="h-screen w-full bg-[#0A0D12] text-[#F5F5F5] overflow-hidden">
      <MetricsClient
        userImage={user?.image}
        dailyGoal={user?.dailyGoal || 1000}
        wordsToday={progressToday?.words || 0}
        history={allProgress}
        booksStats={serializedBooks}
        lang={lang}
        isPremium={user?.isPremium || false}
        selectedPlan={user?.selectedPlan || "free"}
        projectsCount={user?._count?.books || 0}
        aiCallsCount={user?.aiCallsCount || 0}
      />
    </div>
  )
}
