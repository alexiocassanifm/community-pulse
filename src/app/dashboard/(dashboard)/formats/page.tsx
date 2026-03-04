import { FormatsContent } from "./formats-content";

export const metadata = {
  title: "Event Formats - Dashboard",
};

export default function FormatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Format Preferences</h1>
        <p className="text-muted-foreground">
          Preferred event formats and delivery modes from participant
          submissions.
        </p>
      </div>
      <FormatsContent />
    </div>
  );
}
