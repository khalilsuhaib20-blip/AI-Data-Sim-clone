import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import type { Task } from "@shared/schema";

interface CalendarViewProps {
  tasks: Task[];
  companyMap: Record<number, string>;
  onContact: (task: Task) => void;
}

const priorityDots: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
};

const statusColors: Record<string, string> = {
  backlog: "border-l-slate-400",
  in_progress: "border-l-blue-500",
  completed: "border-l-emerald-500",
};

export function CalendarView({ tasks, companyMap, onContact }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(t => {
      if (!t.createdAt) return;
      const key = format(new Date(t.createdAt), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const selectedTasks = useMemo(() => {
    if (!selectedDay) return [];
    const key = format(selectedDay, "yyyy-MM-dd");
    return tasksByDay[key] || [];
  }, [selectedDay, tasksByDay]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div data-testid="calendar-view">
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))} data-testid="button-prev-month">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-display font-bold text-base">{format(currentMonth, "MMMM yyyy")}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))} data-testid="button-next-month">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7">
          {weekDays.map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-2 border-b border-border/30">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map(day => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDay[key] || [];
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={key}
                className={`min-h-[72px] md:min-h-[90px] p-1.5 border-b border-r border-border/20 text-left transition-colors relative
                  ${isCurrentMonth ? "bg-card" : "bg-secondary/20"}
                  ${isSelected ? "bg-primary/5 ring-1 ring-primary/30" : "hover:bg-secondary/40"}
                `}
                onClick={() => setSelectedDay(day)}
                data-testid={`calendar-day-${key}`}
              >
                <span className={`text-xs font-medium block mb-1 ${
                  isToday ? "w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center" :
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground/40"
                }`}>
                  {format(day, "d")}
                </span>
                {dayTasks.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {dayTasks.slice(0, 3).map(t => (
                      <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${priorityDots[t.priority] || "bg-gray-400"}`} />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] text-muted-foreground ml-0.5">+{dayTasks.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="mt-5">
          <h3 className="font-display font-bold text-base mb-3">
            {format(selectedDay, "EEEE, MMMM d, yyyy")}
            <span className="text-muted-foreground font-normal ml-2 text-sm">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""}
            </span>
          </h3>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No tasks on this day.</p>
          ) : (
            <div className="space-y-3">
              {selectedTasks.map(task => (
                <div key={task.id} className={`bg-card rounded-xl border border-border/50 p-4 border-l-4 ${statusColors[task.status || "backlog"]}`} data-testid={`calendar-task-${task.id}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-sm mb-1">{task.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 capitalize">{task.priority}</Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">{task.projectArea}</Badge>
                        {task.companyId && companyMap[task.companyId] && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">{companyMap[task.companyId]}</Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{task.requestedBy}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs shrink-0 gap-1"
                      onClick={() => onContact(task)}
                      data-testid={`button-contact-cal-${task.id}`}
                    >
                      <Mail className="w-3 h-3" />
                      Contact
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
