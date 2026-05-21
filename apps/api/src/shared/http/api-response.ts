export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return { data };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {})
    }
  };
}
