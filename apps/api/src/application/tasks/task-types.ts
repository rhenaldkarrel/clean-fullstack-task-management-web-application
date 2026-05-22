import type { TaskStatus } from "../../domain/entities/task.js";

export type TaskDto = {
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

export type ListTasksDto = {
  items: TaskDto[];
  meta: TaskListMeta;
};
