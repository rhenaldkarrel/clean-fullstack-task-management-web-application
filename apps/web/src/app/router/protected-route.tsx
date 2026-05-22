import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-current-user-query";
import { useAuthSessionStore } from "@/features/auth/store/auth-session-store";
import { LoadingState } from "@/shared/components/states/loading-state";

export function ProtectedRoute() {
  const location = useLocation();
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const clearSession = useAuthSessionStore((state) => state.clearSession);
  const { isLoading, isError } = useCurrentUserQuery();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <LoadingState label="Validating session..." />
      </main>
    );
  }

  if (isError) {
    clearSession();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
