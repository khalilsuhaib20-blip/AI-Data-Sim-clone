import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, GitBranch, FileText, ExternalLink } from "lucide-react";
import type { Task } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  companyName?: string;
  onContact: (task: Task) => void;
  compact?: boolean;
}

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500/10 text-red-600 border-red-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

export function TaskCard({ task, companyName, onContact, compact }: TaskCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-4 card-hover group" data-testid={`task-card-${task.id}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className={`font-display font-bold leading-snug ${compact ? "text-sm" : "text-sm"}`} data-testid={`task-title-${task.id}`}>
          {task.title}
        </h4>
      </div>

      {!compact && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 capitalize ${priorityColors[task.priority] || ""}`}>
          {task.priority}
        </Badge>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-primary/5 text-primary border-primary/20">
          {task.projectArea}
        </Badge>
        {companyName && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
            {companyName}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
          <span className="bg-secondary px-1.5 py-0.5 rounded">{task.requestedBy}</span>
          {task.githubLink && (
            <a href={task.githubLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-emerald-500 hover:text-emerald-600">
              <GitBranch className="w-3.5 h-3.5" />
            </a>
          )}
          {task.solutionNotes && <FileText className="w-3.5 h-3.5 text-primary" />}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-primary gap-1"
          onClick={(e) => { e.stopPropagation(); onContact(task); }}
          data-testid={`button-contact-${task.id}`}
        >
          <Mail className="w-3 h-3" />
          Contact
        </Button>
      </div>
    </div>
  );
}
