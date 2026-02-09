import { AvailabilityContent } from "./availability-content";

export const metadata = {
  title: "Availability - Dashboard",
};

export default function AvailabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="text-muted-foreground">
          Preferred meeting days and times from participant submissions.
        </p>
      </div>
      <AvailabilityContent />
    </div>
  );
}
