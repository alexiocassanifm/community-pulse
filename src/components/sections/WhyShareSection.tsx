import { Users, Zap, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SectionContainer } from "@/components/layout/SectionContainer"
import { cn } from "@/lib/utils"

interface BenefitCard {
  icon: LucideIcon
  title: string
  description: string
}

const benefits: BenefitCard[] = [
  {
    icon: Users,
    title: "Community-Driven Events",
    description:
      "Your preferences guide what events we plan, ensuring they match what you actually want",
  },
  {
    icon: Zap,
    title: "Quick & Effortless",
    description:
      "Complete at your own pace with fully optional fields. Takes just 3-5 minutes",
  },
  {
    icon: ShieldCheck,
    title: "100% Anonymous",
    description:
      "No login, no personal data collected. Your privacy is our top priority",
  },
  {
    icon: TrendingUp,
    title: "Better Every Time",
    description:
      "Help us continuously improve with data-driven decisions about formats, topics, and schedules",
  },
]

export function WhyShareSection() {
  return (
    <SectionContainer
      id="why-share"
      variant="default"
      title="Why Share Your Preferences"
      subtitle="Your input directly shapes the events we organize"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {benefits.map((benefit) => (
          <Card
            key={benefit.title}
            className={cn(
              "transition-shadow duration-200 hover:shadow-md"
            )}
          >
            <CardHeader>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{benefit.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {benefit.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
