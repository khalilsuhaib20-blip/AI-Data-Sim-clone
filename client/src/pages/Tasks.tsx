import { Link } from "wouter";
import { useTasks } from "@/hooks/use-tasks";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, GitBranch, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-500/10 text-red-600",
    high: "bg-orange-500/10 text-orange-600",
    medium: "bg-amber-500/10 text-amber-600",
    low: "bg-blue-500/10 text-blue-600",
  };

  const statusColors: Record<string, string> = {
    backlog: "bg-secondary text-secondary-foreground",
    in_progress: "bg-blue-500/10 text-blue-600",
    completed: "bg-emerald-500/10 text-emerald-600",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold" data-testid="text-tasks-heading">All Tasks</h1>
        <p className="text-muted-foreground mt-2 text-lg">Browse all engineering tasks across companies.</p>
      </div>

      <div className="space-y-4">
        {tasks.map((task: any) => (
          <Link key={task.id} href={`/tasks/${task.id}`}>
            <div className="bg-card rounded-xl border border-border/50 p-5 card-hover cursor-pointer" data-testid={`card-task-${task.id}`}>
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <h3 className="font-display font-bold">{task.title}</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className={`capitalize text-xs ${priorityColors[task.priority] || ""}`}>
                    {task.priority}
                  </Badge>
                  <Badge variant="outline" className={`capitalize text-xs ${statusColors[task.status] || ""}`}>
                    {task.status?.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium flex-wrap">
                <span className="bg-secondary px-2 py-1 rounded-md">{task.requestedBy}</span>
                <span>{task.projectArea}</span>
                {task.createdAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(task.createdAt), "MMM d, yyyy")}
                  </span>
                )}
                {task.solutionNotes && <MessageSquare className="w-3.5 h-3.5 text-primary" />}
                {task.githubLink && <GitBranch className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
