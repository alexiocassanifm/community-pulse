import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import type { CommunityLinkValue } from "@/types/settings"

interface HeroSectionProps {
  communityLink?: CommunityLinkValue | null;
}

export function HeroSection({ communityLink }: HeroSectionProps) {
  const showCommunityLink = communityLink?.enabled && communityLink.url;
  const platformLabel =
    communityLink?.platform === "whatsapp" ? "WhatsApp" : "Telegram";

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--hero-bg)]">
      {/* Decorative background elements */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[var(--hero-accent)]/15 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-[var(--hero-accent)]/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[var(--hero-accent)]/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 w-48 sm:w-56 md:w-64">
          <Image
            src="/community-logo.jpeg"
            alt={`${siteConfig.communityName} logo`}
            width={512}
            height={512}
            className="rounded-2xl shadow-2xl"
            priority
          />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--hero-text)] sm:text-5xl md:text-6xl lg:text-7xl">
          Shape the Future
          <br />
          of Our Meetups
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--hero-text)]/70 sm:text-xl md:text-2xl">
          Join the community, share your preferences, or propose a talk —
          help us create events you&apos;ll love.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 bg-[var(--hero-accent)] px-8 text-base font-semibold text-white hover:bg-[var(--hero-accent-hover)]"
          >
            <Link href="/form">
              Share Your Preferences
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 border-[var(--hero-accent)] px-8 text-base font-semibold text-[var(--hero-accent)] hover:bg-[var(--hero-accent)]/10"
          >
            <Link href="/speaker/submit">
              Propose a Talk
            </Link>
          </Button>
          {showCommunityLink && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-[var(--hero-accent)] px-8 text-base font-semibold text-[var(--hero-accent)] hover:bg-[var(--hero-accent)]/10"
            >
              <a
                href={communityLink.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {communityLink.label || `Join on ${platformLabel}`}
              </a>
            </Button>
          )}
        </div>

        <p className="mt-6 text-sm text-[var(--hero-text)]/50">
          Takes 3-5 minutes &bull; Completely anonymous &bull; All fields optional
        </p>

        {siteConfig.creatorName && (
          <p className="mt-8 text-xs text-[var(--hero-text)]/40">
            A project by{' '}
            {siteConfig.creatorUrl ? (
              <a href={siteConfig.creatorUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--hero-text)]/70 transition-colors">
                {siteConfig.creatorName}
              </a>
            ) : (
              siteConfig.creatorName
            )}
            {siteConfig.creatorRole && <> &mdash; {siteConfig.creatorRole}</>}
          </p>
        )}
      </div>
    </section>
  )
}
