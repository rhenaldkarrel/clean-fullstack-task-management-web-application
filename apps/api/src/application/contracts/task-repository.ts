import type { TaskEntity, TaskStatus } from "../../domain/entities/task.js";

export type CreateTaskInput = {
  userId: string;
  title: string;
  normalizedTitle: string;
  description: string | null;
  status: TaskStatus;
};

export type UpdateTaskInput = {
  title?: string;
  normalizedTitle?: string;
  description?: string | null;
  status?: TaskStatus;
};

export type ListTasksInput = {
  userId: string;
  page: number;
  limit: number;
  search?: string;
  status?: TaskStatus;
};

export type ListTasksResult = {
  items: TaskEntity[];
  totalItems: number;
};

export interface TaskRepository {
  create(input: CreateTaskInput): Promise<TaskEntity>;
  findByIdForUser(taskId: string, userId: string): Promise<TaskEntity | null>;
  findByNormalizedTitleForUser(
    userId: string,
    normalizedTitle: string
  ): Promise<TaskEntity | null>;
  listByUser(input: ListTasksInput): Promise<ListTasksResult>;
  updateByIdForUser(
    taskId: string,
    userId: string,
    input: UpdateTaskInput
  ): Promise<TaskEntity | null>;
  deleteByIdForUser(taskId: string, userId: string): Promise<boolean>;
}
