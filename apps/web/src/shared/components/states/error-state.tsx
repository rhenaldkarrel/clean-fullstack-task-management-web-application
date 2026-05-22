import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Failed to load data",
  message = "Something went wrong while contacting the server.",
  onRetry
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
        <div className="space-y-1">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
          {onRetry ? (
            <Button className="mt-2" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
