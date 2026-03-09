export const dynamic = "force-dynamic";

import { HeroSection } from "@/components/hero/HeroSection"
import { UpcomingMeetupsSection } from "@/components/sections/UpcomingMeetupsSection"
import { GetInvolvedSection } from "@/components/sections/GetInvolvedSection"
import { CallForSpeakersSection } from "@/components/sections/CallForSpeakersSection"
import { FAQSection } from "@/components/landing/FAQSection"
import { CTASection } from "@/components/landing/CTASection"
import { createServerClient } from "@/lib/supabase/server"
import type { CommunityLinkValue } from "@/types/settings"

export default async function Home() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "community_link")
    .single()

  const communityLink = (data?.value as unknown as CommunityLinkValue) ?? null

  return (
    <main>
      <HeroSection communityLink={communityLink} />
      <UpcomingMeetupsSection />
      <GetInvolvedSection communityLink={communityLink} />
      <CallForSpeakersSection />
      <FAQSection />
      <CTASection communityLink={communityLink} />
    </main>
  )
}
