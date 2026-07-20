import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import EditorClient from "@/app/components/Editor/EditorClient"
import { signToken } from "@/lib/jwt"

export default async function EditorPage({ params }: { params: Promise<{ id: string; lang: string }> }) {
  const { id, lang } = await params;
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Busca o livro com seus capítulos (documents)
  const book = await prisma.book.findUnique({
    where: { id: id, userId: session.user.id },
    include: {
      documents: {
        select: {
          id: true,
          title: true,
          order: true,
          content: true,
        },
        orderBy: { order: "asc" }
      }
    }
  })

  if (!book) {
    redirect("/dashboard")
  }

  // Buscar o masterPin do usuário no banco de dados
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { masterPin: true }
  })

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

  // Usar o masterPin do usuário (banco) como fonte principal, com fallback para o pin do livro
  const masterPin = user?.masterPin || book.pin

  return (
    <EditorClient 
      book={book}
      documents={book.documents}
      currentUser={currentUser}
      wsToken={wsToken}
      pin={masterPin}
      isEncrypted={book.securityType === 'pin' || book.securityType === 'biometrics'}
      lang={lang}
    />
  )
}
