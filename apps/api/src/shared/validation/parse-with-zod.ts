import { type ZodTypeAny } from "zod";
import { AppError } from "../errors/app-error.js";

export function parseWithZod<TSchema extends ZodTypeAny>(
  schema: TSchema,
  payload: unknown
): ReturnType<TSchema["parse"]> {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError({
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  return parsed.data;
}
