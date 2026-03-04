import { TrendsContent } from "./trends-content";

export const metadata = {
  title: "Submission Trends - Dashboard",
};

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submission Trends</h1>
        <p className="text-muted-foreground">
          Track response volume over time and identify patterns.
        </p>
      </div>
      <TrendsContent />
    </div>
  );
}
