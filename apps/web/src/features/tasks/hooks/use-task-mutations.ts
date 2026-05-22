import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTaskApi, deleteTaskApi, updateTaskApi } from "../api/task-api";
import { taskQueryKeys } from "./task-query-keys";
import type { CreateTaskInput, UpdateTaskInput } from "../types/task-types";

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTaskApi(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    }
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { taskId: string; payload: UpdateTaskInput }) =>
      updateTaskApi(input.taskId, input.payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: taskQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: taskQueryKeys.detail(variables.taskId)
        })
      ]);
    }
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTaskApi(taskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
    }
  });
}
