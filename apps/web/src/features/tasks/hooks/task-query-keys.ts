import type { ListTasksParams } from "../api/task-api";

export const taskQueryKeys = {
  all: ["tasks"] as const,
  list: (params: ListTasksParams) => ["tasks", "list", params] as const,
  detail: (taskId: string) => ["tasks", "detail", taskId] as const,
  statsTotal: ["tasks", "stats", "total"] as const,
  statsByStatus: (status: string) => ["tasks", "stats", status] as const
};
