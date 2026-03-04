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
          Share your preferences or propose a talk — every contribution helps
          us build better events
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button variant="secondary" size="lg" asChild>
            <Link href="/form">Share Your Preferences</Link>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            asChild
            className="bg-transparent border-2 border-white text-white hover:bg-white/10"
          >
            <Link href="/speaker/submit">Propose a Talk</Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-primary-foreground/60">
          Takes 3-5 minutes &bull; Completely anonymous &bull; All fields
          optional
        </p>
      </div>
    </SectionContainer>
  )
}
