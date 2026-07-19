import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import EditorClient from "@/app/components/Editor/EditorClient"
import { signToken } from "@/lib/jwt"

export default async function EditorPage({ params }: { params: { id: string } }) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Busca o livro com seus capítulos (documents)
  const book = await prisma.book.findUnique({
    where: { id: params.id, userId: session.user.id },
    include: {
      documents: {
        select: {
          id: true,
          title: true,
          order: true,
        },
        orderBy: { order: "asc" }
      }
    }
  })

  if (!book) {
    redirect("/dashboard")
  }

  const currentUser = {
    id: session.user.id,
    name: session.user.name || null,
    email: session.user.email,
  }

  const wsToken = signToken({
    id: currentUser.id,
    email: currentUser.email,
    name: currentUser.name,
  })

  return (
    <EditorClient 
      book={book}
      documents={book.documents}
      currentUser={currentUser}
      wsToken={wsToken}
    />
  )
}
