import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, GitBranch, FileText, BarChart3, ListChecks, Package, AlertTriangle } from "lucide-react";
import type { Task } from "@shared/schema";
import { useState } from "react";

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

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/10 text-green-600 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  hard: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  expert: "bg-red-500/10 text-red-600 border-red-500/20",
};

function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

export function TaskCard({ task, companyName, onContact, compact }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const subtasks = parseJsonArray(task.subtasks);
  const deliverables = parseJsonArray(task.deliverables);
  const hasDetails = subtasks.length > 0 || deliverables.length > 0 || task.businessContext || task.solutionNotes;
  const isIncident = task.title?.startsWith("[INCIDENT]");

  return (
    <div
      className={`bg-card rounded-xl border p-4 card-hover group ${
        isIncident ? "border-red-500/40 border-l-[3px] border-l-red-500" : "border-border/50"
      } ${hasDetails ? "cursor-pointer" : ""}`}
      data-testid={`task-card-${task.id}`}
      onClick={() => hasDetails && setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {isIncident && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
          <h4 className="font-display font-bold leading-snug text-sm" data-testid={`task-title-${task.id}`}>
            {isIncident ? task.title.replace("[INCIDENT] ", "") : task.title}
          </h4>
        </div>
        {isIncident && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-red-500/10 text-red-600 border-red-500/20 shrink-0">
            Incident
          </Badge>
        )}
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
        {task.difficulty && (
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 capitalize ${difficultyColors[task.difficulty] || ""}`}>
            <BarChart3 className="w-2.5 h-2.5 mr-0.5" /> {task.difficulty}
          </Badge>
        )}
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-primary/5 text-primary border-primary/20">
          {task.projectArea}
        </Badge>
        {companyName && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
            {companyName}
          </Badge>
        )}
        {task.assignedRole && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-violet-500/5 text-violet-600 border-violet-500/20">
            {task.assignedRole}
          </Badge>
        )}
      </div>

      {expanded && (
        <div className="space-y-3 mb-3 pt-2 border-t border-border/30">
          {task.businessContext && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5">
              <p className="text-[10px] font-semibold text-amber-600 mb-1">Business Context</p>
              <p className="text-xs text-foreground/80">{task.businessContext}</p>
            </div>
          )}
          {subtasks.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                <ListChecks className="w-3 h-3" /> Subtasks
              </p>
              <ul className="space-y-1">
                {subtasks.map((st, i) => (
                  <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded border border-border/50 flex items-center justify-center shrink-0 mt-0.5 text-[9px] text-muted-foreground">{i + 1}</span>
                    {st}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {deliverables.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                <Package className="w-3 h-3" /> Deliverables
              </p>
              <ul className="space-y-1">
                {deliverables.map((d, i) => (
                  <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                    <span className="text-primary shrink-0">•</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {task.solutionNotes && (
            <div className="bg-secondary/30 rounded-lg p-2.5 border border-border/30">
              <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                <FileText className="w-3 h-3" /> Solution
              </p>
              <p className="text-xs text-foreground/80">{task.solutionNotes}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
          <span className="bg-secondary px-1.5 py-0.5 rounded">{task.requestedBy}</span>
          {task.githubLink && (
            <a href={task.githubLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-emerald-500 hover:text-emerald-600">
              <GitBranch className="w-3.5 h-3.5" />
            </a>
          )}
          {task.solutionNotes && !expanded && <FileText className="w-3.5 h-3.5 text-primary" />}
          {subtasks.length > 0 && !expanded && <ListChecks className="w-3.5 h-3.5 text-muted-foreground" />}
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
