import { Search, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { TASK_STATUS_LABELS } from "../constants/task-status";
import { TASK_STATUSES, type TaskStatus } from "../types/task-types";

type TaskToolbarProps = {
  search: string;
  status: TaskStatus | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatus | "all") => void;
  onClearFilters: () => void;
  isLoading?: boolean;
};

export function TaskToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClearFilters,
  isLoading = false
}: TaskToolbarProps) {
  const hasActiveFilters = search.trim().length > 0 || status !== "all";

  return (
    <div className="rounded-lg border bg-card p-3 sm:p-4">
      <div className="grid gap-3 md:grid-cols-[1fr,220px,auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search task title..."
            className="pl-9"
            disabled={isLoading}
          />
        </div>
        <Select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as TaskStatus | "all")}
          disabled={isLoading}
        >
          <option value="all">All Statuses</option>
          {TASK_STATUSES.map((taskStatus) => (
            <option key={taskStatus} value={taskStatus}>
              {TASK_STATUS_LABELS[taskStatus]}
            </option>
          ))}
        </Select>
        <Button
          type="button"
          variant="outline"
          onClick={onClearFilters}
          disabled={!hasActiveFilters || isLoading}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
