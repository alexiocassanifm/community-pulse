# Work Package: Frontend - US-0106 Secure Organizer Authentication

**Task ID**: US-2026-0106 (Tasks 96, 99, 100)
**Date Created**: 2026-02-08
**Created By**: Atlas (Tech Lead)
**Skill(s) to Load**: `frontend-react-nextjs`

## Task Overview

Implement the frontend components for organizer authentication: login page with form validation, logout button, dashboard navigation with responsive design, and dashboard layout with route groups.

**Depends on**: Backend work package (US-0106_backend_workpackage.md) must be completed first, as frontend components depend on server actions, auth utilities, and the login validation schema.

## Execution Plan

### Step 1: Create login validation schema

**File: `src/lib/validations/login.ts`** (NEW)

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### Step 2: Create LoginForm component

**File: `src/components/dashboard/LoginForm.tsx`** (NEW)

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginFormData } from "@/lib/validations/login";
import { signInAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const urlError = searchParams.get("error");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const result = await signInAction(data.email, data.password);

      if (result.error) {
        setServerError(result.error);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        {(serverError || urlError === "unauthorized") && (
          <Alert variant="destructive" className="mb-4">
            {serverError || "You are not authorized to access the dashboard."}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="organizer@example.com"
              autoComplete="email"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Create login page with route group

**Directory structure**:
```
src/app/dashboard/
  (auth)/
    login/
      page.tsx      ← Login page (no dashboard nav)
  (dashboard)/
    layout.tsx      ← Dashboard layout with nav
    page.tsx        ← Dashboard home placeholder
```

**File: `src/app/dashboard/(auth)/login/page.tsx`** (NEW)

```typescript
import { LoginForm } from "@/components/dashboard/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Organizer Dashboard",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to access event analytics
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

### Step 4: Create LogoutButton component

**File: `src/components/auth/LogoutButton.tsx`** (NEW)

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/dashboard/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
```

### Step 5: Create DashboardNav component

**File: `src/components/dashboard/DashboardNav.tsx`** (NEW)

Props: `user: { email: string }`

Navigation links (these are placeholders for future US-0107 through US-0114):
- Overview: `/dashboard` (icon: LayoutDashboard)
- Trends: `/dashboard/trends` (icon: TrendingUp)
- Availability: `/dashboard/availability` (icon: Calendar)
- Formats: `/dashboard/formats` (icon: BarChart3)
- Demographics: `/dashboard/demographics` (icon: Users)

Features:
- Desktop: fixed sidebar (w-64) with links, user email at bottom, logout button
- Mobile: hamburger button + Sheet component for slide-out nav
- Active route highlighting via `usePathname()` and `cn()` utility
- Icons from `lucide-react` (already installed)
- Uses shadcn/ui: Button, Sheet, SheetContent, SheetTrigger

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  TrendingUp,
  Calendar,
  BarChart3,
  Users,
  Menu,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/trends", label: "Trends", icon: TrendingUp },
  { href: "/dashboard/availability", label: "Availability", icon: Calendar },
  { href: "/dashboard/formats", label: "Formats", icon: BarChart3 },
  { href: "/dashboard/demographics", label: "Demographics", icon: Users },
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
            <NavContent />
          </SheetContent>
        </Sheet>
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
    </>
  );
}
```

### Step 6: Create dashboard layout

**File: `src/app/dashboard/(dashboard)/layout.tsx`** (NEW)

```typescript
import { requireAuth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="flex min-h-screen">
      <DashboardNav user={{ email: session.user.email ?? "" }} />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
```

### Step 7: Create dashboard placeholder page

**File: `src/app/dashboard/(dashboard)/page.tsx`** (NEW)

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Dashboard - Organizer",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
      <p className="text-muted-foreground">
        Analytics and insights for your meetup events.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Active Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">
              Coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### Step 8: Handle root layout Navigation visibility

The root `src/app/layout.tsx` includes `<Navigation />` which should NOT appear on dashboard pages. Two approaches:

**Option A (Recommended)**: Update the `Navigation` component to conditionally hide on dashboard routes using `usePathname()`.

**Option B**: Use route groups at the app level - `(public)` and `(dashboard)` - but this is more invasive.

The implementer should examine the `Navigation` component and add a pathname check:
```typescript
const pathname = usePathname();
if (pathname.startsWith("/dashboard")) return null;
```

## Architectural Constraints

- All interactive components must have `"use client"` directive
- Follow existing patterns: shadcn/ui components, cn() for conditional classes
- Use existing component library: Button, Input, Label, Card, Alert, Sheet
- Icons from lucide-react (already installed)
- Forms use react-hook-form + zodResolver pattern (same as existing form)
- File naming: kebab-case files, PascalCase components
- Route groups `(auth)` and `(dashboard)` to separate login from dashboard layout

## Dependencies

- Backend work package must be completed first (auth utilities, server actions)
- Existing: shadcn/ui components, react-hook-form, @hookform/resolvers, zod, lucide-react

## Acceptance Criteria

From US-0106:
- AC2: Login page at `/dashboard/login` with email/password, RHF+Zod validation, error messages, redirect on success
- AC5: Logout button in dashboard navigation, clears session, redirects to login
- AC3 (UI part): Post-login redirect preserves `redirectTo` param

## Validation Requirements

- Login page renders correctly at `/dashboard/login`
- Form validation shows errors for empty fields and invalid email
- Loading state shows during authentication
- Error message displays for invalid credentials
- Post-login redirect to `/dashboard` (or `redirectTo` param value)
- Dashboard layout shows sidebar nav on desktop, hamburger on mobile
- Active route highlighted in navigation
- Logout button works and redirects to login
- Responsive design: test at 375px, 768px, 1024px, 1440px

## Expected Deliverables

| File | Status |
|------|--------|
| `src/lib/validations/login.ts` | NEW |
| `src/components/dashboard/LoginForm.tsx` | NEW |
| `src/app/dashboard/(auth)/login/page.tsx` | NEW |
| `src/components/auth/LogoutButton.tsx` | NEW |
| `src/components/dashboard/DashboardNav.tsx` | NEW |
| `src/app/dashboard/(dashboard)/layout.tsx` | NEW |
| `src/app/dashboard/(dashboard)/page.tsx` | NEW |
| Navigation component | MODIFIED (hide on dashboard routes) |

## Journal Requirements

Maintain journal at: `fairmind/journals/US-0106_echo_frontend_journal.md`
Update after each significant action or decision.
