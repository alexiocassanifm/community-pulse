import { type LucideIcon, FileQuestion } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

export function EmptyState({
  title = "No Submissions Yet",
  description = "Share the form link with your community to start collecting preferences.",
  icon: Icon = FileQuestion,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
