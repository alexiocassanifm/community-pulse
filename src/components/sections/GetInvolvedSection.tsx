import Link from "next/link";
import { MessageCircle, ClipboardList, Mic2, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { cn } from "@/lib/utils";
import type { CommunityLinkValue } from "@/types/settings";

interface InvolvementCard {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  external?: boolean;
}

function buildCards(communityLink?: CommunityLinkValue | null): InvolvementCard[] {
  const cards: InvolvementCard[] = [];

  if (communityLink?.enabled && communityLink.url) {
    const platformLabel =
      communityLink.platform === "telegram" ? "Telegram" : "WhatsApp";
    cards.push({
      icon: MessageCircle,
      title: "Join the Community",
      description: `Connect with fellow members, share ideas, and stay updated on upcoming events via ${platformLabel}.`,
      href: communityLink.url,
      buttonLabel: communityLink.label || `Join on ${platformLabel}`,
      external: true,
    });
  }

  cards.push(
    {
      icon: ClipboardList,
      title: "Share Your Preferences",
      description:
        "Tell us what topics, formats, and schedules work best for you. All responses are anonymous.",
      href: "/form",
      buttonLabel: "Fill the Form",
    },
    {
      icon: Mic2,
      title: "Propose a Talk",
      description:
        "Have expertise to share? Submit a speech, demo, or workshop proposal and inspire the community.",
      href: "/speaker/submit",
      buttonLabel: "Submit a Proposal",
    }
  );

  return cards;
}

interface GetInvolvedSectionProps {
  communityLink?: CommunityLinkValue | null;
}

export function GetInvolvedSection({ communityLink }: GetInvolvedSectionProps) {
  const cards = buildCards(communityLink);

  return (
    <SectionContainer
      id="get-involved"
      variant="default"
      title="Get Involved"
      subtitle="There are many ways to contribute to the community"
    >
      <div
        className={cn(
          "grid gap-6",
          cards.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 max-w-3xl mx-auto"
        )}
      >
        {cards.map((card) => (
          <Card
            key={card.title}
            className={cn(
              "flex flex-col transition-shadow duration-200 hover:shadow-md"
            )}
          >
            <CardHeader className="flex-1">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{card.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {card.description}
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Button asChild variant="outline" className="w-full">
                {card.external ? (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {card.buttonLabel}
                  </a>
                ) : (
                  <Link href={card.href}>{card.buttonLabel}</Link>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}
