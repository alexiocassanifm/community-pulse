"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";
import { siteConfig } from "@/config/site";

const NAV_LINKS = [
  { label: "Why Share", href: "#why-share" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "What We Collect", href: "#what-we-collect" },
  { label: "Privacy", href: "#privacy" },
  { label: "FAQ", href: "#faq" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (isDashboard) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDashboard]);

  if (isDashboard) return null;

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md transition-shadow duration-200",
        scrolled && "border-b shadow-sm"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight">
          {siteConfig.communityName}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {isLanding &&
            NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          <Button variant="outline" size="sm" asChild>
            <Link href="/speaker/submit">Call for Speakers</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/form">Share Preferences</Link>
          </Button>
        </nav>

        <MobileMenu isLanding={isLanding} />
      </div>
    </header>
  );
}
