import { useMemo } from "react";
import { TaskCard } from "./TaskCard";
import type { Task } from "@shared/schema";

interface KanbanViewProps {
  tasks: Task[];
  companyMap: Record<number, string>;
  onContact: (task: Task) => void;
}

const columns = [
  { key: "backlog", label: "Backlog", color: "bg-slate-400" },
  { key: "in_progress", label: "In Progress", color: "bg-blue-500" },
  { key: "completed", label: "Completed", color: "bg-emerald-500" },
];

export function KanbanView({ tasks, companyMap, onContact }: KanbanViewProps) {
  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = { backlog: [], in_progress: [], completed: [] };
    tasks.forEach(t => {
      const status = t.status || "backlog";
      if (!map[status]) map[status] = [];
      map[status].push(t);
    });
    return map;
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start" data-testid="kanban-view">
      {columns.map(col => (
        <div key={col.key} className="flex flex-col">
          <div className="flex items-center gap-2.5 mb-4 px-1">
            <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
            <h3 className="text-sm font-display font-bold text-foreground">{col.label}</h3>
            <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full">
              {grouped[col.key]?.length || 0}
            </span>
          </div>
          <div className="space-y-3 min-h-[200px]">
            {grouped[col.key]?.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                companyName={task.companyId ? companyMap[task.companyId] : undefined}
                onContact={onContact}
              />
            ))}
            {(!grouped[col.key] || grouped[col.key].length === 0) && (
              <div className="text-center py-12 text-sm text-muted-foreground rounded-xl border border-dashed border-border/50">
                No tasks
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
