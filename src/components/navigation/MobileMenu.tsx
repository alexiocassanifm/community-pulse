"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Why Share", href: "#why-share" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "What We Collect", href: "#what-we-collect" },
  { label: "Privacy", href: "#privacy" },
  { label: "FAQ", href: "#faq" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  const handleLinkClick = (href: string) => {
    setOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-left">Meetup App</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-1 flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleLinkClick(link.href)}
              className="text-left text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </button>
          ))}
          <div className="mt-auto pb-6">
            <Button asChild className="w-full">
              <Link href="/form" onClick={() => setOpen(false)}>
                Share Preferences
              </Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
