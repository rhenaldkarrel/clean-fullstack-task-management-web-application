import type {
  CreateTaskInput,
  ListTasksInput,
  ListTasksResult,
  TaskRepository,
  UpdateTaskInput,
} from '../../application/contracts/task-repository.js';
import type { TaskEntity } from '../../domain/entities/task.js';
import { prismaClient } from '../prisma/client.js';

function toTaskEntity(data: {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done' | 'canceled';
  createdAt: Date;
  updatedAt: Date;
}): TaskEntity {
  return {
    id: data.id,
    userId: data.userId,
    title: data.title,
    description: data.description,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export class PrismaTaskRepository implements TaskRepository {
  async create(input: CreateTaskInput): Promise<TaskEntity> {
    const task = await prismaClient.task.create({
      data: {
        userId: input.userId,
        title: input.title,
        normalizedTitle: input.normalizedTitle,
        description: input.description,
        status: input.status,
      },
    });

    return toTaskEntity(task);
  }

  async findByIdForUser(
    taskId: string,
    userId: string,
  ): Promise<TaskEntity | null> {
    const task = await prismaClient.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    return task ? toTaskEntity(task) : null;
  }

  async findByNormalizedTitleForUser(
    userId: string,
    normalizedTitle: string,
  ): Promise<TaskEntity | null> {
    const task = await prismaClient.task.findFirst({
      where: {
        userId,
        normalizedTitle,
      },
    });

    return task ? toTaskEntity(task) : null;
  }

  async listByUser(input: ListTasksInput): Promise<ListTasksResult> {
    const where = {
      userId: input.userId,
      ...(input.status ? { status: input.status } : {}),
      ...(input.search ? { normalizedTitle: { contains: input.search } } : {}),
    };
    const skip = (input.page - 1) * input.limit;

    const [items, totalItems] = await Promise.all([
      prismaClient.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: input.limit,
      }),
      prismaClient.task.count({ where }),
    ]);

    return {
      items: items.map(toTaskEntity),
      totalItems,
    };
  }

  async updateByIdForUser(
    taskId: string,
    userId: string,
    input: UpdateTaskInput,
  ): Promise<TaskEntity | null> {
    const data: UpdateTaskInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.normalizedTitle !== undefined)
      data.normalizedTitle = input.normalizedTitle;
    if (input.description !== undefined) data.description = input.description;
    if (input.status !== undefined) data.status = input.status;

    const updated = await prismaClient.task.updateMany({
      where: {
        id: taskId,
        userId,
      },
      data,
    });

    if (updated.count === 0) {
      return null;
    }

    const task = await prismaClient.task.findUnique({
      where: { id: taskId },
    });

    return task ? toTaskEntity(task) : null;
  }

  async deleteByIdForUser(taskId: string, userId: string): Promise<boolean> {
    const result = await prismaClient.task.deleteMany({
      where: {
        id: taskId,
        userId,
      },
    });

    return result.count > 0;
  }
}
