import { apiClient } from "@/shared/lib/api/api-client";
import type {
  AuthSuccessResponse,
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest
} from "../types/auth-api-types";

export async function registerApi(input: RegisterRequest) {
  const response = await apiClient.post<AuthSuccessResponse>("/auth/register", input);
  return response.data;
}

export async function loginApi(input: LoginRequest) {
  const response = await apiClient.post<AuthSuccessResponse>("/auth/login", input);
  return response.data;
}

export async function getCurrentUserApi() {
  const response = await apiClient.get<CurrentUserResponse>("/auth/me");
  return response.data;
}
