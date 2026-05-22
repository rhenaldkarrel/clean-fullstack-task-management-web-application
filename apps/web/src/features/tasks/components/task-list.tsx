import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { TASK_STATUS_LABELS, getTaskStatusBadgeClass } from "../constants/task-status";
import type { TaskItem } from "../types/task-types";
import { DeleteTaskDialog } from "./delete-task-dialog";

type TaskListProps = {
  tasks: TaskItem[];
  deletingTaskId: string | null;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export function TaskList({
  tasks,
  deletingTaskId,
  onEditTask,
  onDeleteTask
}: TaskListProps) {
  return (
    <div className="space-y-3">
      <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const isDeleting = deletingTaskId === task.id;

              return (
                <tr key={task.id} className="border-t">
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium">{task.title}</p>
                    {task.description ? (
                      <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getTaskStatusBadgeClass(task.status)}`}
                    >
                      {TASK_STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">
                    {formatDate(task.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => onEditTask(task.id)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <DeleteTaskDialog
                        taskTitle={task.title}
                        isDeleting={isDeleting}
                        onConfirm={() => onDeleteTask(task.id)}
                        trigger={
                          <Button type="button" size="sm" variant="destructive" className="gap-2">
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {tasks.map((task) => {
          const isDeleting = deletingTaskId === task.id;

          return (
            <article key={task.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(task.createdAt)}</p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getTaskStatusBadgeClass(task.status)}`}
                >
                  {TASK_STATUS_LABELS[task.status]}
                </span>
              </div>
              {task.description ? (
                <p className="mt-3 text-sm text-muted-foreground">{task.description}</p>
              ) : null}
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => onEditTask(task.id)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <DeleteTaskDialog
                  taskTitle={task.title}
                  isDeleting={isDeleting}
                  onConfirm={() => onDeleteTask(task.id)}
                  trigger={
                    <Button type="button" size="sm" variant="destructive" className="flex-1 gap-2">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  }
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
