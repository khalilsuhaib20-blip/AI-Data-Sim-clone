import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Bot, Save, Loader2, RotateCcw, ChevronDown, ChevronUp, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const PROMPT_DEFINITIONS = [
  {
    key: "prompt_task_generate",
    title: "Task Generator (CTO Simulator)",
    description: "Controls how the AI generates Jira-style engineering tasks. This is the most impactful prompt — it sets the AI persona, tone, and output format.",
    variables: ["Company name/industry", "Tech stack", "Architecture", "Roadmap context", "Available roles", "Recent tasks (to avoid duplicates)", "Selected milestone"],
  },
  {
    key: "prompt_company_suggest",
    title: "Company Tech Suggester",
    description: "Generates tech stack, architecture description, project phases, and team roles for a new company based on its industry and description.",
    variables: ["Company name", "Industry", "Description"],
  },
  {
    key: "prompt_roadmap_generate",
    title: "Roadmap Generator",
    description: "Creates a structured project roadmap with phases and milestones for a company.",
    variables: ["Company name/industry/description", "Tech stack", "Architecture", "Phase list"],
  },
  {
    key: "prompt_roadmap_evolve",
    title: "Roadmap Evolution (Events)",
    description: "Simulates realistic project events (incidents, feature requests, tech debt) that add new milestones to the roadmap.",
    variables: ["Company info", "Tech stack", "Current roadmap", "Completed and active tasks"],
  },
  {
    key: "prompt_incident_simulate",
    title: "Incident Simulator",
    description: "Generates a realistic production incident for a company. Creates an urgent task automatically.",
    variables: ["Company name/industry/description", "Tech stack"],
  },
];

export default function PromptsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const { data: settings = {}, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const p of PROMPT_DEFINITIONS) {
      if (settings[p.key] !== undefined) {
        initial[p.key] = settings[p.key];
      }
    }
    setDrafts(prev => ({ ...initial, ...prev }));
  }, [settings]);

  const handleSave = async (key: string) => {
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [key]: drafts[key] || "" }),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Prompt saved." });
    } catch {
      toast({ title: "Failed to save prompt.", variant: "destructive" });
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  const handleReset = async (key: string) => {
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await fetch(`/api/settings/${key}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setDrafts(d => ({ ...d, [key]: "" }));
      toast({ title: "Prompt reset to default." });
    } catch {
      toast({ title: "Failed to reset prompt.", variant: "destructive" });
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  const toggleExpand = (key: string) => setExpanded(e => ({ ...e, [key]: !e[key] }));

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-prompts-heading">AI Prompts</h1>
        </div>
        <p className="text-muted-foreground mt-1 ml-13">
          Customize the instructions given to the AI for each feature. Changes take effect immediately on the next generation.
          Reset to restore the original default.
        </p>
        <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Each prompt controls the AI's <strong>instruction</strong> part. Dynamic context (company name, tech stack, recent tasks, etc.)
            is always appended automatically by the server — you don't need to include it in the prompt.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {PROMPT_DEFINITIONS.map((prompt) => {
          const currentValue = drafts[prompt.key] ?? settings[prompt.key] ?? "";
          const isExpanded = expanded[prompt.key];
          const isSaving = saving[prompt.key];
          const hasCustomValue = settings[prompt.key] && settings[prompt.key].length > 0;

          return (
            <Card key={prompt.key} className="border-border/50" data-testid={`prompt-card-${prompt.key}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-display flex items-center gap-2">
                      {prompt.title}
                      {hasCustomValue && (
                        <Badge variant="secondary" className="text-[10px]">Custom</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs">{prompt.description}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(prompt.key)}
                    data-testid={`button-expand-${prompt.key}`}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[10px] text-muted-foreground font-medium">Auto-injected context:</span>
                  {prompt.variables.map(v => (
                    <Badge key={v} variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">{v}</Badge>
                  ))}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-3">
                  <Textarea
                    value={currentValue}
                    onChange={e => setDrafts(d => ({ ...d, [prompt.key]: e.target.value }))}
                    rows={12}
                    className="font-mono text-xs resize-y"
                    placeholder="Using server default. Edit to customize..."
                    data-testid={`textarea-${prompt.key}`}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReset(prompt.key)}
                      disabled={isSaving || !hasCustomValue}
                      data-testid={`button-reset-${prompt.key}`}
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 mr-1.5" />}
                      Reset to Default
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSave(prompt.key)}
                      disabled={isSaving}
                      data-testid={`button-save-${prompt.key}`}
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                      Save Prompt
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
