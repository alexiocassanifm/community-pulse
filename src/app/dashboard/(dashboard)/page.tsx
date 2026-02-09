import { Suspense } from "react";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { MetricsGridSkeleton } from "@/components/dashboard/MetricsGridSkeleton";

export const metadata = {
  title: "Dashboard - Organizer",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Analytics and insights for your meetup events.
        </p>
      </div>

      <Suspense fallback={<MetricsGridSkeleton />}>
        <MetricsGrid />
      </Suspense>
    </div>
  );
}
