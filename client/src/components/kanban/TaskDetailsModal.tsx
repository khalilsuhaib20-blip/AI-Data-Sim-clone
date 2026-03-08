import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Github, Save, Trash2, Clock, User, Briefcase, AlertCircle } from "lucide-react";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { format } from "date-fns";

interface TaskDetailsModalProps {
  task: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailsModal({ task, isOpen, onClose }: TaskDetailsModalProps) {
  const [solutionNotes, setSolutionNotes] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [status, setStatus] = useState("");

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  useEffect(() => {
    if (task) {
      setSolutionNotes(task.solutionNotes || "");
      setGithubLink(task.githubLink || "");
      setStatus(task.status);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    updateTask.mutate(
      { 
        id: task.id, 
        solutionNotes, 
        githubLink, 
        status 
      },
      { onSuccess: onClose }
    );
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(task.id, { onSuccess: onClose });
    }
  };

  const isPending = updateTask.isPending || deleteTask.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] glass-panel border-none p-0 overflow-hidden">
        <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 text-xs">
                {task.projectArea}
              </Badge>
              <div className="flex items-center text-muted-foreground text-sm gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(task.createdAt), "MMM d, yyyy")}
              </div>
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-display font-bold leading-tight">
              {task.title}
            </DialogTitle>
            <DialogDescription className="text-base text-foreground/80 mt-4 leading-relaxed">
              {task.description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-secondary/30 p-4 rounded-xl border border-border/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-1">
                <User className="w-4 h-4" /> Requested By
              </div>
              <p className="text-sm font-semibold">{task.requestedBy}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-1">
                <Briefcase className="w-4 h-4" /> Current Status
              </div>
              <Select value={status} onValueChange={setStatus} disabled={isPending}>
                <SelectTrigger className="h-8 text-sm border-border/50 bg-background/50 focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-1">
                <AlertCircle className="w-4 h-4" /> Priority
              </div>
              <Badge variant="secondary" className="capitalize">
                {task.priority}
              </Badge>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                Solution Notes
              </label>
              <Textarea 
                placeholder="Document your approach, challenges, or architecture decisions here..."
                value={solutionNotes}
                onChange={(e) => setSolutionNotes(e.target.value)}
                className="min-h-[120px] resize-y bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl p-4"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub PR / Commit Link
              </label>
              <Input 
                placeholder="https://github.com/your-org/repo/pull/123"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl h-11"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-secondary/30 border-t border-border/50 flex sm:justify-between items-center">
          <Button 
            variant="ghost" 
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isPending} className="border-border/50 hover:bg-secondary">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateTask.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
