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
    question: "How is my data protected?",
    answer:
      "We follow GDPR guidelines for data handling. No personal identifiers are collected, data is stored securely, and it's used solely for planning better meetup events.",
  },
]

export function FAQSection() {
  return (
    <SectionContainer
      id="faq"
      variant="default"
      title="Frequently Asked Questions"
      subtitle="Everything you need to know about our preference collection"
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
