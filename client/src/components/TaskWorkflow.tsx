import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Clock, GitBranch, FileText, Play, ChevronRight, Loader2 } from "lucide-react";
import type { Task } from "@shared/schema";

interface TaskWorkflowProps {
  task: Task;
  onClose: () => void;
}

const steps = [
  { id: 1, label: "Start Working", icon: Play },
  { id: 2, label: "Document Solution", icon: FileText },
  { id: 3, label: "Mark Complete", icon: CheckCircle },
];

export function TaskWorkflow({ task, onClose }: TaskWorkflowProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getInitialStep = () => {
    if (task.status === "completed") return 3;
    if (task.status === "in_progress") return 2;
    return 1;
  };

  const [step, setStep] = useState(getInitialStep());
  const [progressNotes, setProgressNotes] = useState(task.progressNotes || "");
  const [solutionNotes, setSolutionNotes] = useState(task.solutionNotes || "");
  const [architectureNotes, setArchitectureNotes] = useState(task.architectureNotes || "");
  const [githubLink, setGithubLink] = useState(task.githubLink || "");
  const [documentationLink, setDocumentationLink] = useState(task.documentationLink || "");

  const updateTask = useMutation({
    mutationFn: async (updates: Partial<Task>) => {
      return apiRequest("PATCH", `/api/tasks/${task.id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", task.id] });
    },
  });

  const handleStartTask = async () => {
    try {
      await updateTask.mutateAsync({ status: "in_progress", progressNotes });
      toast({ title: "Task started. Document your solution when ready." });
      setStep(2);
    } catch {
      toast({ title: "Failed to update task.", variant: "destructive" });
    }
  };

  const handleSaveSolution = async () => {
    try {
      await updateTask.mutateAsync({
        solutionNotes: solutionNotes || undefined,
        architectureNotes: architectureNotes || undefined,
        githubLink: githubLink || undefined,
        documentationLink: documentationLink || undefined,
      });
      toast({ title: "Solution saved." });
      setStep(3);
    } catch {
      toast({ title: "Failed to save solution.", variant: "destructive" });
    }
  };

  const handleComplete = async () => {
    try {
      await updateTask.mutateAsync({
        status: "completed",
        solutionNotes: solutionNotes || undefined,
        architectureNotes: architectureNotes || undefined,
        githubLink: githubLink || undefined,
        documentationLink: documentationLink || undefined,
      });
      toast({ title: "Task marked as completed." });
      onClose();
    } catch {
      toast({ title: "Failed to complete task.", variant: "destructive" });
    }
  };

  const isReadOnly = task.status === "completed";

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-base leading-tight pr-6">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-1 mb-4">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center gap-1.5 flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                step === s.id
                  ? "bg-primary text-primary-foreground"
                  : step > s.id
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-secondary text-muted-foreground"
              }`}>
                <s.icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{s.label}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-secondary/30 rounded-xl p-3 border border-border/30">
              <p className="text-xs text-muted-foreground">{task.businessContext || task.description}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Progress Notes
              </label>
              <Textarea
                value={progressNotes}
                onChange={e => setProgressNotes(e.target.value)}
                placeholder="What's your approach? What are you working on first?"
                rows={4}
                data-testid="input-progress-notes"
              />
            </div>
            <Button onClick={handleStartTask} disabled={updateTask.isPending} className="w-full" data-testid="button-start-task">
              {updateTask.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Start Task
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Solution Notes
              </label>
              <Textarea
                value={solutionNotes}
                onChange={e => setSolutionNotes(e.target.value)}
                placeholder="What did you build? What approach did you take?"
                rows={4}
                data-testid="input-solution-notes"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Architecture Notes</label>
              <Textarea
                value={architectureNotes}
                onChange={e => setArchitectureNotes(e.target.value)}
                placeholder="How does the system work? Key architectural decisions?"
                rows={3}
                data-testid="input-architecture-notes"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" /> GitHub Link
                </label>
                <Input
                  value={githubLink}
                  onChange={e => setGithubLink(e.target.value)}
                  placeholder="https://github.com/..."
                  data-testid="input-github-link"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Docs Link</label>
                <Input
                  value={documentationLink}
                  onChange={e => setDocumentationLink(e.target.value)}
                  placeholder="https://..."
                  data-testid="input-docs-link"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={handleSaveSolution} disabled={updateTask.isPending} className="flex-1" data-testid="button-save-solution">
                {updateTask.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save & Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              {solutionNotes && (
                <div className="bg-secondary/30 rounded-lg p-3 border border-border/30">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">SOLUTION</p>
                  <p className="text-xs">{solutionNotes}</p>
                </div>
              )}
              {architectureNotes && (
                <div className="bg-secondary/30 rounded-lg p-3 border border-border/30">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">ARCHITECTURE</p>
                  <p className="text-xs">{architectureNotes}</p>
                </div>
              )}
              {githubLink && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <GitBranch className="w-3.5 h-3.5" />
                  <a href={githubLink} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{githubLink}</a>
                </div>
              )}
            </div>
            {!isReadOnly && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button
                  onClick={handleComplete}
                  disabled={updateTask.isPending}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-testid="button-complete-task"
                >
                  {updateTask.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Mark as Completed
                </Button>
              </div>
            )}
            {isReadOnly && (
              <div className="flex items-center gap-2 justify-center text-sm text-emerald-600 font-medium py-2">
                <CheckCircle className="w-4 h-4" /> Task is completed
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
