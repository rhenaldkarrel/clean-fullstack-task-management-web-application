import { CreateTaskUseCase } from "../../../application/tasks/create-task.use-case.js";
import { DeleteTaskUseCase } from "../../../application/tasks/delete-task.use-case.js";
import { GetTaskDetailUseCase } from "../../../application/tasks/get-task-detail.use-case.js";
import { ListTasksUseCase } from "../../../application/tasks/list-tasks.use-case.js";
import { UpdateTaskUseCase } from "../../../application/tasks/update-task.use-case.js";
import type { TaskRepository } from "../../../application/contracts/task-repository.js";
import { PrismaTaskRepository } from "../../../infrastructure/repositories/prisma-task-repository.js";

export type TaskDependencies = {
  createTaskUseCase: CreateTaskUseCase;
  listTasksUseCase: ListTasksUseCase;
  getTaskDetailUseCase: GetTaskDetailUseCase;
  updateTaskUseCase: UpdateTaskUseCase;
  deleteTaskUseCase: DeleteTaskUseCase;
};

export function createTaskDependencies(taskRepository: TaskRepository): TaskDependencies {
  return {
    createTaskUseCase: new CreateTaskUseCase(taskRepository),
    listTasksUseCase: new ListTasksUseCase(taskRepository),
    getTaskDetailUseCase: new GetTaskDetailUseCase(taskRepository),
    updateTaskUseCase: new UpdateTaskUseCase(taskRepository),
    deleteTaskUseCase: new DeleteTaskUseCase(taskRepository)
  };
}

const defaultTaskDependencies = createTaskDependencies(new PrismaTaskRepository());
let activeTaskDependencies = defaultTaskDependencies;

export function getTaskDependencies(): TaskDependencies {
  return activeTaskDependencies;
}

export function setTaskDependenciesForTesting(
  taskDependencies: TaskDependencies
): void {
  activeTaskDependencies = taskDependencies;
}

export function resetTaskDependenciesForTesting(): void {
  activeTaskDependencies = defaultTaskDependencies;
}
