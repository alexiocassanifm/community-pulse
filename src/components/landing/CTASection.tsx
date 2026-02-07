import Link from "next/link"
import { SectionContainer } from "@/components/layout/SectionContainer"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <SectionContainer id="cta" variant="accent">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to Shape Our Next Meetup?
        </h2>
        <p className="mt-4 text-lg text-primary-foreground/80">
          Your anonymous feedback helps us create events that truly matter to
          you
        </p>
        <Button variant="secondary" size="lg" asChild className="mt-8">
          <Link href="/form">Share Your Preferences</Link>
        </Button>
        <p className="mt-4 text-sm text-primary-foreground/60">
          Takes 3-5 minutes &bull; Completely anonymous &bull; All fields
          optional
        </p>
      </div>
    </SectionContainer>
  )
}
