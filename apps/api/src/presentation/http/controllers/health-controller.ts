import { type Request, type Response } from "express";
import { GetHealthUseCase } from "../../../application/health/get-health.use-case.js";
import { successResponse } from "../../../shared/http/api-response.js";

const getHealthUseCase = new GetHealthUseCase();

export function getHealthController(_req: Request, res: Response): void {
  const result = getHealthUseCase.execute();
  res.status(200).json(successResponse(result));
}
