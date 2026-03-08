import { useState, useRef, useEffect, useCallback } from "react";
import { useTasks, useUpdateTask, useDeleteTask, useTaskLogs, useSubmitTask, useUploadFiles } from "@/hooks/use-tasks";
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
  Pencil, Trash2, Save, Loader2, Sparkles, Star, Send,
  GitBranch, Image, FileText, ExternalLink, MessageCircle,
  User, Bot, CheckCircle, XCircle, Clock, Upload, Paperclip,
  Bold, Italic, Code, List, Link
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { TaskLog } from "@shared/schema";

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

export default function ManageTasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: companies = [] } = useCompanies();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();

  const [editTask, setEditTask] = useState<any | null>(null);
  const [form, setForm] = useState<TaskForm>({} as TaskForm);
  const [detailTask, setDetailTask] = useState<any | null>(null);

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

  const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
    backlog: { color: "bg-secondary text-secondary-foreground", icon: Clock, label: "Backlog" },
    in_progress: { color: "bg-blue-500/10 text-blue-600", icon: MessageCircle, label: "Active" },
    completed: { color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle, label: "Closed" },
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold" data-testid="text-manage-tasks">Manage Tasks</h1>
        <p className="text-muted-foreground mt-1">Click any task to open details, submit work, and get AI reviews.</p>
      </div>

      <div className="space-y-3">
        {tasks.map((task: any) => {
          const sc = statusConfig[task.status] || statusConfig.backlog;
          const StatusIcon = sc.icon;
          return (
            <Card key={task.id} className="border-border/50 cursor-pointer card-hover" data-testid={`task-row-${task.id}`} onClick={() => setDetailTask(task)}>
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold truncate text-sm">{task.title}</p>
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
                <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                  <Badge variant="outline" className={`capitalize text-xs ${sc.color}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {sc.label}
                  </Badge>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(task)} data-testid={`button-edit-task-${task.id}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDelete(task.id)} data-testid={`button-delete-task-${task.id}`}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {detailTask && (
        <TaskDetailDialog
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

function TaskDetailDialog({ task, companies, onClose, onCloseTask, onReopenTask }: {
  task: any;
  companies: any[];
  onClose: () => void;
  onCloseTask: () => void;
  onReopenTask: () => void;
}) {
  const { data: logs = [], isLoading: logsLoading } = useTaskLogs(task.id);
  const submitTask = useSubmitTask();
  const uploadFiles = useUploadFiles();
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionGithub, setSubmissionGithub] = useState("");
  const [submissionScreenshot, setSubmissionScreenshot] = useState("");
  const [submissionFile, setSubmissionFile] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; size: number; type: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const companyName = task.companyId ? companies.find((c: any) => c.id === task.companyId)?.name : null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = submissionContent.slice(start, end);
    const newText = submissionContent.slice(0, start) + prefix + selected + suffix + submissionContent.slice(end);
    setSubmissionContent(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    try {
      const result = await uploadFiles.mutateAsync(files);
      setUploadedFiles(prev => [...prev, ...result.files]);
      const fileRefs = result.files.map(f => {
        if (f.type.startsWith("image/")) return `![${f.name}](${f.url})`;
        return `[${f.name}](${f.url})`;
      }).join("\n");
      setSubmissionContent(prev => prev ? prev + "\n\n" + fileRefs : fileRefs);
      toast({ title: `${result.files.length} file(s) uploaded` });
    } catch {
      toast({ title: "File upload failed", variant: "destructive" });
    }
  }, [uploadFiles, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) handleFileUpload(files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleSubmit = async () => {
    if (!submissionContent.trim()) {
      toast({ title: "Please describe your work.", variant: "destructive" });
      return;
    }
    try {
      const fileUrls = uploadedFiles.map(f => f.url);
      await submitTask.mutateAsync({
        id: task.id,
        content: submissionContent,
        ...(submissionGithub ? { githubLink: submissionGithub } : {}),
        ...(submissionScreenshot ? { screenshotUrl: submissionScreenshot } : {}),
        ...(submissionFile || fileUrls.length ? { fileUrl: submissionFile || fileUrls.join(", ") } : {}),
      });
      setSubmissionContent("");
      setSubmissionGithub("");
      setSubmissionScreenshot("");
      setSubmissionFile("");
      setShowAttachments(false);
      setUploadedFiles([]);
    } catch {
      toast({ title: "Failed to submit. Check your AI settings.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <div className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <DialogHeader>
                <DialogTitle className="font-display text-lg pr-8" data-testid="detail-task-title">{task.title}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {companyName && <Badge variant="outline" className="text-xs">{companyName}</Badge>}
                <Badge variant="outline" className="text-xs">{task.projectArea}</Badge>
                <Badge variant="outline" className="text-xs capitalize">{task.priority}</Badge>
                <Badge variant="outline" className={`text-xs ${task.status === "completed" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : task.status === "in_progress" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : ""}`}>
                  {task.status === "completed" ? "Closed" : task.status === "in_progress" ? "Active" : "Backlog"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {task.status !== "completed" ? (
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={onCloseTask} data-testid="button-close-task">
                  <CheckCircle className="w-3.5 h-3.5" /> Close Task
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={onReopenTask} data-testid="button-reopen-task">
                  <XCircle className="w-3.5 h-3.5" /> Reopen
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">{task.description}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
            <span>By: <span className="font-medium text-foreground">{task.requestedBy}</span></span>
            {task.recommendedRole && <span>Role: <span className="font-medium text-foreground">{task.recommendedRole}</span></span>}
            {task.githubLink && (
              <a href={task.githubLink} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <GitBranch className="w-3 h-3" /> GitHub
              </a>
            )}
            {task.documentationLink && (
              <a href={task.documentationLink} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Docs
              </a>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[200px] max-h-[400px]" data-testid="conversation-log">
          {logsLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!logsLoading && logs.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No submissions yet</p>
              <p className="text-xs mt-1">Submit your work below to start an AI review conversation.</p>
            </div>
          )}
          {logs.map((log: TaskLog) => (
            <LogEntry key={log.id} log={log} />
          ))}
          <div ref={chatEndRef} />
        </div>

        {task.status !== "completed" && (
          <div
            className={`border-t border-border/50 p-4 bg-card/50 transition-colors ${isDragging ? "bg-primary/5 border-primary/30" : ""}`}
            data-testid="submission-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.md,.sql,.py,.ts,.js,.json,.csv,.xlsx,.zip"
              className="hidden"
              onChange={e => {
                const files = Array.from(e.target.files || []);
                if (files.length) handleFileUpload(files);
                e.target.value = "";
              }}
              data-testid="input-file-upload"
            />
            <div className="space-y-3">
              <div className="flex items-center gap-1 border-b border-border/30 pb-2">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertMarkdown("**", "**")} title="Bold" data-testid="button-md-bold">
                  <Bold className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertMarkdown("*", "*")} title="Italic" data-testid="button-md-italic">
                  <Italic className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertMarkdown("`", "`")} title="Inline code" data-testid="button-md-code">
                  <Code className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertMarkdown("```\n", "\n```")} title="Code block" data-testid="button-md-codeblock">
                  <Code className="w-3.5 h-3.5 text-primary" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertMarkdown("- ")} title="List" data-testid="button-md-list">
                  <List className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertMarkdown("[", "](url)")} title="Link" data-testid="button-md-link">
                  <Link className="w-3.5 h-3.5" />
                </Button>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1 text-muted-foreground"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadFiles.isPending}
                  data-testid="button-upload-file"
                >
                  {uploadFiles.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  Upload
                </Button>
              </div>

              <Textarea
                ref={textareaRef}
                value={submissionContent}
                onChange={e => setSubmissionContent(e.target.value)}
                placeholder="Describe your work using Markdown... drag & drop files here"
                rows={4}
                className="resize-none font-mono text-sm"
                data-testid="input-submission-content"
              />

              {uploadedFiles.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {uploadedFiles.map((f, i) => (
                    <Badge key={i} variant="secondary" className="text-xs gap-1 py-1">
                      <Paperclip className="w-3 h-3" />
                      {f.name}
                      <button
                        className="ml-1 hover:text-destructive"
                        onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {isDragging && (
                <div className="border-2 border-dashed border-primary/40 rounded-lg p-6 text-center bg-primary/5">
                  <Upload className="w-6 h-6 mx-auto text-primary/60 mb-1" />
                  <p className="text-xs text-primary/60 font-medium">Drop files here to upload</p>
                </div>
              )}

              {showAttachments && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Input
                      value={submissionGithub}
                      onChange={e => setSubmissionGithub(e.target.value)}
                      placeholder="GitHub link..."
                      className="h-8 text-xs"
                      data-testid="input-submission-github"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Input
                      value={submissionScreenshot}
                      onChange={e => setSubmissionScreenshot(e.target.value)}
                      placeholder="Screenshot URL..."
                      className="h-8 text-xs"
                      data-testid="input-submission-screenshot"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <Input
                      value={submissionFile}
                      onChange={e => setSubmissionFile(e.target.value)}
                      placeholder="File URL..."
                      className="h-8 text-xs"
                      data-testid="input-submission-file"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground gap-1"
                  onClick={() => setShowAttachments(!showAttachments)}
                  data-testid="button-toggle-attachments"
                >
                  <GitBranch className="w-3 h-3" />
                  {showAttachments ? "Hide links" : "Add links"}
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={handleSubmit}
                  disabled={submitTask.isPending || !submissionContent.trim()}
                  data-testid="button-submit-review"
                >
                  {submitTask.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Submit for AI Review
                </Button>
              </div>
            </div>
          </div>
        )}

        {task.status === "completed" && (
          <div className="border-t border-border/50 p-4 bg-emerald-500/5 text-center">
            <p className="text-sm text-emerald-600 font-medium flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> This task is closed
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LogEntry({ log }: { log: TaskLog }) {
  const isUser = log.role === "user";
  const timestamp = new Date(log.createdAt).toLocaleString();
  let attachments: Record<string, string> = {};
  if (log.attachments) {
    try { attachments = JSON.parse(log.attachments); } catch {}
  }

  if (isUser) {
    return (
      <div className="flex gap-3" data-testid={`log-entry-${log.id}`}>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold">You</span>
            <span className="text-[10px] text-muted-foreground">{timestamp}</span>
          </div>
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
            <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:bg-secondary prose-pre:text-foreground prose-code:text-primary prose-headings:text-foreground prose-a:text-primary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{log.content}</ReactMarkdown>
            </div>
            {Object.keys(attachments).length > 0 && (
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-primary/10 flex-wrap">
                {attachments.githubLink && (
                  <a href={attachments.githubLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    <GitBranch className="w-3 h-3" /> GitHub
                  </a>
                )}
                {attachments.screenshotUrl && (
                  <a href={attachments.screenshotUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Image className="w-3 h-3" /> Screenshot
                  </a>
                )}
                {attachments.fileUrl && (
                  <a href={attachments.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    <FileText className="w-3 h-3" /> File
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  let aiData: any = {};
  try { aiData = JSON.parse(log.content); } catch { aiData = { feedback: log.content }; }

  return (
    <div className="flex gap-3" data-testid={`log-entry-${log.id}`}>
      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-4 h-4 text-purple-500" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold">AI Reviewer</span>
          <span className="text-[10px] text-muted-foreground">{timestamp}</span>
          {aiData.score !== undefined && (
            <span className="flex items-center gap-0.5 text-xs">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="font-bold">{aiData.score}</span>
              <span className="text-muted-foreground">/10</span>
            </span>
          )}
          {aiData.readyToClose && (
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Ready to close</Badge>
          )}
        </div>
        <div className="bg-secondary/50 border border-border/50 rounded-lg p-3">
          <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:bg-background prose-pre:text-foreground prose-code:text-primary prose-headings:text-foreground prose-a:text-primary">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiData.feedback || aiData.summary || log.content}</ReactMarkdown>
          </div>
          {aiData.actionItems?.length > 0 && (
            <div className="mt-3 pt-2 border-t border-border/50">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Action Items
              </p>
              <ul className="space-y-1">
                {aiData.actionItems.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-foreground/80 flex gap-1.5">
                    <span className="text-muted-foreground shrink-0">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
