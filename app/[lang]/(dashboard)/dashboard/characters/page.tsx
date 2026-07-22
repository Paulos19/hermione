import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CharactersClient from "./CharactersClient";

export default async function CharactersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const today = new Date().toISOString().split('T')[0]

  const [characters, books, user, progressToday] = await Promise.all([
    prisma.character.findMany({
      where: { book: { userId: session.user.id } },
      orderBy: { updatedAt: "desc" },
      include: {
        book: { select: { id: true, title: true } }
      }
    }),
    prisma.book.findMany({
      where: { userId: session.user.id },
      select: { id: true, title: true },
      orderBy: { title: "asc" }
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

  // Serializar os personagens para o cliente
  const serializedCharacters = characters.map(c => ({
    id: c.id,
    bookId: c.bookId,
    bookTitle: c.book.title,
    name: c.name,
    role: c.role,
    description: c.description,
    updatedAt: c.updatedAt
  }))

  return (
    <div className="h-screen w-full bg-[#0A0D12] text-[#F5F5F5] overflow-hidden">
      <CharactersClient
        characters={serializedCharacters}
        books={books}
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
