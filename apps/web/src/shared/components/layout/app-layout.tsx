import type { PropsWithChildren } from "react";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useAuthSessionStore } from "@/features/auth/store/auth-session-store";

export function AppLayout({ children }: PropsWithChildren) {
  const clearSession = useAuthSessionStore((state) => state.clearSession);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold md:text-base">Task Management</p>
          </div>
          <Button variant="outline" size="sm" onClick={clearSession}>
            Clear Session
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
