export type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(params: {
    status: number;
    code?: string;
    message?: string;
    details?: unknown;
  }) {
    super(params.message ?? "Request failed");
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code ?? "UNKNOWN_ERROR";
    this.details = params.details;
  }
}
