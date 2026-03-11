import { useState } from "react";
import { useTasks, useUpdateTask, useDeleteTask, useGenerateTask, useUpdateProgress } from "@/hooks/use-tasks";
import { useCompanies } from "@/hooks/use-companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Pencil, Trash2, Save, Loader2, Sparkles,
  GitBranch, ExternalLink, CheckCircle, XCircle, Clock,
  MessageCircle, ListChecks, FileText, User, Zap, Play
} from "lucide-react";
import { TaskWorkflow } from "@/components/TaskWorkflow";

interface TaskForm {
  title: string;
  description: string;
  requestedBy: string;
  priority: string;
  projectArea: string;
  recommendedRole: string;
  assignedRole: string;
  difficulty: string;
  status: string;
  businessContext: string;
  subtasks: string;
  deliverables: string;
  solutionNotes: string;
  architectureNotes: string;
  githubLink: string;
  documentationLink: string;
  companyId: string;
  milestoneId: string;
}

function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  hard: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  expert: "bg-red-500/10 text-red-600 border-red-500/20",
};

const priorityColors: Record<string, string> = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  backlog: { color: "bg-secondary text-secondary-foreground", icon: Clock, label: "Backlog" },
  in_progress: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: MessageCircle, label: "Active" },
  completed: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle, label: "Closed" },
};

