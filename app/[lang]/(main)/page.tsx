import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Geist } from "next/font/google"
import Navbar from "../../components/Navbar"
import HeroSection from "../../components/HeroSection"
import MobileAppSection from "../../components/MobileAppSection"
import MetricsSection from "../../components/MetricsSection"
import { dictionaries, ValidLang } from "../../dictionaries"

const geistSans = Geist({ subsets: ["latin"] })

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const session = await auth()

  if (session && session.user?.email) {
    redirect("/dashboard")
  }

  const resolvedParams = await params;
  const currentLang = (resolvedParams?.lang as ValidLang) || "pt";
  const dict = dictionaries[currentLang] || dictionaries.pt;

  return (
    <main className={`w-full bg-[#030303] text-white selection:bg-white/30 ${geistSans.className} flex flex-col relative`}>
      <Navbar dict={dict} />
      <HeroSection dict={dict} />
      <MobileAppSection dict={dict} />
      <MetricsSection dict={dict} />
      
      {/* Gradient fade out at the very bottom just in case the tablet overflows aggressively */}
      <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none z-50" />
    </main>
  )
}
