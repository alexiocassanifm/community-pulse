import { Navigation } from "@/components/navigation/Navigation"
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
    <>
      <Navigation />
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
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4">
          <p>&copy; {new Date().getFullYear()} Meetup App. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
