import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Geist } from "next/font/google"
import Navbar from "../../components/Navbar"
import HeroSection from "../../components/HeroSection"
import MobileAppSection from "../../components/MobileAppSection"
import MetricsSection from "../../components/MetricsSection"
import PhasePresentationSection from "../../components/PhasePresentationSection"
import TestimonialSection from "../../components/TestimonialSection"
import FeaturesSection from "../../components/FeaturesSection"
import EcosystemSection from "../../components/EcosystemSection"
import PricingSection from "../../components/PricingSection"
import FaqSection from "../../components/FaqSection"
import CtaFinalSection from "../../components/CtaFinalSection"
import FooterSection from "../../components/FooterSection"
import { dictionaries, ValidLang } from "../../dictionaries"
import { getFeedbacksAction } from "@/app/actions/feedback"

const geistSans = Geist({ subsets: ["latin"] })

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const session = await auth()

  if (session && session.user?.email) {
    redirect("/dashboard")
  }

  const resolvedParams = await params;
  const currentLang = (resolvedParams?.lang as ValidLang) || "pt";
  const dict = dictionaries[currentLang] || dictionaries.pt;

  const feedbacksRes = await getFeedbacksAction(12);
  const initialFeedbacks = feedbacksRes.success ? feedbacksRes.feedbacks : [];

  return (
    <main className={`w-full bg-[#030303] text-white selection:bg-white/30 ${geistSans.className} flex flex-col relative`}>
      <Navbar dict={dict} />
      <HeroSection dict={dict} />
      <MobileAppSection dict={dict} />
      <MetricsSection dict={dict} />
      <PhasePresentationSection dict={dict} />
      <TestimonialSection initialFeedbacks={initialFeedbacks} dict={dict} />
      <FeaturesSection dict={dict} />
      <EcosystemSection dict={dict} />
      <PricingSection dict={dict} />
      <FaqSection dict={dict} />
      <CtaFinalSection dict={dict} />
      <FooterSection dict={dict} />
      
    </main>
  )
}
