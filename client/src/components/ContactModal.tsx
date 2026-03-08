import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Mail, FileText, GitBranch, ExternalLink } from "lucide-react";
import type { Task } from "@shared/schema";

interface ContactModalProps {
  task: Task | null;
  onClose: () => void;
}

export function ContactModal({ task, onClose }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          relatedCompany: null,
          relatedTask: task?.title || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast({ title: "Message sent! I'll get back to you soon." });
      setName("");
      setEmail("");
      setMessage("");
      onClose();
    } catch {
      toast({ title: "Failed to send message.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  const statusLabel: Record<string, string> = {
    backlog: "Backlog",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return (
    <Dialog open={!!task} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Contact About This Task</DialogTitle>
        </DialogHeader>

        <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 mb-2">
          <h4 className="font-display font-bold text-sm mb-2">{task.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{task.description}</p>
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 capitalize">{task.priority}</Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">{task.projectArea}</Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 capitalize">{statusLabel[task.status || "backlog"]}</Badge>
          </div>

          {task.solutionNotes && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                <FileText className="w-3 h-3" /> Solution Notes
              </p>
              <p className="text-xs text-foreground/70">{task.solutionNotes}</p>
            </div>
          )}

          {task.architectureNotes && (
            <div className="mt-2">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">Architecture</p>
              <p className="text-xs text-foreground/70">{task.architectureNotes}</p>
            </div>
          )}

          <div className="flex gap-2 mt-3 flex-wrap">
            {task.githubLink && (
              <a href={task.githubLink} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1">
                  <GitBranch className="w-3 h-3" /> GitHub <ExternalLink className="w-2.5 h-2.5" />
                </Button>
              </a>
            )}
            {task.documentationLink && (
              <a href={task.documentationLink} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1">
                  <FileText className="w-3 h-3" /> Docs <ExternalLink className="w-2.5 h-2.5" />
                </Button>
              </a>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" data-testid="modal-input-name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" data-testid="modal-input-email" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Message</label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="I'd like to learn more about this work..." rows={3} data-testid="modal-input-message" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} data-testid="modal-button-send">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
