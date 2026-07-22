import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Obter data de hoje no formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  const [books, user, progressToday] = await Promise.all([
    prisma.book.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        documents: {
          select: { wordCount: true }
        },
        _count: {
          select: { documents: true }
        }
      }
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, isPremium: true, image: true, selectedPlan: true, aiCallsCount: true, _count: { select: { books: true } } }
    }),
    prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    })
  ])

  // Serializa Books e Calcula as Palavras
  const serializedBooks = books.map(book => {
    const totalWords = book.documents.reduce((acc, doc) => acc + (doc.wordCount || 0), 0)
    return {
      id: book.id,
      title: book.title,
      category: book.category,
      coverImage: book.coverImage,
      updatedAt: book.updatedAt,
      documentCount: book._count.documents,
      wordCount: totalWords
    }
  })

  return (
    <div className="h-screen w-full bg-[#0A0D12] text-[#F5F5F5] overflow-hidden">
      <ProjectsClient
        books={serializedBooks}
        userName={user?.name?.split(' ')[0] || "Usuário"}
        userImage={user?.image}
        wordsToday={progressToday?.words || 0}
        lang={lang}
        isPremium={user?.isPremium || false}
        selectedPlan={user?.selectedPlan || "free"}
        projectsCount={user?._count?.books || 0}
        aiCallsCount={user?.aiCallsCount || 0}
      />
    </div>
  )
}
