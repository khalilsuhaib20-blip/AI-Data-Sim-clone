import { useState } from "react";
import { useCompanies } from "@/hooks/use-companies";
import { useGenerateTask } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";

export default function GenerateTask() {
  const { data: companies = [] } = useCompanies();
  const generateTask = useGenerateTask();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [generatedTask, setGeneratedTask] = useState<any>(null);

  const handleGenerate = async () => {
    try {
      const result = await generateTask.mutateAsync(companyId ? Number(companyId) : undefined);
      setGeneratedTask(result);
      toast({ title: "Task generated successfully!" });
    } catch {
      toast({ title: "Failed to generate task.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-display font-bold" data-testid="text-generate-heading">Generate AI Task</h1>
        <p className="text-muted-foreground mt-2 text-lg">Use AI to create a realistic engineering task.</p>
      </div>

      <Card className="border-border/50 mb-8">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Select Company (optional)</label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger data-testid="select-company"><SelectValue placeholder="All companies" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any company</SelectItem>
                {companies.map((c: any) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.industry})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Selecting a company will tailor the task to that company's industry.</p>
          </div>

          <Button onClick={handleGenerate} disabled={generateTask.isPending} className="w-full h-12 text-base font-bold" data-testid="button-generate">
            {generateTask.isPending ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            {generateTask.isPending ? "Generating task with AI..." : "Generate New Task"}
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
          <CardContent className="space-y-3">
            <h3 className="font-display font-bold text-lg" data-testid="text-generated-title">{generatedTask.title}</h3>
            <p className="text-sm text-muted-foreground">{generatedTask.description}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{generatedTask.requestedBy}</Badge>
              <Badge variant="outline" className="capitalize">{generatedTask.priority}</Badge>
              <Badge variant="outline">{generatedTask.projectArea}</Badge>
              {generatedTask.recommendedRole && <Badge variant="outline">{generatedTask.recommendedRole}</Badge>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
