import { Calendar, Lightbulb, Clock } from "lucide-react"
import { SectionContainer } from "@/components/layout/SectionContainer"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const categories = [
  {
    icon: Calendar,
    title: "Event Formats",
    items: [
      "Presentations",
      "Workshops",
      "Panel Discussions",
      "Networking",
      "Hackathons",
      "Hybrid preferences",
    ],
  },
  {
    icon: Lightbulb,
    title: "Topics of Interest",
    items: [
      "AI & Machine Learning",
      "Web Development",
      "DevOps",
      "Cloud Architecture",
      "Security",
      "and more",
    ],
  },
  {
    icon: Clock,
    title: "Availability",
    items: [
      "Preferred days",
      "Time slots (morning/afternoon/evening)",
      "Frequency (weekly to quarterly)",
    ],
  },
]

export function WhatWeCollectSection() {
  return (
    <SectionContainer
      id="what-we-collect"
      variant="default"
      title="What We Collect"
      subtitle="We gather preferences in three key areas to plan better events"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <Card
            key={category.title}
            className="overflow-hidden border-t-4 border-t-primary"
          >
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <category.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {category.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionContainer>
  )
}
