import { HeroSection } from "@/components/hero/HeroSection"
import { WhyShareSection } from "@/components/sections/WhyShareSection"
import { HowItWorksSection } from "@/components/sections/HowItWorksSection"
import { WhatWeCollectSection } from "@/components/landing/WhatWeCollectSection"
import { PrivacyFirstSection } from "@/components/landing/PrivacyFirstSection"
import { FeaturesGridSection } from "@/components/landing/FeaturesGridSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { CTASection } from "@/components/landing/CTASection"

export default function Home() {
  return (
    <main>
      <HeroSection />
      <WhyShareSection />
      <HowItWorksSection />
      <WhatWeCollectSection />
      <PrivacyFirstSection />
      <FeaturesGridSection />
      <FAQSection />
      <CTASection />
    </main>
  )
}
