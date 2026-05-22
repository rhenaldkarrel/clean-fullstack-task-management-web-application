import type { PropsWithChildren } from "react";
import { LayoutDashboard } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-current-user-query";
import { useAuthSessionStore } from "@/features/auth/store/auth-session-store";

export function AppLayout({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentUser = useAuthSessionStore((state) => state.currentUser);
  const clearSession = useAuthSessionStore((state) => state.clearSession);
  useCurrentUserQuery();

  function handleLogout() {
    queryClient.removeQueries();
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold md:text-base">Task Management</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-xs text-muted-foreground sm:block">
              {currentUser?.email ?? "Authenticated User"}
            </p>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
