import { type NextFunction, type Request, type Response } from "express";
import { errorResponse } from "../../../shared/http/api-response.js";

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json(
    errorResponse("NOT_FOUND", `Route ${req.method} ${req.originalUrl} not found`)
  );
}
