import { useRoute, Link } from "wouter";
import { useTask } from "@/hooks/use-tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, User, Briefcase, GitBranch, FileText, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function TaskDetails() {
  const [, params] = useRoute("/tasks/:id");
  const id = Number(params?.id);
  const { data: task, isLoading } = useTask(id);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Task not found.</p>
        <Link href="/tasks"><Button variant="outline" className="mt-4">Back to Tasks</Button></Link>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/tasks">
        <Button variant="ghost" className="mb-6 text-muted-foreground" data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
        </Button>
      </Link>

      <div className="bg-card rounded-2xl border border-border/50 p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={`capitalize ${priorityColors[task.priority] || ""}`} data-testid="badge-priority">
              {task.priority}
            </Badge>
            <Badge variant="outline" className={`capitalize ${statusColors[task.status] || ""}`} data-testid="badge-status">
              {task.status?.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              {task.projectArea}
            </Badge>
          </div>
          <div className="flex items-center text-muted-foreground text-sm gap-1">
            <Clock className="w-4 h-4" />
            {task.createdAt && format(new Date(task.createdAt), "MMM d, yyyy")}
          </div>
        </div>

        <h1 className="text-3xl font-display font-bold mb-4" data-testid="text-task-title">{task.title}</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">{task.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-secondary/30 p-4 rounded-xl border border-border/50">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-1">
              <User className="w-4 h-4" /> Requested By
            </div>
            <p className="text-sm font-semibold">{task.requestedBy}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-1">
              <Briefcase className="w-4 h-4" /> Recommended Role
            </div>
            <p className="text-sm font-semibold">{task.recommendedRole || "Not specified"}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-1">
              <Briefcase className="w-4 h-4" /> Status
            </div>
            <p className="text-sm font-semibold capitalize">{task.status?.replace("_", " ")}</p>
          </div>
        </div>

        {task.solutionNotes && (
          <div className="mb-6">
            <h3 className="font-display font-bold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Solution Notes
            </h3>
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{task.solutionNotes}</p>
            </div>
          </div>
        )}

        {task.architectureNotes && (
          <div className="mb-6">
            <h3 className="font-display font-bold mb-2">Architecture Notes</h3>
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/50">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{task.architectureNotes}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          {task.githubLink && (
            <a href={task.githubLink} target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2" data-testid="link-github">
                <GitBranch className="w-4 h-4" /> GitHub <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          )}
          {task.documentationLink && (
            <a href={task.documentationLink} target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                <FileText className="w-4 h-4" /> Documentation <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
