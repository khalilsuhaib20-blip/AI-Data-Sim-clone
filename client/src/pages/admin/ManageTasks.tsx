import { useState } from "react";
import { useTasks, useUpdateTask, useDeleteTask, useReviewTask } from "@/hooks/use-tasks";
import { useCompanies } from "@/hooks/use-companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Save, Loader2, Sparkles, Star, AlertTriangle, Lightbulb, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

interface TaskForm {
  title: string;
  description: string;
  requestedBy: string;
  priority: string;
  projectArea: string;
  recommendedRole: string;
  status: string;
  solutionNotes: string;
  architectureNotes: string;
  githubLink: string;
  documentationLink: string;
  companyId: string;
}

interface AIReview {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  risks: string[];
  summary: string;
}

export default function ManageTasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: companies = [] } = useCompanies();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const reviewTask = useReviewTask();
  const { toast } = useToast();

  const [editTask, setEditTask] = useState<any | null>(null);
  const [form, setForm] = useState<TaskForm>({} as TaskForm);
  const [review, setReview] = useState<AIReview | null>(null);
  const [reviewTaskId, setReviewTaskId] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const openEdit = (t: any) => {
    setForm({
      title: t.title || "",
      description: t.description || "",
      requestedBy: t.requestedBy || "",
      priority: t.priority || "medium",
      projectArea: t.projectArea || "",
      recommendedRole: t.recommendedRole || "",
      status: t.status,
      solutionNotes: t.solutionNotes || "",
      architectureNotes: t.architectureNotes || "",
      githubLink: t.githubLink || "",
      documentationLink: t.documentationLink || "",
      companyId: t.companyId?.toString() || "",
    });
    setEditTask(t);
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.requestedBy || !form.projectArea) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    try {
      await updateTask.mutateAsync({
        id: editTask.id,
        title: form.title,
        description: form.description,
        requestedBy: form.requestedBy,
        priority: form.priority,
        projectArea: form.projectArea,
        recommendedRole: form.recommendedRole || null,
        status: form.status,
        solutionNotes: form.solutionNotes || null,
        architectureNotes: form.architectureNotes || null,
        githubLink: form.githubLink || null,
        documentationLink: form.documentationLink || null,
        companyId: form.companyId ? Number(form.companyId) : null,
      });
      toast({ title: "Task updated." });
      setEditTask(null);
    } catch {
      toast({ title: "Failed to update task.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask.mutateAsync(id);
      toast({ title: "Task deleted." });
    } catch {
      toast({ title: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleReview = async (taskId: number) => {
    setReviewTaskId(taskId);
    setReview(null);
    try {
      const result = await reviewTask.mutateAsync(taskId);
      setReview(result);
    } catch {
      toast({ title: "Failed to get AI review. Check your AI settings.", variant: "destructive" });
      setReviewTaskId(null);
    }
  };

  const statusColors: Record<string, string> = {
    backlog: "bg-secondary text-secondary-foreground",
    in_progress: "bg-blue-500/10 text-blue-600",
    completed: "bg-emerald-500/10 text-emerald-600",
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold" data-testid="text-manage-tasks">Manage Tasks</h1>
        <p className="text-muted-foreground mt-1">Edit all task details, update status, and get AI reviews of your work.</p>
      </div>

      <div className="space-y-3">
        {tasks.map((task: any) => (
          <Card key={task.id} className="border-border/50" data-testid={`task-row-${task.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedCard(expandedCard === task.id ? null : task.id)}>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold truncate text-sm">{task.title}</p>
                    {expandedCard === task.id ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">{task.requestedBy}</span>
                    <span className="text-xs text-muted-foreground">|</span>
                    <span className="text-xs text-muted-foreground">{task.projectArea}</span>
                    {task.companyId && companies.find((c: any) => c.id === task.companyId) && (
                      <>
                        <span className="text-xs text-muted-foreground">|</span>
                        <span className="text-xs text-muted-foreground">{companies.find((c: any) => c.id === task.companyId)?.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`capitalize text-xs ${statusColors[task.status] || ""}`}>
                    {task.status?.replace("_", " ")}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs gap-1"
                    onClick={() => handleReview(task.id)}
                    disabled={reviewTask.isPending && reviewTaskId === task.id}
                    data-testid={`button-review-${task.id}`}
                  >
                    {reviewTask.isPending && reviewTaskId === task.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    AI Review
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(task)} data-testid={`button-edit-task-${task.id}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDelete(task.id)} data-testid={`button-delete-task-${task.id}`}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>

              {expandedCard === task.id && (
                <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-muted-foreground font-medium">Priority:</span> <span className="capitalize font-semibold">{task.priority}</span></div>
                    <div><span className="text-muted-foreground font-medium">Role:</span> <span className="font-semibold">{task.recommendedRole || "—"}</span></div>
                    <div><span className="text-muted-foreground font-medium">GitHub:</span> {task.githubLink ? <a href={task.githubLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">Link</a> : "—"}</div>
                    <div><span className="text-muted-foreground font-medium">Docs:</span> {task.documentationLink ? <a href={task.documentationLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">Link</a> : "—"}</div>
                  </div>
                  {task.solutionNotes && (
                    <div className="bg-secondary/30 rounded-lg p-3 border border-border/30">
                      <p className="text-[11px] font-semibold text-muted-foreground mb-1">Solution Notes</p>
                      <p className="text-xs">{task.solutionNotes}</p>
                    </div>
                  )}
                  {task.architectureNotes && (
                    <div className="bg-secondary/30 rounded-lg p-3 border border-border/30">
                      <p className="text-[11px] font-semibold text-muted-foreground mb-1">Architecture Notes</p>
                      <p className="text-xs">{task.architectureNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {review && reviewTaskId === task.id && (
                <div className="mt-4 pt-4 border-t border-border/50" data-testid={`review-result-${task.id}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-display font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" /> AI Review
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-lg font-display font-bold">{review.score}</span>
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{review.summary}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {review.strengths?.length > 0 && (
                      <ReviewSection icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-500" />} title="Strengths" items={review.strengths} color="bg-emerald-500/5 border-emerald-500/20" />
                    )}
                    {review.improvements?.length > 0 && (
                      <ReviewSection icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />} title="Improvements" items={review.improvements} color="bg-amber-500/5 border-amber-500/20" />
                    )}
                    {review.suggestions?.length > 0 && (
                      <ReviewSection icon={<Lightbulb className="w-3.5 h-3.5 text-blue-500" />} title="Suggestions" items={review.suggestions} color="bg-blue-500/5 border-blue-500/20" />
                    )}
                    {review.risks?.length > 0 && (
                      <ReviewSection icon={<AlertTriangle className="w-3.5 h-3.5 text-red-500" />} title="Risks" items={review.risks} color="bg-red-500/5 border-red-500/20" />
                    )}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => { setReview(null); setReviewTaskId(null); }}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold">Title *</label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} data-testid="input-task-title" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold">Description *</label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} data-testid="input-task-description" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Requested By *</label>
                <Input value={form.requestedBy} onChange={e => setForm(f => ({ ...f, requestedBy: e.target.value }))} data-testid="input-requested-by" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Recommended Role</label>
                <Input value={form.recommendedRole} onChange={e => setForm(f => ({ ...f, recommendedRole: e.target.value }))} data-testid="input-recommended-role" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Priority</label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger data-testid="select-priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Project Area *</label>
                <Input value={form.projectArea} onChange={e => setForm(f => ({ ...f, projectArea: e.target.value }))} data-testid="input-project-area" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Status</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger data-testid="select-task-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Company</label>
                <Select value={form.companyId || "none"} onValueChange={v => setForm(f => ({ ...f, companyId: v === "none" ? "" : v }))}>
                  <SelectTrigger data-testid="select-task-company"><SelectValue placeholder="Select company" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {companies.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t border-border/50 pt-4">
              <p className="text-sm font-semibold mb-3 text-muted-foreground">Work Details</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Solution Notes</label>
                  <Textarea value={form.solutionNotes} onChange={e => setForm(f => ({ ...f, solutionNotes: e.target.value }))} rows={4} placeholder="Describe how you solved this task..." data-testid="input-solution-notes" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Architecture Notes</label>
                  <Textarea value={form.architectureNotes} onChange={e => setForm(f => ({ ...f, architectureNotes: e.target.value }))} rows={3} placeholder="Technical architecture decisions..." data-testid="input-architecture-notes" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">GitHub Link</label>
                    <Input value={form.githubLink} onChange={e => setForm(f => ({ ...f, githubLink: e.target.value }))} placeholder="https://github.com/..." data-testid="input-github-link" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Documentation Link</label>
                    <Input value={form.documentationLink} onChange={e => setForm(f => ({ ...f, documentationLink: e.target.value }))} placeholder="https://docs.example.com/..." data-testid="input-documentation-link" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTask(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateTask.isPending} data-testid="button-save-task">
              {updateTask.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewSection({ icon, title, items, color }: { icon: React.ReactNode; title: string; items: string[]; color: string }) {
  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <p className="text-xs font-semibold flex items-center gap-1.5 mb-2">{icon} {title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-foreground/80 flex gap-1.5">
            <span className="text-muted-foreground shrink-0 mt-0.5">-</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
