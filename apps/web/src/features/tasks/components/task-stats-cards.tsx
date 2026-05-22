import type { ComponentType } from "react";
import { CheckCircle2, Clock3, ListChecks, Loader2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { TaskStats } from "../types/task-types";

type TaskStatsCardsProps = {
  stats: TaskStats;
  isLoading?: boolean;
};

type StatCardProps = {
  title: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  toneClassName: string;
  isLoading?: boolean;
};

function StatCard({
  title,
  value,
  icon: Icon,
  toneClassName,
  isLoading = false
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="text-2xl font-semibold">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : value}
        </div>
        <div className={`rounded-md p-2 ${toneClassName}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TaskStatsCards({ stats, isLoading = false }: TaskStatsCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        title="Total Tasks"
        value={stats.total}
        icon={ListChecks}
        toneClassName="bg-slate-100 text-slate-700"
        isLoading={isLoading}
      />
      <StatCard
        title="Todo"
        value={stats.todo}
        icon={Clock3}
        toneClassName="bg-slate-100 text-slate-700"
        isLoading={isLoading}
      />
      <StatCard
        title="In Progress"
        value={stats.inProgress}
        icon={Clock3}
        toneClassName="bg-amber-100 text-amber-700"
        isLoading={isLoading}
      />
      <StatCard
        title="Done"
        value={stats.done}
        icon={CheckCircle2}
        toneClassName="bg-emerald-100 text-emerald-700"
        isLoading={isLoading}
      />
      <StatCard
        title="Canceled"
        value={stats.canceled}
        icon={XCircle}
        toneClassName="bg-rose-100 text-rose-700"
        isLoading={isLoading}
      />
    </div>
  );
}
