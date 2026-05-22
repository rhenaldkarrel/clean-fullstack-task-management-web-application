export const TASK_STATUSES = ["todo", "in_progress", "done", "canceled"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskListMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ListTasksResponse = {
  data: TaskItem[];
  meta: TaskListMeta;
};

export type TaskDetailResponse = {
  data: TaskItem;
};

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
};

export type TaskStats = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  canceled: number;
};
