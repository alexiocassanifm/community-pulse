import { Shield, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { SectionContainer } from "@/components/layout/SectionContainer"

const privacyGuarantees = [
  "No login or account required",
  "No personal information collected",
  "No cookies or tracking",
  "GDPR compliant data handling",
  "Data used only for aggregate analysis",
  "You can skip any question",
]

export function PrivacyFirstSection() {
  return (
    <SectionContainer
      id="privacy"
      variant="muted"
      title="Privacy First"
      subtitle="Your anonymity and data security are built into every aspect of our system"
    >
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            <h3 className="text-2xl font-semibold">Your Privacy, Our Priority</h3>
          </div>
          <p className="mb-4 text-muted-foreground">
            We believe honest feedback starts with trust. That is why this survey
            is completely anonymous — no accounts, no tracking, no personal data
            collected. Your responses are used solely to improve future meetup
            experiences.
          </p>
          <p className="text-muted-foreground">
            All data handling is fully GDPR compliant. We collect only aggregate
            insights, ensuring your individual responses can never be traced back
            to you. Feel free to share your honest opinions without hesitation.
          </p>
        </div>

        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="space-y-4 p-6">
            {privacyGuarantees.map((guarantee) => (
              <div key={guarantee} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-medium">{guarantee}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SectionContainer>
  )
}
