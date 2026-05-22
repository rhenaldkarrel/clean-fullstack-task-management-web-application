import { useAuthSessionStore } from "@/features/auth/store/auth-session-store";
import { API_BASE_URL } from "./env";
import { ApiError, type ApiErrorPayload } from "./types";

type RequestConfig = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function request<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const token = useAuthSessionStore.getState().accessToken;
  const headers: Record<string, string> = {
    ...(config.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...config.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: config.method ?? "GET",
    headers,
    body: config.body !== undefined ? JSON.stringify(config.body) : undefined
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    const payload =
      typeof responseBody === "object" && responseBody !== null
        ? (responseBody as ApiErrorPayload)
        : undefined;

    throw new ApiError({
      status: response.status,
      code: payload?.error?.code,
      message: payload?.error?.message ?? response.statusText,
      details: payload?.error?.details
    });
  }

  return responseBody as T;
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body }),
  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PATCH", body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" })
};
