import { requireAuth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen">
      <DashboardNav user={{ email: user.email ?? "" }} />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
