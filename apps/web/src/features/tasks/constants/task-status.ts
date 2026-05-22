import type { TaskStatus } from "../types/task-types";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled"
};

export function getTaskStatusBadgeClass(status: TaskStatus): string {
  switch (status) {
    case "todo":
      return "bg-slate-100 text-slate-700";
    case "in_progress":
      return "bg-amber-100 text-amber-700";
    case "done":
      return "bg-emerald-100 text-emerald-700";
    case "canceled":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}
