import type { TaskStatus } from "../../domain/entities/task.js";
import type { TaskRepository } from "../contracts/task-repository.js";
import { AppError } from "../../shared/errors/app-error.js";
import { toTaskDto } from "./task-mappers.js";
import { normalizeTaskTitle, sanitizeTaskTitle } from "./task-title.js";
import type { TaskDto } from "./task-types.js";

export type CreateTaskInput = {
  userId: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
};

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<TaskDto> {
    const sanitizedTitle = sanitizeTaskTitle(input.title);
    const normalizedTitle = normalizeTaskTitle(input.title);
    const existingTask = await this.taskRepository.findByNormalizedTitleForUser(
      input.userId,
      normalizedTitle
    );

    if (existingTask) {
      throw new AppError({
        statusCode: 409,
        code: "DUPLICATE_TASK_TITLE",
        message: "Task title already exists for this user"
      });
    }

    const createdTask = await this.taskRepository.create({
      userId: input.userId,
      title: sanitizedTitle,
      normalizedTitle,
      description: input.description ?? null,
      status: input.status ?? "todo"
    });

    return toTaskDto(createdTask);
  }
}
