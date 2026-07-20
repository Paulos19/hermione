import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import DashboardClient from "./DashboardClient"

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Obter data de hoje no formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  const [books, user, progressToday, recentDocuments] = await Promise.all([
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
      select: { name: true, masterPin: true }
    }),
    prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    }),
    prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { book: { select: { title: true } } }
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

  // Serializa Atividade Recente
  const activity = recentDocuments.map(doc => ({
    id: doc.id,
    title: doc.title,
    bookTitle: doc.book?.title || "Sem Livro",
    updatedAt: doc.updatedAt
  }))

  return (
    <div className="h-screen w-full bg-[#0A0D12] text-[#F5F5F5] overflow-hidden">
      <DashboardClient 
        books={serializedBooks} 
        userName={user?.name?.split(' ')[0] || "Usuário"} 
        wordsToday={progressToday?.words || 0}
        recentActivity={activity}
        lang={lang}
      />
    </div>
  )
}

