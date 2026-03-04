import { SectionContainer } from "@/components/layout/SectionContainer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Is my feedback really anonymous?",
    answer:
      "Absolutely. We don't require login, don't collect personal information, and don't use tracking cookies. Your responses are stored without any identifying data attached.",
  },
  {
    question: "How long does it take to complete?",
    answer:
      "The form takes approximately 3-5 minutes. All fields are optional, so you can fill in as much or as little as you'd like.",
  },
  {
    question: "What happens with my responses?",
    answer:
      "Your preferences are aggregated with others to help us understand community trends. We use this data to plan event formats, choose topics, and schedule meetups that match what participants actually want.",
  },
  {
    question: "Can I change my responses later?",
    answer:
      "Since responses are completely anonymous, we cannot link them back to you. However, you're welcome to submit a new response at any time with updated preferences.",
  },
  {
    question: "Do I need to fill in everything?",
    answer:
      "No! Every field is optional. You can share preferences only for the areas you care about most.",
  },
  {
    question: "Who can submit a talk?",
    answer:
      "Anyone! Whether you're a seasoned speaker or it's your first time, we welcome proposals for speeches, demos, and workshops on any relevant topic.",
  },
  {
    question: "What happens after I submit a talk proposal?",
    answer:
      "You'll receive a confirmation email with a link to your speaker portal. Organizers will review your proposal and update the status — you can track progress and communicate with them through the portal at any time.",
  },
]

export function FAQSection() {
  return (
    <SectionContainer
      id="faq"
      variant="default"
      title="Frequently Asked Questions"
      subtitle="Everything you need to know about preferences and speaking"
    >
      <div className="mx-auto max-w-[800px]">
        <Accordion type="single" collapsible>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </SectionContainer>
  )
}
