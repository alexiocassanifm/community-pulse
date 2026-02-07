import { EyeOff, Timer, Shield, HeartHandshake } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { SectionContainer } from "@/components/layout/SectionContainer"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: EyeOff,
    title: "100% Anonymous",
    description:
      "No login required, no personal information collected. Your identity stays private",
  },
  {
    icon: Timer,
    title: "Quick & Easy",
    description:
      "Optional fields let you complete at your own pace. Just 3-5 minutes",
  },
  {
    icon: Shield,
    title: "Privacy Protected",
    description:
      "GDPR compliant, secure data handling, no tracking cookies",
  },
  {
    icon: HeartHandshake,
    title: "Your Voice Matters",
    description:
      "Help shape future meetup events based on real community preferences",
  },
]

export function FeaturesGridSection() {
  return (
    <SectionContainer
      variant="default"
      title="Key Features"
      subtitle="Built with your experience in mind"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className={cn(
              "border-0 bg-muted/50 text-center",
              "transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            )}
          >
            <CardContent className="flex flex-col items-center p-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
