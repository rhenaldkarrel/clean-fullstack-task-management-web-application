import type { TaskStatus } from "../../domain/entities/task.js";
import type { TaskRepository } from "../contracts/task-repository.js";
import { toTaskDto } from "./task-mappers.js";
import { normalizeSearchTerm } from "./task-title.js";
import type { ListTasksDto } from "./task-types.js";

export type ListTasksInput = {
  userId: string;
  page: number;
  limit: number;
  search?: string;
  status?: TaskStatus;
};

export class ListTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: ListTasksInput): Promise<ListTasksDto> {
    const normalizedSearch = input.search ? normalizeSearchTerm(input.search) : "";
    const page = input.page;
    const limit = input.limit;

    const { items, totalItems } = await this.taskRepository.listByUser({
      userId: input.userId,
      page,
      limit,
      search: normalizedSearch.length > 0 ? normalizedSearch : undefined,
      status: input.status
    });

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

    return {
      items: items.map(toTaskDto),
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: totalPages > 0 && page < totalPages,
        hasPreviousPage: totalPages > 0 && page > 1
      }
    };
  }
}
