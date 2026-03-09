import type { Metadata } from "next";
import { MeetupsContent } from "./meetups-content";

export const metadata: Metadata = { title: "Meetups — Dashboard" };

export default function MeetupsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meetups</h1>
        <p className="text-muted-foreground">Manage your meetup events</p>
      </div>
      <MeetupsContent />
    </div>
  );
}
