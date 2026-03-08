import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useCompanies } from "@/hooks/use-companies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, LayoutGrid, CalendarDays, Clock, Mail, Filter, Building2, Briefcase } from "lucide-react";
import { KanbanView } from "@/components/views/KanbanView";
import { TimelineView } from "@/components/views/TimelineView";
import { CalendarView } from "@/components/views/CalendarView";
import { ContactModal } from "@/components/ContactModal";
import type { Task, Company } from "@shared/schema";

type ViewMode = "kanban" | "timeline" | "calendar";

export default function PortfolioDashboard() {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [contactTask, setContactTask] = useState<Task | null>(null);

  const topics = useMemo(() => {
    const set = new Set(tasks.map((t: Task) => t.projectArea));
    return Array.from(set).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t: Task) => {
      if (filterCompany !== "all" && String(t.companyId) !== filterCompany) return false;
      if (filterTopic !== "all" && t.projectArea !== filterTopic) return false;
      return true;
    });
  }, [tasks, filterCompany, filterTopic]);

  const companyMap = useMemo(() => {
    const map: Record<number, string> = {};
    companies.forEach((c: Company) => { map[c.id] = c.name; });
    return map;
  }, [companies]);

  const stats = useMemo(() => ({
    total: filteredTasks.length,
    backlog: filteredTasks.filter((t: Task) => t.status === "backlog").length,
    inProgress: filteredTasks.filter((t: Task) => t.status === "in_progress").length,
    completed: filteredTasks.filter((t: Task) => t.status === "completed").length,
  }), [filteredTasks]);

  if (tasksLoading || companiesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const viewButtons: { mode: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
    { mode: "kanban", icon: LayoutGrid, label: "Kanban" },
    { mode: "timeline", icon: Clock, label: "Timeline" },
    { mode: "calendar", icon: CalendarDays, label: "Calendar" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-border/40 bg-card/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold" data-testid="text-portfolio-heading">
                Data Engineering Portfolio
              </h1>
              <p className="text-muted-foreground mt-1">
                Explore tasks across simulated companies and project areas.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-3 text-sm">
                <StatPill label="Total" value={stats.total} />
                <StatPill label="Backlog" value={stats.backlog} color="text-muted-foreground" />
                <StatPill label="In Progress" value={stats.inProgress} color="text-blue-600" />
                <StatPill label="Completed" value={stats.completed} color="text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                <Filter className="w-4 h-4" />
              </div>
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger className="w-[180px] h-9 text-sm" data-testid="filter-company">
                  <Building2 className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((c: Company) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTopic} onValueChange={setFilterTopic}>
                <SelectTrigger className="w-[180px] h-9 text-sm" data-testid="filter-topic">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((t: string) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(filterCompany !== "all" || filterTopic !== "all") && (
                <Button variant="ghost" size="sm" className="text-xs h-9" onClick={() => { setFilterCompany("all"); setFilterTopic("all"); }} data-testid="button-clear-filters">
                  Clear filters
                </Button>
              )}
            </div>

            <div className="flex items-center bg-secondary/60 rounded-lg p-0.5 border border-border/50">
              {viewButtons.map(({ mode, icon: Icon, label }) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 px-3 text-xs font-medium rounded-md ${viewMode === mode ? "" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setViewMode(mode)}
                  data-testid={`button-view-${mode}`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === "kanban" && (
          <KanbanView tasks={filteredTasks} companyMap={companyMap} onContact={setContactTask} />
        )}
        {viewMode === "timeline" && (
          <TimelineView tasks={filteredTasks} companyMap={companyMap} onContact={setContactTask} />
        )}
        {viewMode === "calendar" && (
          <CalendarView tasks={filteredTasks} companyMap={companyMap} onContact={setContactTask} />
        )}
      </div>

      <ContactModal task={contactTask} onClose={() => setContactTask(null)} />
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <span className={`${color || "text-foreground"} font-semibold`}>
      {value} <span className="font-normal text-muted-foreground">{label}</span>
    </span>
  );
}
