import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import DashboardClient from "./DashboardClient"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const [books, user] = await Promise.all([
    prisma.book.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { documents: true }
        }
      }
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { masterPin: true }
    })
  ])

  // Serializa para passar para o Client Component
  const serializedBooks = books.map(book => ({
    id: book.id,
    title: book.title,
    category: book.category,
    createdAt: book.createdAt,
    documentCount: book._count.documents
  }))

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-50 flex flex-col">
      <main className="flex-1 w-full bg-zinc-950">
        <DashboardClient initialBooks={serializedBooks} userName={session.user.name || "Usuário"} hasMasterPin={!!user?.masterPin} />
      </main>
    </div>
  )
}
