import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Geist } from "next/font/google"
import Navbar from "../../components/Navbar"
import HeroSection from "../../components/HeroSection"
import HeroToMobileTransition from "../../components/HeroToMobileTransition"
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
import SectionTransition from "../../components/SectionTransition"
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
      <HeroToMobileTransition />
      <SectionTransition parallaxOffset={30} fadeIn slideUp>
        <MobileAppSection dict={dict} />
      </SectionTransition>
      <SectionTransition parallaxOffset={40} fadeIn slideUp>
        <MetricsSection dict={dict} />
      </SectionTransition>
      <SectionTransition parallaxOffset={20} fadeIn slideUp>
        <PhasePresentationSection dict={dict} />
      </SectionTransition>
      <SectionTransition parallaxOffset={35} fadeIn slideUp>
        <TestimonialSection initialFeedbacks={initialFeedbacks} dict={dict} />
      </SectionTransition>
      <SectionTransition parallaxOffset={25} fadeIn slideUp>
        <FeaturesSection dict={dict} />
      </SectionTransition>
      <SectionTransition parallaxOffset={30} fadeIn slideUp>
        <EcosystemSection dict={dict} />
      </SectionTransition>
      <SectionTransition parallaxOffset={20} fadeIn slideUp>
        <PricingSection dict={dict} />
      </SectionTransition>
      <SectionTransition parallaxOffset={15} fadeIn slideUp>
        <FaqSection dict={dict} />
      </SectionTransition>
      <SectionTransition parallaxOffset={40} fadeIn slideUp>
        <CtaFinalSection dict={dict} />
      </SectionTransition>
      <FooterSection dict={dict} />
    </main>
  )
}
