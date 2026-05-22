import { useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { useZodForm } from "@/shared/lib/forms/use-zod-form";
import { getApiErrorMessage, getApiValidationIssues } from "@/shared/lib/api/error-utils";
import { ErrorState } from "@/shared/components/states/error-state";
import { LoadingState } from "@/shared/components/states/loading-state";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { TASK_STATUS_LABELS } from "../constants/task-status";
import { useCreateTaskMutation, useUpdateTaskMutation } from "../hooks/use-task-mutations";
import { useTaskDetailQuery } from "../hooks/use-task-queries";
import { taskFormSchema, type TaskFormValues } from "../schemas/task-form-schema";
import { TASK_STATUSES } from "../types/task-types";

type TaskFormDrawerProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  taskId: string | null;
  onClose: () => void;
};

const defaultFormValues: TaskFormValues = {
  title: "",
  description: "",
  status: "todo"
};

export function TaskFormDrawer({ isOpen, mode, taskId, onClose }: TaskFormDrawerProps) {
  const form = useZodForm(taskFormSchema, {
    defaultValues: defaultFormValues
  });

  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const detailQuery = useTaskDetailQuery(taskId, isOpen && mode === "edit");
  const isSubmitting = createTaskMutation.isPending || updateTaskMutation.isPending;
  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!isEditMode) {
      form.reset(defaultFormValues);
      return;
    }

    if (detailQuery.data) {
      form.reset({
        title: detailQuery.data.title,
        description: detailQuery.data.description ?? "",
        status: detailQuery.data.status
      });
    }
  }, [detailQuery.data, form, isEditMode, isOpen]);

  async function handleSubmit(values: TaskFormValues) {
    form.clearErrors();
    createTaskMutation.reset();
    updateTaskMutation.reset();

    const payload = {
      title: values.title,
      description: values.description?.trim() ? values.description.trim() : null,
      status: values.status
    };

    try {
      if (isEditMode) {
        if (!taskId) {
          return;
        }

        await updateTaskMutation.mutateAsync({
          taskId,
          payload
        });
      } else {
        await createTaskMutation.mutateAsync(payload);
      }

      onClose();
      form.reset(defaultFormValues);
    } catch (error) {
      const issues = getApiValidationIssues(error);

      issues.forEach((issue) => {
        if (!issue.path || !issue.message) {
          return;
        }

        form.setError(issue.path as keyof TaskFormValues, {
          type: "server",
          message: issue.message
        });
      });

      if (issues.length === 0) {
        form.setError("root.server", {
          type: "server",
          message: getApiErrorMessage(
            error,
            isEditMode ? "Failed to update task" : "Failed to create task"
          )
        });
      }
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        disabled={isSubmitting}
        aria-label="Close task form"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col border-l bg-card shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold">
              {isEditMode ? "Edit Task" : "Create Task"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEditMode
                ? "Update task details and status."
                : "Fill in the task details below."}
            </p>
          </div>
          <Button type="button" size="icon" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isEditMode && detailQuery.isLoading ? (
            <LoadingState label="Loading task detail..." />
          ) : null}

          {isEditMode && detailQuery.isError ? (
            <ErrorState
              title="Failed to load task detail"
              message={getApiErrorMessage(detailQuery.error, "Unable to load task")}
              onRetry={() => detailQuery.refetch()}
            />
          ) : null}

          {(!isEditMode || detailQuery.data) && !(isEditMode && detailQuery.isError) ? (
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleSubmit)}
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  placeholder="Task title"
                  {...form.register("title")}
                  disabled={isSubmitting}
                />
                {form.formState.errors.title?.message ? (
                  <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  placeholder="Task description"
                  rows={5}
                  {...form.register("description")}
                  disabled={isSubmitting}
                />
                {form.formState.errors.description?.message ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-status">Status</Label>
                <Select id="task-status" {...form.register("status")} disabled={isSubmitting}>
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {TASK_STATUS_LABELS[status]}
                    </option>
                  ))}
                </Select>
                {form.formState.errors.status?.message ? (
                  <p className="text-xs text-destructive">{form.formState.errors.status.message}</p>
                ) : null}
              </div>

              {form.formState.errors.root?.server?.message ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.root.server.message}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isEditMode ? "Save Changes" : "Create Task"}
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
