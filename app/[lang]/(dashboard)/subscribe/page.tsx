import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import SubscribeClient from "./SubscribeClient"

export default async function SubscribePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect(`/${lang}/login`)
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPremium: true, selectedPlan: true }
  })

  return (
    <div className="min-h-screen w-full bg-[#0A0D12] text-[#F5F5F5] overflow-hidden">
      <SubscribeClient 
        lang={lang}
        isPremium={user?.isPremium || false}
        selectedPlan={user?.selectedPlan || "free"}
      />
    </div>
  )
}
