import { apiClient } from "@/shared/lib/api/api-client";
import type {
  CreateTaskInput,
  ListTasksResponse,
  TaskDetailResponse,
  TaskStatus,
  UpdateTaskInput
} from "../types/task-types";

export type ListTasksParams = {
  page: number;
  limit: number;
  search?: string;
  status?: TaskStatus;
};

function buildListTasksQuery(params: ListTasksParams): string {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("limit", String(params.limit));

  if (params.search && params.search.trim().length > 0) {
    query.set("search", params.search.trim());
  }

  if (params.status) {
    query.set("status", params.status);
  }

  return query.toString();
}

export async function listTasksApi(params: ListTasksParams) {
  const query = buildListTasksQuery(params);
  return apiClient.get<ListTasksResponse>(`/tasks?${query}`);
}

export async function getTaskDetailApi(taskId: string) {
  const response = await apiClient.get<TaskDetailResponse>(`/tasks/${taskId}`);
  return response.data;
}

export async function createTaskApi(input: CreateTaskInput) {
  const response = await apiClient.post<TaskDetailResponse>("/tasks", input);
  return response.data;
}

export async function updateTaskApi(taskId: string, input: UpdateTaskInput) {
  const response = await apiClient.patch<TaskDetailResponse>(`/tasks/${taskId}`, input);
  return response.data;
}

export async function deleteTaskApi(taskId: string) {
  await apiClient.delete<unknown>(`/tasks/${taskId}`);
}
