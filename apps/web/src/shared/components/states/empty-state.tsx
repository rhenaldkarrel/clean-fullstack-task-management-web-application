import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title?: string;
  message?: string;
};

export function EmptyState({
  title = "No data yet",
  message = "When data is available, it will appear here."
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed bg-card p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-5 w-5 text-muted-foreground" />
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
