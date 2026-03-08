import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useCompanies } from "@/hooks/use-companies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, Building2, Users, Briefcase, CheckCircle, Clock, ArrowLeft,
  Mail, GitBranch, Wrench, BarChart3, TrendingUp, FileText, ChevronRight
} from "lucide-react";
import { TimelineView } from "@/components/views/TimelineView";
import { ContactModal } from "@/components/ContactModal";
import type { Task, Company } from "@shared/schema";

export default function PortfolioDashboard() {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [contactTask, setContactTask] = useState<Task | null>(null);

  const companyMap = useMemo(() => {
    const map: Record<number, string> = {};
    companies.forEach((c: Company) => { map[c.id] = c.name; });
    return map;
  }, [companies]);

  const projectData = useMemo(() => {
    return companies.map((c: Company) => {
      const companyTasks = tasks.filter((t: Task) => t.companyId === c.id);
      const roles = new Set<string>();
      const areas = new Set<string>();
      companyTasks.forEach((t: Task) => {
        if (t.requestedBy) roles.add(t.requestedBy);
        if (t.recommendedRole) roles.add(t.recommendedRole);
        areas.add(t.projectArea);
      });
      return {
        ...c,
        taskCount: companyTasks.length,
        completedCount: companyTasks.filter((t: Task) => t.status === "completed").length,
        inProgressCount: companyTasks.filter((t: Task) => t.status === "in_progress").length,
        roles: Array.from(roles),
        areas: Array.from(areas),
        tasks: companyTasks,
      };
    });
  }, [companies, tasks]);

  const completedTasks = useMemo(() => {
    const completed = tasks.filter((t: Task) => t.status === "completed");
    const shuffled = [...completed].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [tasks]);

  const overallStats = useMemo(() => {
    const allRoles = new Set<string>();
    const allAreas = new Set<string>();
    const allTools = new Set<string>();
    tasks.forEach((t: Task) => {
      if (t.requestedBy) allRoles.add(t.requestedBy);
      if (t.recommendedRole) allRoles.add(t.recommendedRole);
      allAreas.add(t.projectArea);
      if (t.solutionNotes) {
        const toolMatches = t.solutionNotes.match(/(?:Apache\s+)?\b(?:Kafka|Flink|Spark|dbt|Snowflake|Fivetran|MLflow|Kubernetes|Evidently|Docker|Airflow|PostgreSQL|Python|SQL|Pandas|TensorFlow|PyTorch|Scikit-learn|AWS|GCP|Azure|BigQuery|Redshift|Looker|Tableau|Power BI|Databricks|Delta Lake|Great Expectations)\b/gi);
        if (toolMatches) toolMatches.forEach(t => allTools.add(t));
      }
      if (t.architectureNotes) {
        const toolMatches = t.architectureNotes.match(/(?:Apache\s+)?\b(?:Kafka|Flink|Spark|dbt|Snowflake|Fivetran|MLflow|Kubernetes|Evidently|Docker|Airflow|PostgreSQL|Python|SQL|Pandas|TensorFlow|PyTorch|Scikit-learn|AWS|GCP|Azure|BigQuery|Redshift|Looker|Tableau|Power BI|Databricks|Delta Lake|Great Expectations)\b/gi);
        if (toolMatches) toolMatches.forEach(t => allTools.add(t));
      }
    });
    return {
      totalTasks: tasks.length,
      completed: tasks.filter((t: Task) => t.status === "completed").length,
      inProgress: tasks.filter((t: Task) => t.status === "in_progress").length,
      companies: companies.length,
      roles: Array.from(allRoles),
      areas: Array.from(allAreas),
      tools: Array.from(allTools),
    };
  }, [tasks, companies]);

  const selectedProjectData = useMemo(() => {
    if (!selectedProject) return null;
    return projectData.find(p => p.id === selectedProject) || null;
  }, [selectedProject, projectData]);

  if (tasksLoading || companiesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedProjectData) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border/40 bg-card/50">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <Button variant="ghost" size="sm" className="mb-3 text-muted-foreground -ml-2" onClick={() => setSelectedProject(null)} data-testid="button-back-projects">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Projects
            </Button>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold" data-testid="text-project-name">{selectedProjectData.name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm text-muted-foreground font-medium">{selectedProjectData.industry}</span>
                    <Badge variant={selectedProjectData.status === "active" ? "default" : "secondary"} className="capitalize text-xs">{selectedProjectData.status}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold">{selectedProjectData.taskCount} <span className="font-normal text-muted-foreground">tasks</span></span>
                <span className="text-emerald-600 font-semibold">{selectedProjectData.completedCount} <span className="font-normal text-muted-foreground">done</span></span>
                <span className="text-blue-600 font-semibold">{selectedProjectData.inProgressCount} <span className="font-normal text-muted-foreground">active</span></span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 max-w-3xl">{selectedProjectData.description}</p>
          </div>
        </div>
        <div className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {selectedProjectData.tasks.length > 0 ? (
            <TimelineView tasks={selectedProjectData.tasks} companyMap={companyMap} onContact={setContactTask} />
          ) : (
            <p className="text-center text-muted-foreground py-16">No tasks yet for this project.</p>
          )}
        </div>
        <ContactModal task={contactTask} onClose={() => setContactTask(null)} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-border/40 bg-card/50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight" data-testid="text-portfolio-heading">
            Data Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Portfolio</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-2xl">
            Simulated projects across industries — exploring Data Engineering, Data Science, Analytics, and MLOps through real-world scenarios.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeading icon={<Building2 className="w-5 h-5 text-primary" />} title="Projects" count={projectData.length} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {projectData.map(project => (
            <button
              key={project.id}
              className="text-left bg-card rounded-2xl border border-border/50 p-5 card-hover group cursor-pointer"
              onClick={() => setSelectedProject(project.id)}
              data-testid={`project-card-${project.id}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <Badge variant={project.status === "active" ? "default" : "secondary"} className="capitalize text-xs">{project.status}</Badge>
              </div>

              <h3 className="font-display font-bold text-lg mb-1 group-hover:text-primary transition-colors" data-testid={`project-name-${project.id}`}>
                {project.name}
              </h3>
              <p className="text-sm text-muted-foreground font-medium mb-3">{project.industry}</p>
              <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-4">{project.description}</p>

              <div className="grid grid-cols-3 gap-2 mb-4 bg-secondary/30 rounded-xl p-3 border border-border/30">
                <div className="text-center">
                  <p className="text-lg font-display font-bold">{project.taskCount}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-display font-bold text-emerald-600">{project.completedCount}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Done</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-display font-bold text-blue-600">{project.inProgressCount}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Active</p>
                </div>
              </div>

              {project.roles.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Roles
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.roles.slice(0, 4).map(r => (
                      <Badge key={r} variant="outline" className="text-[10px] px-1.5 py-0 h-5">{r}</Badge>
                    ))}
                    {project.roles.length > 4 && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">+{project.roles.length - 4}</Badge>}
                  </div>
                </div>
              )}

              {project.areas.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Areas
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.areas.map(a => (
                      <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-primary/5 text-primary border-primary/20">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end text-xs text-primary font-medium gap-1 pt-2 border-t border-border/30">
                View Tasks <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>

        <SectionHeading icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} title="Completed Work" subtitle="Highlighted tasks that have been delivered" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {completedTasks.map(task => (
            <div key={task.id} className="bg-card rounded-xl border border-border/50 border-l-4 border-l-emerald-500 p-5" data-testid={`completed-task-${task.id}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-display font-bold text-sm">{task.title}</h4>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shrink-0">
                  Completed
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
              {task.solutionNotes && (
                <div className="bg-secondary/30 rounded-lg p-3 border border-border/30 mb-3">
                  <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                    <FileText className="w-3 h-3" /> Solution
                  </p>
                  <p className="text-xs text-foreground/80">{task.solutionNotes}</p>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">{task.projectArea}</Badge>
                  {task.companyId && companyMap[task.companyId] && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">{companyMap[task.companyId]}</Badge>
                  )}
                  {task.githubLink && (
                    <a href={task.githubLink} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-600">
                      <GitBranch className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-primary gap-1"
                  onClick={() => setContactTask(task)}
                  data-testid={`button-contact-completed-${task.id}`}
                >
                  <Mail className="w-3 h-3" /> Contact
                </Button>
              </div>
            </div>
          ))}
          {completedTasks.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No completed tasks yet.</p>
          )}
        </div>

        <SectionHeading icon={<TrendingUp className="w-5 h-5 text-blue-500" />} title="Milestones & Overview" subtitle="Summary of skills, tools, and topics covered across all projects" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MilestoneCard icon={<Building2 className="w-5 h-5 text-blue-500" />} label="Projects" value={overallStats.companies} />
          <MilestoneCard icon={<BarChart3 className="w-5 h-5 text-purple-500" />} label="Total Tasks" value={overallStats.totalTasks} />
          <MilestoneCard icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} label="Completed" value={overallStats.completed} />
          <MilestoneCard icon={<Clock className="w-5 h-5 text-amber-500" />} label="In Progress" value={overallStats.inProgress} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <TagCloud title="Roles" icon={<Users className="w-4 h-4 text-primary" />} items={overallStats.roles} color="bg-primary/5 text-primary border-primary/20" testId="roles-cloud" />
          <TagCloud title="Project Areas" icon={<Briefcase className="w-4 h-4 text-emerald-500" />} items={overallStats.areas} color="bg-emerald-500/5 text-emerald-600 border-emerald-500/20" testId="areas-cloud" />
          <TagCloud title="Tools & Technologies" icon={<Wrench className="w-4 h-4 text-amber-500" />} items={overallStats.tools} color="bg-amber-500/5 text-amber-600 border-amber-500/20" testId="tools-cloud" />
        </div>
      </div>

      <ContactModal task={contactTask} onClose={() => setContactTask(null)} />
    </div>
  );
}

function SectionHeading({ icon, title, count, subtitle }: { icon: React.ReactNode; title: string; count?: number; subtitle?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-xl font-display font-bold">{title}</h2>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full">{count}</span>
        )}
      </div>
      {subtitle && <p className="text-sm text-muted-foreground mt-1 ml-7">{subtitle}</p>}
    </div>
  );
}

function MilestoneCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-5" data-testid={`milestone-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">{icon}</div>
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-3xl font-display font-bold">{value}</p>
    </div>
  );
}

function TagCloud({ title, icon, items, color, testId }: { title: string; icon: React.ReactNode; items: string[]; color: string; testId: string }) {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-5" data-testid={testId}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-display font-bold">{title}</h3>
      </div>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map(item => (
            <Badge key={item} variant="outline" className={`text-xs px-2 py-0.5 ${color}`}>{item}</Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No data yet.</p>
      )}
    </div>
  );
}
