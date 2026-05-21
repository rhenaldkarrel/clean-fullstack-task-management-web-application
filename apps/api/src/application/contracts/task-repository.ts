import type { TaskEntity } from "../../domain/entities/task.js";

export interface TaskRepository {
  findById(id: string): Promise<TaskEntity | null>;
}
