import { HeroSection } from "@/components/hero/HeroSection"
import { WhyShareSection } from "@/components/sections/WhyShareSection"
import { HowItWorksSection } from "@/components/sections/HowItWorksSection"
import { CallForSpeakersSection } from "@/components/sections/CallForSpeakersSection"
import { PrivacyFirstSection } from "@/components/landing/PrivacyFirstSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { CTASection } from "@/components/landing/CTASection"

export default function Home() {
  return (
    <main>
      <HeroSection />
      <WhyShareSection />
      <HowItWorksSection />
      <CallForSpeakersSection />
      <PrivacyFirstSection />
      <FAQSection />
      <CTASection />
    </main>
  )
}
