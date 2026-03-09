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
    question: "Who can submit a talk?",
    answer:
      "Anyone! Whether you're a seasoned speaker or it's your first time, we welcome proposals for speeches, demos, and workshops on any relevant topic.",
  },
  {
    question: "What happens after I submit a talk proposal?",
    answer:
      "You'll receive a confirmation email with a link to your speaker portal. Organizers will review your proposal and update the status — you can track progress and communicate with them through the portal at any time.",
  },
  {
    question: "How do I join the community?",
    answer:
      "Look for the community link on our homepage. We use Telegram or WhatsApp to stay connected between events, share updates, and discuss upcoming meetups.",
  },
]

export function FAQSection() {
  return (
    <SectionContainer
      id="faq"
      variant="default"
      title="Frequently Asked Questions"
      subtitle="Everything you need to know about our community"
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
