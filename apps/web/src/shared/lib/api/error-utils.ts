import { ApiError } from "./types";

type ValidationIssue = {
  path?: string;
  message?: string;
};

export function toApiError(error: unknown): ApiError | null {
  return error instanceof ApiError ? error : null;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Request failed. Please try again."
): string {
  const apiError = toApiError(error);
  return apiError?.message ?? fallback;
}

export function getApiValidationIssues(error: unknown): ValidationIssue[] {
  const apiError = toApiError(error);

  if (!apiError || !Array.isArray(apiError.details)) {
    return [];
  }

  return apiError.details
    .filter((detail): detail is ValidationIssue => typeof detail === "object" && detail !== null)
    .map((detail) => ({
      path: typeof detail.path === "string" ? detail.path : undefined,
      message: typeof detail.message === "string" ? detail.message : undefined
    }));
}
