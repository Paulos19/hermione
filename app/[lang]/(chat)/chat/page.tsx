import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ChatInterface from "@/app/components/ChatInterface"
import { signToken } from "@/lib/jwt"

export default async function ChatPage({ params }: { params: Promise<{ lang: string }> }) {
  const session = await auth()

  if (!session || !session.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true }
  })

  if (!user?.isPremium) {
    // If not premium, redirect to subscribe page
    redirect(`/${(await params).lang}/subscribe`)
  }

  // Query user's previous sessions
  const sessionsData = await prisma.chatSession.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
  })

  const serializedSessions = sessionsData.map((s: any) => ({
    id: s.id,
    title: s.title,
    createdAt: s.createdAt,
  }))

  const currentUser = {
    id: session.user.id || "",
    name: session.user.name || null,
    email: session.user.email,
  }

  // Gera um token JWT compatível com o backend móvel (API)
  const wsToken = signToken({
    id: currentUser.id,
    email: currentUser.email,
    name: currentUser.name,
  })

  return (
    <ChatInterface
      initialSessions={serializedSessions}
      currentUser={currentUser}
      wsToken={wsToken}
    />
  )
}
