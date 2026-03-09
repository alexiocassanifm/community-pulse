"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  TrendingUp,
  Calendar,
  BarChart3,
  Tags,
  Users,
  CalendarDays,
  Mic2,
  Settings,
  Menu,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/trends", label: "Trends", icon: TrendingUp },
  { href: "/dashboard/availability", label: "Availability", icon: Calendar },
  { href: "/dashboard/formats", label: "Formats", icon: BarChart3 },
  { href: "/dashboard/topics", label: "Topics", icon: Tags },
  { href: "/dashboard/demographics", label: "Demographics", icon: Users },
  { href: "/dashboard/meetups", label: "Meetups", icon: CalendarDays },
  { href: "/dashboard/speakers", label: "Speakers", icon: Mic2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardNavProps {
  user: { email: string };
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  const NavContent = () => (
    <>
      <div className="mb-8 px-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t px-4 py-4">
        <LogoutButton />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:py-6">
        <NavContent />
      </aside>

      {/* Mobile hamburger */}
      <div className="sticky top-0 z-40 flex items-center gap-4 border-b bg-background px-4 py-3 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 pt-6">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <NavContent />
          </SheetContent>
        </Sheet>
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
    </>
  );
}
