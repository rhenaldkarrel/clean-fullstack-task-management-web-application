import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { listTasksApi, type ListTasksParams, getTaskDetailApi } from "../api/task-api";
import { taskQueryKeys } from "./task-query-keys";
import { TASK_STATUSES, type TaskStats } from "../types/task-types";

export function useTaskListQuery(params: ListTasksParams) {
  return useQuery({
    queryKey: taskQueryKeys.list(params),
    queryFn: () => listTasksApi(params),
    placeholderData: (previousData) => previousData
  });
}

export function useTaskDetailQuery(taskId: string | null, enabled = true) {
  return useQuery({
    queryKey: taskQueryKeys.detail(taskId ?? "none"),
    queryFn: () => {
      if (!taskId) {
        throw new Error("Task id is required");
      }

      return getTaskDetailApi(taskId);
    },
    enabled: enabled && Boolean(taskId),
    staleTime: 30_000
  });
}

export function useTaskStatsQueries() {
  const totalQuery = useQuery({
    queryKey: taskQueryKeys.statsTotal,
    queryFn: () =>
      listTasksApi({
        page: 1,
        limit: 1
      }),
    staleTime: 30_000
  });

  const statusQueries = useQueries({
    queries: TASK_STATUSES.map((status) => ({
      queryKey: taskQueryKeys.statsByStatus(status),
      queryFn: () =>
        listTasksApi({
          page: 1,
          limit: 1,
          status
        }),
      staleTime: 30_000
    }))
  });

  const isLoading = totalQuery.isLoading || statusQueries.some((query) => query.isLoading);
  const isError = totalQuery.isError || statusQueries.some((query) => query.isError);
  const refetch = async () => {
    await Promise.all([totalQuery.refetch(), ...statusQueries.map((query) => query.refetch())]);
  };

  const stats = useMemo<TaskStats>(
    () => ({
      total: totalQuery.data?.meta.totalItems ?? 0,
      todo: statusQueries[0]?.data?.meta.totalItems ?? 0,
      inProgress: statusQueries[1]?.data?.meta.totalItems ?? 0,
      done: statusQueries[2]?.data?.meta.totalItems ?? 0,
      canceled: statusQueries[3]?.data?.meta.totalItems ?? 0
    }),
    [statusQueries, totalQuery.data?.meta.totalItems]
  );

  return {
    stats,
    isLoading,
    isError,
    refetch
  };
}
