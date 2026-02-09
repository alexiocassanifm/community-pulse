import { Suspense } from "react";
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
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
