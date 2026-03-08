import { useRoute, Link } from "wouter";
import { useCompany } from "@/hooks/use-companies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Calendar, Loader2, GitBranch, MessageSquare } from "lucide-react";

export default function CompanyDetails() {
  const [, params] = useRoute("/companies/:id");
  const id = Number(params?.id);
  const { data: company, isLoading } = useCompany(id);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Company not found.</p>
        <Link href="/companies">
          <Button variant="outline" className="mt-4">Back to Companies</Button>
        </Link>
      </div>
    );
  }

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-500/10 text-red-600",
    high: "bg-orange-500/10 text-orange-600",
    medium: "bg-amber-500/10 text-amber-600",
    low: "bg-blue-500/10 text-blue-600",
  };

  const statusColors: Record<string, string> = {
    backlog: "bg-secondary text-secondary-foreground",
    in_progress: "bg-blue-500/10 text-blue-600",
    completed: "bg-emerald-500/10 text-emerald-600",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/companies">
        <Button variant="ghost" className="mb-6 text-muted-foreground" data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Companies
        </Button>
      </Link>

      <div className="bg-card rounded-2xl border border-border/50 p-8 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold" data-testid="text-company-name">{company.name}</h1>
              <p className="text-muted-foreground font-medium">{company.industry}</p>
            </div>
          </div>
          <Badge variant={company.status === "active" ? "default" : "secondary"} className="capitalize" data-testid="badge-status">
            {company.status}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-4 leading-relaxed">{company.description}</p>
        {company.startDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
            <Calendar className="w-4 h-4" />
            Started: {company.startDate}
            {company.endDate && ` - Ended: ${company.endDate}`}
          </div>
        )}
      </div>

      <h2 className="text-2xl font-display font-bold mb-6">Tasks ({company.tasks?.length || 0})</h2>
      <div className="space-y-4">
        {company.tasks?.map((task: any) => (
          <Link key={task.id} href={`/tasks/${task.id}`}>
            <div className="bg-card rounded-xl border border-border/50 p-5 card-hover cursor-pointer" data-testid={`card-task-${task.id}`}>
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <h3 className="font-display font-bold text-foreground">{task.title}</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className={`capitalize text-xs ${priorityColors[task.priority] || ""}`}>
                    {task.priority}
                  </Badge>
                  <Badge variant="outline" className={`capitalize text-xs ${statusColors[task.status] || ""}`}>
                    {task.status?.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium flex-wrap">
                <span className="bg-secondary px-2 py-1 rounded-md">{task.requestedBy}</span>
                <span>{task.projectArea}</span>
                {task.solutionNotes && <MessageSquare className="w-3.5 h-3.5 text-primary" />}
                {task.githubLink && <GitBranch className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
            </div>
          </Link>
        ))}
        {(!company.tasks || company.tasks.length === 0) && (
          <p className="text-muted-foreground text-center py-8">No tasks yet for this company.</p>
        )}
      </div>
    </div>
  );
}
