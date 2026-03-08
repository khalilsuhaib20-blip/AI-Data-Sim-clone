import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Mail, MessageSquare } from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [relatedCompany, setRelatedCompany] = useState("");
  const [relatedTask, setRelatedTask] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, relatedCompany: relatedCompany || null, relatedTask: relatedTask || null }),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast({ title: "Message sent! I'll get back to you soon." });
      setName(""); setEmail(""); setMessage(""); setRelatedCompany(""); setRelatedTask("");
    } catch {
      toast({ title: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-display font-bold" data-testid="text-contact-heading">Get in Touch</h1>
        <p className="text-muted-foreground mt-2 text-lg">Interested in my work? Send me a message.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Contact Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Name *</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" data-testid="input-name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Email *</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" data-testid="input-email" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Message *</label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell me what you're interested in..." rows={5} data-testid="input-message" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Related Company (optional)</label>
                <Input value={relatedCompany} onChange={e => setRelatedCompany(e.target.value)} placeholder="e.g. TechFlow Analytics" data-testid="input-company" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Related Task (optional)</label>
                <Input value={relatedTask} onChange={e => setRelatedTask(e.target.value)} placeholder="e.g. ETL Pipeline" data-testid="input-task" />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-bold" data-testid="button-submit">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
