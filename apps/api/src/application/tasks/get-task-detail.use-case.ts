import type { TaskRepository } from "../contracts/task-repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { toTaskDto } from "./task-mappers.js";
import type { TaskDto } from "./task-types.js";

export class GetTaskDetailUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(userId: string, taskId: string): Promise<TaskDto> {
    const task = await this.taskRepository.findByIdForUser(taskId, userId);

    if (!task) {
      throw new AppError({
        statusCode: 404,
        code: "TASK_NOT_FOUND",
        message: "Task not found"
      });
    }

    return toTaskDto(task);
  }
}
