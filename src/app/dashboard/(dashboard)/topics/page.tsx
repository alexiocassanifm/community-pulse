import { TopicsContent } from "./topics-content";

export const metadata = {
  title: "Topics of Interest - Dashboard",
};

export default function TopicsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Topics of Interest</h1>
        <p className="text-muted-foreground">
          Aggregated participant interest across topic categories.
        </p>
      </div>
      <TopicsContent />
    </div>
  );
}
