import { Router } from "express";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import {
  createTaskController,
  deleteTaskController,
  getTaskDetailController,
  listTasksController,
  updateTaskController
} from "../controllers/task-controller.js";

export const taskRouter = Router();

taskRouter.use(requireAuth);
taskRouter.post("/", asyncHandler(createTaskController));
taskRouter.get("/", asyncHandler(listTasksController));
taskRouter.get("/:id", asyncHandler(getTaskDetailController));
taskRouter.patch("/:id", asyncHandler(updateTaskController));
taskRouter.delete("/:id", asyncHandler(deleteTaskController));
