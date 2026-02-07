import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#131314]">
      {/* Decorative background elements */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#d97757]/15 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-[#d97757]/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#d97757]/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 w-48 sm:w-56 md:w-64">
          <Image
            src="/claude-milan-logo.jpeg"
            alt="Claude Milan Meetup"
            width={512}
            height={512}
            className="rounded-2xl shadow-2xl"
            priority
          />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Shape the Future
          <br />
          of Our Meetups
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-[#faf8f5]/70 sm:text-xl md:text-2xl">
          Share your preferences anonymously and help us create events
          you&apos;ll love. No login required, completely private.
        </p>

        <div className="mt-10">
          <Button
            asChild
            size="lg"
            className="h-12 bg-[#d97757] px-8 text-base font-semibold text-white hover:bg-[#c4654a]"
          >
            <Link href="/form">
              Share Your Preferences
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-[#faf8f5]/50">
          Takes 3-5 minutes &bull; Completely anonymous &bull; All fields optional
        </p>
      </div>
    </section>
  )
}
