import { MousePointerClick, ClipboardList, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { SectionContainer } from "@/components/layout/SectionContainer"
import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    number: 1,
    icon: MousePointerClick,
    title: "Access the Form",
    description:
      "Click the 'Share Preferences' button to open the anonymous feedback form",
  },
  {
    number: 2,
    icon: ClipboardList,
    title: "Fill Your Preferences",
    description:
      "Choose your preferred event formats, topics of interest, and availability. All fields are optional",
  },
  {
    number: 3,
    icon: Send,
    title: "Submit Anonymously",
    description:
      "Your responses are submitted with no personal data attached. We only see aggregate trends",
  },
]

export function HowItWorksSection() {
  return (
    <SectionContainer
      id="how-it-works"
      variant="muted"
      title="How It Works"
      subtitle="Three simple steps to share your preferences"
    >
      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
        {/* Connector line between steps (desktop only) */}
        <div
          className="absolute top-16 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] hidden h-0.5 border-t-2 border-dashed border-primary/30 md:block"
          aria-hidden="true"
        />

        {steps.map((step) => (
          <Card
            key={step.number}
            className={cn(
              "relative border-none bg-transparent text-center shadow-none"
            )}
          >
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {step.number}
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
