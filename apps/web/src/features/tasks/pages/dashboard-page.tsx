import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/states/empty-state";
import { ErrorState } from "@/shared/components/states/error-state";
import { LoadingState } from "@/shared/components/states/loading-state";
import { useDebouncedValue } from "@/shared/lib/hooks/use-debounced-value";
import { TaskFormDrawer } from "../components/task-form-drawer";
import { TaskList } from "../components/task-list";
import { TaskPagination } from "../components/task-pagination";
import { TaskStatsCards } from "../components/task-stats-cards";
import { TaskToolbar } from "../components/task-toolbar";
import { useDeleteTaskMutation } from "../hooks/use-task-mutations";
import { useTaskListQuery, useTaskStatsQueries } from "../hooks/use-task-queries";
import { useTaskUiStore } from "../store/task-ui-store";
import type { TaskStatus } from "../types/task-types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseStatus(value: string | null): TaskStatus | undefined {
  if (value === "todo" || value === "in_progress" || value === "done" || value === "canceled") {
    return value;
  }

  return undefined;
}

export function TaskDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const limit = parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
  const search = searchParams.get("search")?.trim() ?? "";
  const status = parseStatus(searchParams.get("status"));
  const statusFilter = status ?? "all";
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const listQuery = useTaskListQuery({
    page,
    limit,
    search: search || undefined,
    status
  });
  const statsQuery = useTaskStatsQueries();
  const deleteTaskMutation = useDeleteTaskMutation();
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const { isTaskDrawerOpen, drawerMode, selectedTaskId, openDrawer, closeDrawer } =
    useTaskUiStore();

  const hasFilters = search.length > 0 || Boolean(status);

  const updateParams = useCallback(
    (updates: {
      page?: number;
      limit?: number;
      search?: string;
      status?: TaskStatus | undefined;
    }) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);

        if (updates.page !== undefined) {
          next.set("page", String(updates.page));
        }

        if (updates.limit !== undefined) {
          next.set("limit", String(updates.limit));
        }

        if (updates.search !== undefined) {
          const nextSearch = updates.search.trim();

          if (nextSearch.length === 0) {
            next.delete("search");
          } else {
            next.set("search", nextSearch);
          }
        }

        if (updates.status !== undefined) {
          next.set("status", updates.status);
        } else if ("status" in updates) {
          next.delete("status");
        }

        return next;
      });
    },
    [setSearchParams]
  );

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const nextSearch = debouncedSearch.trim();

    if (nextSearch !== search) {
      updateParams({
        page: 1,
        search: nextSearch
      });
    }
  }, [debouncedSearch, search, updateParams]);

  useEffect(() => {
    const totalPages = listQuery.data?.meta.totalPages ?? 0;

    if (totalPages > 0 && page > totalPages) {
      updateParams({ page: totalPages });
    }
  }, [listQuery.data?.meta.totalPages, page, updateParams]);

  const emptyStateMessage = useMemo(() => {
    if (hasFilters) {
      return "No tasks match your current search or filter.";
    }

    return "Create your first task to start tracking your work.";
  }, [hasFilters]);

  async function handleDeleteTask(taskId: string) {
    setDeletingTaskId(taskId);

    try {
      await deleteTaskMutation.mutateAsync(taskId);
    } finally {
      setDeletingTaskId(null);
    }
  }

  function handleStatusChange(nextStatus: TaskStatus | "all") {
    updateParams({
      page: 1,
      status: nextStatus === "all" ? undefined : nextStatus
    });
  }

  function handleClearFilters() {
    setSearchInput("");
    updateParams({
      page: 1,
      search: "",
      status: undefined
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Dashboard"
        description="Track, search, and manage your tasks in one place."
        action={
          <Button className="gap-2" onClick={() => openDrawer("create")}>
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        }
      />

      <TaskStatsCards stats={statsQuery.stats} isLoading={statsQuery.isLoading} />

      <TaskToolbar
        search={searchInput}
        status={statusFilter}
        onSearchChange={setSearchInput}
        onStatusChange={handleStatusChange}
        onClearFilters={handleClearFilters}
        isLoading={listQuery.isLoading}
      />

      {listQuery.isLoading ? <LoadingState label="Loading tasks..." /> : null}

      {listQuery.isError ? (
        <ErrorState
          title="Failed to load tasks"
          message="Please try again. If the issue persists, check API connectivity."
          onRetry={() => listQuery.refetch()}
        />
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && listQuery.data?.data.length === 0 ? (
        <div className="space-y-3">
          <EmptyState title="No tasks found" message={emptyStateMessage} />
          {!hasFilters ? (
            <div className="flex justify-center">
              <Button className="gap-2" onClick={() => openDrawer("create")}>
                <Plus className="h-4 w-4" />
                Create First Task
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {!listQuery.isLoading && !listQuery.isError && listQuery.data?.data.length ? (
        <div className="space-y-3">
          <TaskList
            tasks={listQuery.data.data}
            deletingTaskId={deletingTaskId}
            onEditTask={(taskId) => openDrawer("edit", taskId)}
            onDeleteTask={handleDeleteTask}
          />
          <TaskPagination
            meta={listQuery.data.meta}
            onPageChange={(nextPage) => updateParams({ page: nextPage })}
            onLimitChange={(nextLimit) => updateParams({ page: 1, limit: nextLimit })}
            isLoading={listQuery.isFetching}
          />
        </div>
      ) : null}

      {statsQuery.isError ? (
        <ErrorState
          title="Failed to load task stats"
          message="Task list is still available, but stats could not be calculated."
          onRetry={() => {
            void statsQuery.refetch();
          }}
        />
      ) : null}

      <TaskFormDrawer
        isOpen={isTaskDrawerOpen}
        mode={drawerMode}
        taskId={selectedTaskId}
        onClose={closeDrawer}
      />
    </div>
  );
}

export function DashboardPage() {
  return <TaskDashboardPage />;
}
