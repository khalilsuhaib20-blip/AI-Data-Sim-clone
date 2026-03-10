import { useState } from "react";
import { useCompanies, useRoadmap } from "@/hooks/use-companies";
import { useGenerateTask } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, CheckCircle, Target, ListChecks, Package, Briefcase, BarChart3 } from "lucide-react";

export default function GenerateTask() {
  const { data: companies = [] } = useCompanies();
  const generateTask = useGenerateTask();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [milestoneId, setMilestoneId] = useState<string>("");
  const [generatedTask, setGeneratedTask] = useState<any>(null);

  const selectedCompanyId = companyId ? Number(companyId) : null;
  const { data: roadmap = [] } = useRoadmap(selectedCompanyId);

  const phases = [...new Set(roadmap.map((r: any) => r.phase))];

  const handleGenerate = async () => {
    try {
      const result = await generateTask.mutateAsync({
        companyId: companyId ? Number(companyId) : undefined,
        milestoneId: milestoneId ? Number(milestoneId) : undefined,
      });
      setGeneratedTask(result);
      toast({ title: "Task generated successfully!" });
    } catch {
      toast({ title: "Failed to generate task.", variant: "destructive" });
    }
  };

  let subtasks: string[] = [];
  let deliverables: string[] = [];
  if (generatedTask) {
    try { subtasks = generatedTask.subtasks ? JSON.parse(generatedTask.subtasks) : []; } catch {}
    try { deliverables = generatedTask.deliverables ? JSON.parse(generatedTask.deliverables) : []; } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-display font-bold" data-testid="text-generate-heading">CTO Task Generator</h1>
        <p className="text-muted-foreground mt-2 text-lg">Generate realistic engineering tickets like a CTO assigning work.</p>
      </div>

      <Card className="border-border/50 mb-8">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Company / Project</label>
            <Select value={companyId || "none"} onValueChange={v => { setCompanyId(v === "none" ? "" : v); setMilestoneId(""); }}>
              <SelectTrigger data-testid="select-company"><SelectValue placeholder="All companies" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Any company</SelectItem>
                {companies.map((c: any) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.industry})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">The AI will use the company's tech stack, architecture, and roadmap for context.</p>
          </div>

          {roadmap.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Target Milestone (optional)</label>
              <Select value={milestoneId || "none"} onValueChange={v => setMilestoneId(v === "none" ? "" : v)}>
                <SelectTrigger data-testid="select-milestone"><SelectValue placeholder="Any milestone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any milestone</SelectItem>
                  {phases.map((phase: string) => {
                    const items = roadmap.filter((r: any) => r.phase === phase);
                    return items.map((r: any) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.phase} → {r.milestone}
                      </SelectItem>
                    ));
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Focus the generated task on a specific roadmap milestone.</p>
            </div>
          )}

          <Button onClick={handleGenerate} disabled={generateTask.isPending} className="w-full h-12 text-base font-bold" data-testid="button-generate">
            {generateTask.isPending ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            {generateTask.isPending ? "CTO is writing ticket..." : "Generate Engineering Task"}
          </Button>
        </CardContent>
      </Card>

      {generatedTask && (
        <Card className="border-border/50 border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Generated Task
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-display font-bold text-lg" data-testid="text-generated-title">{generatedTask.title}</h3>
            <p className="text-sm text-muted-foreground">{generatedTask.description}</p>

            {generatedTask.businessContext && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-600">Business Context</span>
                </div>
                <p className="text-sm text-foreground/80">{generatedTask.businessContext}</p>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" data-testid="badge-requested-by">
                <Target className="w-3 h-3 mr-1" /> {generatedTask.requestedBy}
              </Badge>
              {generatedTask.assignedRole && (
                <Badge variant="outline" data-testid="badge-assigned-role">
                  Assigned: {generatedTask.assignedRole}
                </Badge>
              )}
              <Badge variant="outline" className="capitalize" data-testid="badge-priority">{generatedTask.priority}</Badge>
              <Badge variant="outline" data-testid="badge-area">{generatedTask.projectArea}</Badge>
              {generatedTask.difficulty && (
                <Badge variant="outline" className="capitalize" data-testid="badge-difficulty">
                  <BarChart3 className="w-3 h-3 mr-1" /> {generatedTask.difficulty}
                </Badge>
              )}
            </div>

            {subtasks.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <ListChecks className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Subtasks</span>
                </div>
                <ul className="space-y-1.5">
                  {subtasks.map((st, i) => (
                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                      <span className="w-5 h-5 rounded border border-border/50 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-muted-foreground">{i + 1}</span>
                      {st}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {deliverables.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Deliverables</span>
                </div>
                <ul className="space-y-1">
                  {deliverables.map((d, i) => (
                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                      <span className="text-primary shrink-0">•</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
