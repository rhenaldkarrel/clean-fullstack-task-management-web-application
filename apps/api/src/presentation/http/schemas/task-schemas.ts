import { z } from "zod";
import { TASK_STATUSES } from "../../../domain/entities/task.js";

const taskStatusSchema = z.enum(TASK_STATUSES);

export const taskParamsSchema = z.object({
  id: z.string().trim().min(1, "Task id is required")
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  status: taskStatusSchema.optional()
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title cannot be empty").optional(),
    description: z.string().trim().nullable().optional(),
    status: taskStatusSchema.optional()
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.status !== undefined,
    {
      message: "At least one field must be provided"
    }
  );

export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: taskStatusSchema.optional()
});
