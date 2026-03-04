import Link from "next/link"
import { Mic2, Monitor, Users, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SectionContainer } from "@/components/layout/SectionContainer"
import { cn } from "@/lib/utils"

const formats = [
  {
    icon: Mic2,
    title: "Speech",
    description:
      "Present a topic you're passionate about in a 15-30 minute talk to the community.",
  },
  {
    icon: Monitor,
    title: "Demo",
    description:
      "Showcase a project, tool, or workflow with a live demonstration and walkthrough.",
  },
  {
    icon: Users,
    title: "Workshop",
    description:
      "Lead a hands-on session where attendees learn by doing alongside you.",
  },
]

export function CallForSpeakersSection() {
  return (
    <SectionContainer
      id="call-for-speakers"
      variant="muted"
      title="Share Your Knowledge"
      subtitle="Have something to teach? Propose a talk and share your expertise with the community"
    >
      <div className="grid gap-6 sm:grid-cols-3">
        {formats.map((format) => (
          <Card
            key={format.title}
            className={cn(
              "border-0 bg-background text-center",
              "transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            )}
          >
            <CardContent className="flex flex-col items-center p-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <format.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{format.title}</h3>
              <p className="text-sm text-muted-foreground">
                {format.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button asChild size="lg">
          <Link href="/speaker/submit">
            Propose a Talk
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </SectionContainer>
  )
}
