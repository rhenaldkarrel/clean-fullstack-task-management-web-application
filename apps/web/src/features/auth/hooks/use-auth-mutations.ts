import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";
import { loginApi, registerApi } from "../api/auth-api";
import { useAuthSessionStore } from "../store/auth-session-store";
import type { LoginRequest, RegisterRequest } from "../types/auth-api-types";

function resolveRedirectPath(
  fallbackPath: string,
  redirectedFrom?: Location | null
): string {
  if (!redirectedFrom) {
    return fallbackPath;
  }

  return `${redirectedFrom.pathname}${redirectedFrom.search}${redirectedFrom.hash}`;
}

export function useRegisterMutation(redirectedFrom?: Location | null) {
  const navigate = useNavigate();
  const setSession = useAuthSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: (input: RegisterRequest) => registerApi(input),
    onSuccess: (result) => {
      setSession({
        accessToken: result.accessToken,
        user: result.user
      });

      navigate(resolveRedirectPath("/dashboard", redirectedFrom), { replace: true });
    }
  });
}

export function useLoginMutation(redirectedFrom?: Location | null) {
  const navigate = useNavigate();
  const setSession = useAuthSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: (input: LoginRequest) => loginApi(input),
    onSuccess: (result) => {
      setSession({
        accessToken: result.accessToken,
        user: result.user
      });

      navigate(resolveRedirectPath("/dashboard", redirectedFrom), { replace: true });
    }
  });
}
