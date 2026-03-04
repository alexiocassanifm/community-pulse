import { DemographicsContent } from "./demographics-content";

export const metadata = {
  title: "Audience Demographics - Dashboard",
};

export default function DemographicsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audience Demographics</h1>
        <p className="text-muted-foreground">
          Participant distribution by role, experience level, industry, and
          skills.
        </p>
      </div>
      <DemographicsContent />
    </div>
  );
}
