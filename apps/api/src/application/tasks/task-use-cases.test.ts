import { describe, expect, it } from 'vitest';
import { AppError } from '../../shared/errors/app-error.js';
import type {
  CreateTaskInput,
  ListTasksInput,
  ListTasksResult,
  TaskRepository,
  UpdateTaskInput,
} from '../contracts/task-repository.js';
import type { TaskEntity } from '../../domain/entities/task.js';
import { CreateTaskUseCase } from './create-task.use-case.js';
import { DeleteTaskUseCase } from './delete-task.use-case.js';
import { GetTaskDetailUseCase } from './get-task-detail.use-case.js';
import { ListTasksUseCase } from './list-tasks.use-case.js';
import { UpdateTaskUseCase } from './update-task.use-case.js';

class InMemoryTaskRepository implements TaskRepository {
  private tasks: TaskEntity[] = [];

  async create(input: CreateTaskInput): Promise<TaskEntity> {
    const now = new Date();
    const task: TaskEntity = {
      id: `task-${this.tasks.length + 1}`,
      userId: input.userId,
      title: input.title,
      description: input.description,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.push(task);
    return task;
  }

  async findByIdForUser(
    taskId: string,
    userId: string,
  ): Promise<TaskEntity | null> {
    return (
      this.tasks.find((task) => task.id === taskId && task.userId === userId) ??
      null
    );
  }

  async findByNormalizedTitleForUser(
    userId: string,
    normalizedTitle: string,
  ): Promise<TaskEntity | null> {
    return (
      this.tasks.find(
        (task) =>
          task.userId === userId &&
          task.title.trim().replace(/\s+/g, ' ').toLowerCase() ===
            normalizedTitle,
      ) ?? null
    );
  }

  async listByUser(input: ListTasksInput): Promise<ListTasksResult> {
    const filtered = this.tasks
      .filter((task) => task.userId === input.userId)
      .filter((task) => (input.status ? task.status === input.status : true))
      .filter((task) =>
        input.search
          ? task.title.toLowerCase().replace(/\s+/g, ' ').includes(input.search)
          : true,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const skip = (input.page - 1) * input.limit;

    return {
      items: filtered.slice(skip, skip + input.limit),
      totalItems: filtered.length,
    };
  }

  async updateByIdForUser(
    taskId: string,
    userId: string,
    input: UpdateTaskInput,
  ): Promise<TaskEntity | null> {
    const index = this.tasks.findIndex(
      (task) => task.id === taskId && task.userId === userId,
    );

    if (index === -1) {
      return null;
    }

    const current = this.tasks[index];
    const updated: TaskEntity = {
      ...current,
      title: input.title ?? current.title,
      description: input.description ?? current.description,
      status: input.status ?? current.status,
      updatedAt: new Date(),
    };

    this.tasks[index] = updated;
    return updated;
  }

  async deleteByIdForUser(taskId: string, userId: string): Promise<boolean> {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter(
      (task) => !(task.id === taskId && task.userId === userId),
    );
    return this.tasks.length < before;
  }
}

describe('Task use-cases', () => {
  it('create task success', async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository);

    const task = await useCase.execute({
      userId: 'user-1',
      title: '  Write docs   ',
      description: 'Task description',
    });

    expect(task.title).toBe('Write docs');
    expect(task.status).toBe('todo');
  });

  it('duplicate task title rejected per user with case-insensitive whitespace-insensitive rule', async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository);

    await useCase.execute({
      userId: 'user-1',
      title: 'Write Docs',
      description: null,
    });

    await expect(
      useCase.execute({
        userId: 'user-1',
        title: '  write   docs ',
        description: null,
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'DUPLICATE_TASK_TITLE',
    } satisfies Partial<AppError>);
  });

  it('allows same task title for different users', async () => {
    const repository = new InMemoryTaskRepository();
    const useCase = new CreateTaskUseCase(repository);

    const first = await useCase.execute({
      userId: 'user-1',
      title: 'Weekly Sync',
      description: null,
    });
    const second = await useCase.execute({
      userId: 'user-2',
      title: '  weekly   sync ',
      description: null,
    });

    expect(first.id).not.toBe(second.id);
    expect(first.title).toBe('Weekly Sync');
    expect(second.title).toBe('weekly sync');
  });

  it('list tasks supports pagination, search, and filter', async () => {
    const repository = new InMemoryTaskRepository();
    const createTaskUseCase = new CreateTaskUseCase(repository);
    const listTaskUseCase = new ListTasksUseCase(repository);

    await createTaskUseCase.execute({
      userId: 'user-1',
      title: 'Alpha Task',
      status: 'todo',
    });
    await createTaskUseCase.execute({
      userId: 'user-1',
      title: 'Beta Task',
      status: 'done',
    });
    await createTaskUseCase.execute({
      userId: 'user-1',
      title: 'Gamma Task',
      status: 'done',
    });
    await createTaskUseCase.execute({
      userId: 'user-2',
      title: 'Should Not Be Listed',
      status: 'done',
    });

    const result = await listTaskUseCase.execute({
      userId: 'user-1',
      page: 1,
      limit: 1,
      search: 'task',
      status: 'done',
    });

    expect(result.items).toHaveLength(1);
    expect(result.meta.totalItems).toBe(2);
    expect(result.meta.totalPages).toBe(2);
  });

  it('get detail returns not found for unowned task', async () => {
    const repository = new InMemoryTaskRepository();
    const createTaskUseCase = new CreateTaskUseCase(repository);
    const detailUseCase = new GetTaskDetailUseCase(repository);
    const createdTask = await createTaskUseCase.execute({
      userId: 'user-1',
      title: 'Owned Task',
    });

    await expect(
      detailUseCase.execute('user-2', createdTask.id),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'TASK_NOT_FOUND',
    } satisfies Partial<AppError>);
  });

  it('update only owned task', async () => {
    const repository = new InMemoryTaskRepository();
    const createTaskUseCase = new CreateTaskUseCase(repository);
    const updateUseCase = new UpdateTaskUseCase(repository);
    const createdTask = await createTaskUseCase.execute({
      userId: 'user-1',
      title: 'Draft Task',
    });

    await expect(
      updateUseCase.execute({
        userId: 'user-2',
        taskId: createdTask.id,
        status: 'done',
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'TASK_NOT_FOUND',
    } satisfies Partial<AppError>);
  });

  it('delete only owned task', async () => {
    const repository = new InMemoryTaskRepository();
    const createTaskUseCase = new CreateTaskUseCase(repository);
    const deleteUseCase = new DeleteTaskUseCase(repository);
    const createdTask = await createTaskUseCase.execute({
      userId: 'user-1',
      title: 'Task to Delete',
    });

    await expect(
      deleteUseCase.execute('user-2', createdTask.id),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'TASK_NOT_FOUND',
    } satisfies Partial<AppError>);
  });
});
