import type { TaskEntity } from "../../domain/entities/task.js";
import type { TaskDto } from "./task-types.js";

export function toTaskDto(task: TaskEntity): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };
}
