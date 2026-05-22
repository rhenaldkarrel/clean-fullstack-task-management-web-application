import { type Request, type Response } from "express";
import { AppError } from "../../../shared/errors/app-error.js";
import { successResponse } from "../../../shared/http/api-response.js";
import { parseWithZod } from "../../../shared/validation/parse-with-zod.js";
import { getTaskDependencies } from "../dependencies/task-dependencies.js";
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskParamsSchema,
  updateTaskSchema
} from "../schemas/task-schemas.js";

function getAuthUserId(req: Request): string {
  if (!req.authUser) {
    throw new AppError({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Missing authenticated user context"
    });
  }

  return req.authUser.userId;
}

export async function createTaskController(req: Request, res: Response): Promise<void> {
  const payload = parseWithZod(createTaskSchema, req.body);
  const userId = getAuthUserId(req);
  const { createTaskUseCase } = getTaskDependencies();

  const task = await createTaskUseCase.execute({
    userId,
    title: payload.title,
    description: payload.description ?? null,
    status: payload.status
  });

  res.status(201).json(successResponse(task));
}

export async function listTasksController(req: Request, res: Response): Promise<void> {
  const query = parseWithZod(listTasksQuerySchema, req.query);
  const userId = getAuthUserId(req);
  const { listTasksUseCase } = getTaskDependencies();

  const result = await listTasksUseCase.execute({
    userId,
    page: query.page,
    limit: query.limit,
    search: query.search,
    status: query.status
  });

  res.status(200).json({
    data: result.items,
    meta: result.meta
  });
}

export async function getTaskDetailController(
  req: Request,
  res: Response
): Promise<void> {
  const params = parseWithZod(taskParamsSchema, req.params);
  const userId = getAuthUserId(req);
  const { getTaskDetailUseCase } = getTaskDependencies();
  const task = await getTaskDetailUseCase.execute(userId, params.id);

  res.status(200).json(successResponse(task));
}

export async function updateTaskController(req: Request, res: Response): Promise<void> {
  const params = parseWithZod(taskParamsSchema, req.params);
  const payload = parseWithZod(updateTaskSchema, req.body);
  const userId = getAuthUserId(req);
  const { updateTaskUseCase } = getTaskDependencies();

  const task = await updateTaskUseCase.execute({
    userId,
    taskId: params.id,
    title: payload.title,
    description: payload.description,
    status: payload.status
  });

  res.status(200).json(successResponse(task));
}

export async function deleteTaskController(req: Request, res: Response): Promise<void> {
  const params = parseWithZod(taskParamsSchema, req.params);
  const userId = getAuthUserId(req);
  const { deleteTaskUseCase } = getTaskDependencies();

  await deleteTaskUseCase.execute(userId, params.id);
  res.status(204).send();
}
