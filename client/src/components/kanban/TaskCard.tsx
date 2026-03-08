import { Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { AlignLeft, MessageSquare, GitBranch, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TaskCardProps {
  task: any;
  index: number;
  onClick: (task: any) => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`
            bg-card p-4 rounded-xl border mb-3 cursor-pointer group
            ${snapshot.isDragging ? 'shadow-2xl shadow-primary/10 border-primary/50 rotate-1 scale-105 z-50' : 'card-hover'}
          `}
        >
          <div className="flex justify-between items-start mb-3 gap-2">
            <Badge variant="outline" className={`capitalize text-[10px] px-2 py-0 h-5 font-semibold ${priorityColors[task.priority?.toLowerCase()] || "bg-secondary"}`}>
              {task.priority}
            </Badge>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-1 rounded-md">
              {task.requestedBy}
            </span>
          </div>
          
          <h4 className="font-display font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {task.title}
          </h4>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 font-medium">
            <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(task.createdAt), "MMM d")}
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              {task.description && (
                <AlignLeft className="w-3.5 h-3.5 opacity-60" />
              )}
              {task.solutionNotes && (
                <MessageSquare className="w-3.5 h-3.5 text-primary opacity-80" />
              )}
              {task.githubLink && (
                <GitBranch className="w-3.5 h-3.5 text-emerald-500 opacity-80" />
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
