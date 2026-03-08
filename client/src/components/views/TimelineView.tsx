import { useMemo } from "react";
import { TaskCard } from "./TaskCard";
import { format } from "date-fns";
import type { Task } from "@shared/schema";

interface TimelineViewProps {
  tasks: Task[];
  companyMap: Record<number, string>;
  onContact: (task: Task) => void;
}

const statusColors: Record<string, string> = {
  backlog: "bg-slate-400",
  in_progress: "bg-blue-500",
  completed: "bg-emerald-500",
};

export function TimelineView({ tasks, companyMap, onContact }: TimelineViewProps) {
  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
  }, [tasks]);

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = {};
    sorted.forEach(t => {
      const dateKey = t.createdAt ? format(new Date(t.createdAt), "MMMM yyyy") : "Unknown";
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(t);
    });
    return map;
  }, [sorted]);

  return (
    <div className="relative" data-testid="timeline-view">
      <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-border/60" />

      {Object.entries(grouped).map(([month, monthTasks]) => (
        <div key={month} className="relative mb-8">
          <div className="flex items-center gap-3 mb-4 ml-0">
            <div className="relative z-10 w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <span className="text-[10px] md:text-xs font-bold text-primary">{monthTasks.length}</span>
            </div>
            <h3 className="text-base font-display font-bold">{month}</h3>
          </div>

          <div className="ml-12 md:ml-16 space-y-3">
            {monthTasks.map(task => (
              <div key={task.id} className="relative">
                <div className={`absolute -left-[2.25rem] md:-left-[2.75rem] top-4 w-2 h-2 rounded-full ${statusColors[task.status || "backlog"]}`} />
                <TaskCard
                  task={task}
                  companyName={task.companyId ? companyMap[task.companyId] : undefined}
                  onContact={onContact}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {sorted.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">No tasks match your filters.</div>
      )}
    </div>
  );
}
