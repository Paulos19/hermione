import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ConfigForm from "./ConfigForm"

export default async function ConfiguracoesPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { ragContext: true },
  })

  return <ConfigForm initialRag={user?.ragContext || null} />
}
