import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/select";
import type { TaskListMeta } from "../types/task-types";

type TaskPaginationProps = {
  meta: TaskListMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function TaskPagination({
  meta,
  onPageChange,
  onLimitChange,
  isLoading = false
}: TaskPaginationProps) {
  const canGoPrevious = meta.hasPreviousPage && !isLoading;
  const canGoNext = meta.hasNextPage && !isLoading;
  const displayTotalPages = meta.totalPages > 0 ? meta.totalPages : 1;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <p className="text-sm text-muted-foreground">
        Showing page {meta.page} of {displayTotalPages} ({meta.totalItems} tasks)
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          className="w-[88px]"
          value={String(meta.limit)}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          disabled={isLoading}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}/page
            </option>
          ))}
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={!canGoPrevious}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={!canGoNext}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
