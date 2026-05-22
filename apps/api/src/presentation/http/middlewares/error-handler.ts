import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { type NextFunction, type Request, type Response } from 'express';
import { AppError } from '../../../shared/errors/app-error.js';
import { errorResponse } from '../../../shared/http/api-response.js';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res
      .status(error.statusCode)
      .json(errorResponse(error.code, error.message, error.details));
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json(
      errorResponse(
        'VALIDATION_ERROR',
        'Validation failed',
        error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      ),
    );
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(',')
        : String(error.meta?.target ?? '');

      if (target.includes('email')) {
        res
          .status(409)
          .json(
            errorResponse(
              'EMAIL_ALREADY_REGISTERED',
              'Email is already registered',
            ),
          );
        return;
      }

      if (target.includes('normalizedTitle')) {
        res
          .status(409)
          .json(
            errorResponse(
              'DUPLICATE_TASK_TITLE',
              'Task title already exists for this user',
            ),
          );
        return;
      }

      res
        .status(409)
        .json(errorResponse('CONFLICT', 'Resource already exists'));
      return;
    }
  }

  console.error('[api-error]', error);
  res
    .status(500)
    .json(
      errorResponse('INTERNAL_SERVER_ERROR', 'An unexpected error occurred'),
    );
}
