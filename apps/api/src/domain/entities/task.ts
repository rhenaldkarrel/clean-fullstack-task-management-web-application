export const TASK_STATUSES = ["todo", "in_progress", "done", "canceled"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskEntity = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
};
