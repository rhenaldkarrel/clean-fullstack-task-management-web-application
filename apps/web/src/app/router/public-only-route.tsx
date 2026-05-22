import { Navigate, Outlet } from "react-router-dom";
import { useAuthSessionStore } from "@/features/auth/store/auth-session-store";

export function PublicOnlyRoute() {
  const accessToken = useAuthSessionStore((state) => state.accessToken);

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
