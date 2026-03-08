import { useState } from "react";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useCompanies } from "@/hooks/use-companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Save, Loader2 } from "lucide-react";

export default function ManageTasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: companies = [] } = useCompanies();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();

  const [editTask, setEditTask] = useState<any | null>(null);
  const [form, setForm] = useState<any>({});

  const openEdit = (t: any) => {
    setForm({
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
    try {
      await updateTask.mutateAsync({
        id: editTask.id,
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
        <p className="text-muted-foreground mt-1">Edit tasks, update status, add solution notes and links.</p>
      </div>

      <div className="space-y-3">
        {tasks.map((task: any) => (
          <Card key={task.id} className="border-border/50" data-testid={`task-row-${task.id}`}>
            <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold truncate text-sm">{task.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">{task.requestedBy}</span>
                  <span className="text-xs text-muted-foreground">|</span>
                  <span className="text-xs text-muted-foreground">{task.projectArea}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`capitalize text-xs ${statusColors[task.status] || ""}`}>
                  {task.status?.replace("_", " ")}
                </Badge>
                <Button variant="outline" size="icon" onClick={() => openEdit(task)} data-testid={`button-edit-task-${task.id}`}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(task.id)} data-testid={`button-delete-task-${task.id}`}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Task</DialogTitle>
            {editTask && <p className="text-sm text-muted-foreground mt-1">{editTask.title}</p>}
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Status</label>
              <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
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
              <Select value={form.companyId || "none"} onValueChange={v => setForm((f: any) => ({ ...f, companyId: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {companies.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Solution Notes</label>
              <Textarea value={form.solutionNotes} onChange={e => setForm((f: any) => ({ ...f, solutionNotes: e.target.value }))} rows={4} data-testid="input-solution-notes" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Architecture Notes</label>
              <Textarea value={form.architectureNotes} onChange={e => setForm((f: any) => ({ ...f, architectureNotes: e.target.value }))} rows={3} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">GitHub Link</label>
              <Input value={form.githubLink} onChange={e => setForm((f: any) => ({ ...f, githubLink: e.target.value }))} placeholder="https://github.com/..." data-testid="input-github-link" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Documentation Link</label>
              <Input value={form.documentationLink} onChange={e => setForm((f: any) => ({ ...f, documentationLink: e.target.value }))} />
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
