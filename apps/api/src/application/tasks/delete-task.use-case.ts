import type { TaskRepository } from "../contracts/task-repository.js";
import { AppError } from "../../shared/errors/app-error.js";

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(userId: string, taskId: string): Promise<void> {
    const deleted = await this.taskRepository.deleteByIdForUser(taskId, userId);

    if (!deleted) {
      throw new AppError({
        statusCode: 404,
        code: "TASK_NOT_FOUND",
        message: "Task not found"
      });
    }
  }
}