export default function ManageTasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: companies = [] } = useCompanies();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();

  const [editTask, setEditTask] = useState<any | null>(null);
  const [form, setForm] = useState<TaskForm>({} as TaskForm);
  const [detailTask, setDetailTask] = useState<any | null>(null);
  const [workflowTask, setWorkflowTask] = useState<any | null>(null);

  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return null;
    return companies.find((c: any) => c.id === companyId)?.name || null;
  };

  const openEdit = (t: any) => {
    const subtasksArr = parseJsonArray(t.subtasks);
    const deliverablesArr = parseJsonArray(t.deliverables);
    setForm({
      title: t.title || "",
      description: t.description || "",
      requestedBy: t.requestedBy || "",
      priority: t.priority || "medium",
      projectArea: t.projectArea || "",
      recommendedRole: t.recommendedRole || "",
      assignedRole: t.assignedRole || "",
      difficulty: t.difficulty || "medium",
      status: t.status,
      businessContext: t.businessContext || "",
      subtasks: subtasksArr.join("\n"),
      deliverables: deliverablesArr.join("\n"),
      solutionNotes: t.solutionNotes || "",
      architectureNotes: t.architectureNotes || "",
      githubLink: t.githubLink || "",
      documentationLink: t.documentationLink || "",
      companyId: t.companyId?.toString() || "",
      milestoneId: t.milestoneId?.toString() || "",
    });
    setEditTask(t);
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.requestedBy || !form.projectArea) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const subtasksArray = form.subtasks.split("\n").map(s => s.trim()).filter(Boolean);
    const deliverablesArray = form.deliverables.split("\n").map(s => s.trim()).filter(Boolean);
    try {
      await updateTask.mutateAsync({
        id: editTask.id,
        title: form.title,
        description: form.description,
        requestedBy: form.requestedBy,
        priority: form.priority,
        projectArea: form.projectArea,
        recommendedRole: form.recommendedRole || null,
        assignedRole: form.assignedRole || null,
        difficulty: form.difficulty || null,
        status: form.status,
        businessContext: form.businessContext || null,
        subtasks: subtasksArray.length > 0 ? JSON.stringify(subtasksArray) : null,
        deliverables: deliverablesArray.length > 0 ? JSON.stringify(deliverablesArray) : null,
        solutionNotes: form.solutionNotes || null,
        architectureNotes: form.architectureNotes || null,
        githubLink: form.githubLink || null,
        documentationLink: form.documentationLink || null,
        companyId: form.companyId ? Number(form.companyId) : null,
        milestoneId: form.milestoneId ? Number(form.milestoneId) : null,
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

  const handleCloseTask = async (task: any) => {
    try {
      await updateTask.mutateAsync({ id: task.id, status: "completed" });
      toast({ title: "Task closed." });
      if (detailTask?.id === task.id) {
        setDetailTask({ ...detailTask, status: "completed" });
      }
    } catch {
      toast({ title: "Failed to close task.", variant: "destructive" });
    }
  };

  const handleReopenTask = async (task: any) => {
    try {
      await updateTask.mutateAsync({ id: task.id, status: "in_progress" });
      toast({ title: "Task reopened." });
      if (detailTask?.id === task.id) {
        setDetailTask({ ...detailTask, status: "in_progress" });
      }
    } catch {
      toast({ title: "Failed to reopen task.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold" data-testid="text-manage-tasks">Manage Tasks</h1>
        <p className="text-muted-foreground mt-1">Click any task to view details, track progress, and manage work.</p>
      </div>

      <div className="space-y-3">
        {tasks.map((task: any) => {
          const sc = statusConfig[task.status] || statusConfig.backlog;
          const StatusIcon = sc.icon;
          const companyName = getCompanyName(task.companyId);
          return (
            <Card
              key={task.id}
              className="border-border/50 cursor-pointer hover-elevate"
              data-testid={`task-row-${task.id}`}
              onClick={() => setDetailTask(task)}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-bold truncate text-sm" data-testid={`text-task-title-${task.id}`}>{task.title}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {companyName && (
                      <span className="text-xs text-muted-foreground" data-testid={`text-task-company-${task.id}`}>{companyName}</span>
                    )}
                    {companyName && <span className="text-xs text-muted-foreground">|</span>}
                    <span className="text-xs text-muted-foreground" data-testid={`text-task-area-${task.id}`}>{task.projectArea}</span>
                    {task.assignedRole && (
                      <>
                        <span className="text-xs text-muted-foreground">|</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid={`text-task-role-${task.id}`}>
                          <User className="w-3 h-3" /> {task.assignedRole}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                  <Badge variant="outline" className={`capitalize text-xs ${priorityColors[task.priority] || ""}`} data-testid={`badge-priority-${task.id}`}>
                    {task.priority}
                  </Badge>
                  {task.difficulty && (
                    <Badge variant="outline" className={`capitalize text-xs ${difficultyColors[task.difficulty] || ""}`} data-testid={`badge-difficulty-${task.id}`}>
                      {task.difficulty}
                    </Badge>
                  )}
                  <Badge variant="outline" className={`capitalize text-xs ${sc.color}`} data-testid={`badge-status-${task.id}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {sc.label}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => setWorkflowTask(task)}
                    data-testid={`button-work-${task.id}`}
                  >
                    {task.status === "completed"
                      ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      : task.status === "in_progress"
                      ? <Clock className="w-3.5 h-3.5 text-blue-500" />
                      : <Play className="w-3.5 h-3.5" />}
                    {task.status === "backlog" ? "Start" : task.status === "in_progress" ? "Continue" : "View"}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => openEdit(task)} data-testid={`button-edit-task-${task.id}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(task.id)} data-testid={`button-delete-task-${task.id}`}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {tasks.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No tasks yet</p>
          </div>
        )}
      </div>

      {workflowTask && (
        <TaskWorkflow task={workflowTask} onClose={() => setWorkflowTask(null)} />
      )}

      {detailTask && (
        <TaskDetailPopup
          task={detailTask}
          companies={companies}
          onClose={() => setDetailTask(null)}
          onCloseTask={() => handleCloseTask(detailTask)}
          onReopenTask={() => handleReopenTask(detailTask)}
        />
      )}

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
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold">Business Context</label>
                <Textarea value={form.businessContext} onChange={e => setForm(f => ({ ...f, businessContext: e.target.value }))} rows={3} placeholder="Why is this task important for the business?" data-testid="input-business-context" />
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
                <label className="text-sm font-semibold">Assigned Role</label>
                <Input value={form.assignedRole} onChange={e => setForm(f => ({ ...f, assignedRole: e.target.value }))} placeholder="e.g. Frontend Engineer" data-testid="input-assigned-role" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Difficulty</label>
                <Select value={form.difficulty || "medium"} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger data-testid="select-difficulty"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
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
              <div className="space-y-2">
                <label className="text-sm font-semibold">Milestone ID</label>
                <Input
                  type="number"
                  value={form.milestoneId}
                  onChange={e => setForm(f => ({ ...f, milestoneId: e.target.value }))}
                  placeholder="Optional milestone ID"
                  data-testid="input-milestone-id"
                />
              </div>
            </div>
            <div className="border-t border-border/50 pt-4">
              <p className="text-sm font-semibold mb-3 text-muted-foreground">Subtasks & Deliverables</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Subtasks (one per line)</label>
                  <Textarea value={form.subtasks} onChange={e => setForm(f => ({ ...f, subtasks: e.target.value }))} rows={4} placeholder="Subtask 1&#10;Subtask 2&#10;Subtask 3" data-testid="input-subtasks" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Deliverables (one per line)</label>
                  <Textarea value={form.deliverables} onChange={e => setForm(f => ({ ...f, deliverables: e.target.value }))} rows={4} placeholder="Deliverable 1&#10;Deliverable 2" data-testid="input-deliverables" />
                </div>
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

function TaskDetailPopup({ task, companies, onClose, onCloseTask, onReopenTask }: {
  task: any;
  companies: any[];
  onClose: () => void;
  onCloseTask: () => void;
  onReopenTask: () => void;
}) {
  const updateProgress = useUpdateProgress();
  const generateTask = useGenerateTask();
  const { toast } = useToast();

  const [progressNotes, setProgressNotes] = useState(task.progressNotes || "");

  const companyName = task.companyId ? companies.find((c: any) => c.id === task.companyId)?.name : null;
  const subtasks = parseJsonArray(task.subtasks);
  const deliverables = parseJsonArray(task.deliverables);
  const sc = statusConfig[task.status] || statusConfig.backlog;
  const StatusIcon = sc.icon;

  const handleSaveProgress = async () => {
    try {
      await updateProgress.mutateAsync({ id: task.id, progressNotes });
      toast({ title: "Progress notes saved." });
    } catch {
      toast({ title: "Failed to save progress.", variant: "destructive" });
    }
  };

  const handleGenerateNext = async () => {
    try {
      await generateTask.mutateAsync({
        companyId: task.companyId || undefined,
        milestoneId: task.milestoneId || undefined,
        progressContext: progressNotes || undefined,
      });
      toast({ title: "Next task generated successfully." });
    } catch {
      toast({ title: "Failed to generate task.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg pr-8" data-testid="detail-task-title">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`capitalize text-xs ${sc.color}`} data-testid="detail-status-badge">
            <StatusIcon className="w-3 h-3 mr-1" />
            {sc.label}
          </Badge>
          <Badge variant="outline" className={`capitalize text-xs ${priorityColors[task.priority] || ""}`} data-testid="detail-priority-badge">
            {task.priority}
          </Badge>
          {task.difficulty && (
            <Badge variant="outline" className={`capitalize text-xs ${difficultyColors[task.difficulty] || ""}`} data-testid="detail-difficulty-badge">
              {task.difficulty}
            </Badge>
          )}
          {companyName && (
            <Badge variant="outline" className="text-xs" data-testid="detail-company-badge">{companyName}</Badge>
          )}
          <Badge variant="outline" className="text-xs" data-testid="detail-area-badge">{task.projectArea}</Badge>
          {task.assignedRole && (
            <Badge variant="outline" className="text-xs" data-testid="detail-role-badge">
              <User className="w-3 h-3 mr-1" /> {task.assignedRole}
            </Badge>
          )}
        </div>

        <div className="space-y-5 mt-2">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Description</p>
            <p className="text-sm" data-testid="detail-description">{task.description}</p>
          </div>

          {task.businessContext && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Business Context</p>
              <p className="text-sm" data-testid="detail-business-context">{task.businessContext}</p>
            </div>
          )}

          {subtasks.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <ListChecks className="w-4 h-4" /> Subtasks
              </p>
              <div className="space-y-1.5" data-testid="detail-subtasks">
                {subtasks.map((st, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 mt-0.5 rounded border border-border/80 shrink-0 flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                    </div>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deliverables.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <FileText className="w-4 h-4" /> Deliverables
              </p>
              <ul className="space-y-1 text-sm list-disc pl-5" data-testid="detail-deliverables">
                {deliverables.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          {(task.githubLink || task.documentationLink) && (
            <div className="flex items-center gap-4 flex-wrap">
              {task.githubLink && (
                <a href={task.githubLink} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1" data-testid="detail-github-link">
                  <GitBranch className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {task.documentationLink && (
                <a href={task.documentationLink} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1" data-testid="detail-docs-link">
                  <ExternalLink className="w-3.5 h-3.5" /> Documentation
                </a>
              )}
            </div>
          )}

          {task.solutionNotes && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Solution Notes</p>
              <p className="text-sm whitespace-pre-wrap" data-testid="detail-solution-notes">{task.solutionNotes}</p>
            </div>
          )}

          {task.architectureNotes && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Architecture Notes</p>
              <p className="text-sm whitespace-pre-wrap" data-testid="detail-architecture-notes">{task.architectureNotes}</p>
            </div>
          )}

          <div className="border-t border-border/50 pt-4">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Progress Notes</p>
            <Textarea
              value={progressNotes}
              onChange={e => setProgressNotes(e.target.value)}
              rows={4}
              placeholder="Track progress, blockers, and updates here..."
              data-testid="input-progress-notes"
            />
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Button
                onClick={handleSaveProgress}
                disabled={updateProgress.isPending}
                data-testid="button-save-progress"
              >
                {updateProgress.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Progress
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateNext}
                disabled={generateTask.isPending}
                data-testid="button-generate-next-task"
              >
                {generateTask.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate Next Task
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {task.status !== "completed" ? (
            <Button variant="outline" onClick={onCloseTask} data-testid="button-close-task">
              <CheckCircle className="w-4 h-4 mr-2" /> Close Task
            </Button>
          ) : (
            <Button variant="outline" onClick={onReopenTask} data-testid="button-reopen-task">
              <XCircle className="w-4 h-4 mr-2" /> Reopen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
