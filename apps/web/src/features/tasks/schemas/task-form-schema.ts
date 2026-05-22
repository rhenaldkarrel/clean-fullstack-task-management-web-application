import { z } from "zod";
import { TASK_STATUSES } from "../types/task-types";

const taskStatusSchema = z.enum(TASK_STATUSES);

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
  status: taskStatusSchema
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
