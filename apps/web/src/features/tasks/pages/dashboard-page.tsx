import { useState } from "react";
import { EmptyState } from "@/shared/components/states/empty-state";
import { ErrorState } from "@/shared/components/states/error-state";
import { LoadingState } from "@/shared/components/states/loading-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { useTaskUiStore } from "../store/task-ui-store";

export function DashboardPage() {
  const [view, setView] = useState<"empty" | "loading" | "error">("empty");
  const { isTaskDrawerOpen, drawerMode, selectedTaskId, openDrawer, closeDrawer } =
    useTaskUiStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Frontend foundation is ready. Task UI detail akan masuk phase berikutnya."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => openDrawer("create")}>
              Open Create State
            </Button>
            <Button variant="outline" onClick={() => openDrawer("edit", "task-123")}>
              Open Edit State
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drawer UI State</CardTitle>
            <CardDescription>Zustand untuk UI-only state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>Open: {String(isTaskDrawerOpen)}</p>
            <p>Mode: {drawerMode}</p>
            <p>Selected Task: {selectedTaskId ?? "-"}</p>
            <Button className="mt-3" size="sm" variant="secondary" onClick={closeDrawer}>
              Reset Drawer State
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">State Components</CardTitle>
            <CardDescription>
              Loading/Error/Empty reusable component baseline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setView("empty")}>
                Empty
              </Button>
              <Button size="sm" variant="outline" onClick={() => setView("loading")}>
                Loading
              </Button>
              <Button size="sm" variant="outline" onClick={() => setView("error")}>
                Error
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Confirm Dialog</CardTitle>
            <CardDescription>shadcn-style dialog siap dipakai.</CardDescription>
          </CardHeader>
          <CardContent>
            <ConfirmDialog
              title="Confirm Action"
              description="Ini hanya contoh komponen konfirmasi untuk workflow task nanti."
              triggerLabel="Open Confirm"
              onConfirm={() => undefined}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {view === "empty" ? <EmptyState title="No tasks yet" /> : null}
        {view === "loading" ? <LoadingState label="Loading task list..." /> : null}
        {view === "error" ? (
          <ErrorState
            title="Failed to fetch tasks"
            message="API integration for task list akan diimplementasikan di phase dashboard."
          />
        ) : null}
      </div>
    </div>
  );
}
