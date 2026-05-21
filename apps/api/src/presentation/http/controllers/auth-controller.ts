import { type Request, type Response } from "express";
import { AppError } from "../../../shared/errors/app-error.js";
import { successResponse } from "../../../shared/http/api-response.js";
import { parseWithZod } from "../../../shared/validation/parse-with-zod.js";
import {
  getCurrentUserUseCase,
  loginUserUseCase,
  registerUserUseCase
} from "../dependencies/auth-dependencies.js";
import { loginSchema, registerSchema } from "../schemas/auth-schemas.js";

export async function registerController(req: Request, res: Response): Promise<void> {
  const payload = parseWithZod(registerSchema, req.body);
  const result = await registerUserUseCase.execute(payload);
  res.status(201).json(successResponse(result));
}

export async function loginController(req: Request, res: Response): Promise<void> {
  const payload = parseWithZod(loginSchema, req.body);
  const result = await loginUserUseCase.execute(payload);
  res.status(200).json(successResponse(result));
}

export async function meController(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    throw new AppError({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Missing authenticated user context"
    });
  }

  const currentUser = await getCurrentUserUseCase.execute(req.authUser.userId);
  res.status(200).json(successResponse(currentUser));
}
