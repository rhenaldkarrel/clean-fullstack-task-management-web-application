import type { TaskStatus } from "../../domain/entities/task.js";
import type { TaskRepository } from "../contracts/task-repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { toTaskDto } from "./task-mappers.js";
import { normalizeTaskTitle, sanitizeTaskTitle } from "./task-title.js";
import type { TaskDto } from "./task-types.js";

export type UpdateTaskInput = {
  userId: string;
  taskId: string;
  title?: string;
  description?: string | null;
  status?: TaskStatus;
};

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskInput): Promise<TaskDto> {
    const existingTask = await this.taskRepository.findByIdForUser(
      input.taskId,
      input.userId
    );

    if (!existingTask) {
      throw new AppError({
        statusCode: 404,
        code: "TASK_NOT_FOUND",
        message: "Task not found"
      });
    }

    let nextTitle: string | undefined;
    let nextNormalizedTitle: string | undefined;

    if (input.title !== undefined) {
      nextTitle = sanitizeTaskTitle(input.title);
      nextNormalizedTitle = normalizeTaskTitle(input.title);

      if (nextNormalizedTitle !== normalizeTaskTitle(existingTask.title)) {
        const duplicatedTask = await this.taskRepository.findByNormalizedTitleForUser(
          input.userId,
          nextNormalizedTitle
        );

        if (duplicatedTask && duplicatedTask.id !== existingTask.id) {
          throw new AppError({
            statusCode: 409,
            code: "DUPLICATE_TASK_TITLE",
            message: "Task title already exists for this user"
          });
        }
      }
    }

    const updatedTask = await this.taskRepository.updateByIdForUser(
      input.taskId,
      input.userId,
      {
        title: nextTitle,
        normalizedTitle: nextNormalizedTitle,
        description: input.description,
        status: input.status
      }
    );

    if (!updatedTask) {
      throw new AppError({
        statusCode: 404,
        code: "TASK_NOT_FOUND",
        message: "Task not found"
      });
    }

    return toTaskDto(updatedTask);
  }
}
