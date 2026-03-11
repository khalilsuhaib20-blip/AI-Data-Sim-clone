import { useState, useMemo, lazy, Suspense } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useCompanies, useRoadmap } from "@/hooks/use-companies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, Building2, Users, Briefcase, CheckCircle, Clock, ArrowLeft,
  Mail, GitBranch, Wrench, BarChart3, TrendingUp, FileText, ChevronRight,
  Cpu, Layers, Target, ChevronDown, ChevronUp, Printer, AlertTriangle,
  Database, Brain, Zap, LayoutDashboard, Code, UserCircle, Server,
} from "lucide-react";
import { SiLinkedin } from "react-icons/si";
import { TimelineView } from "@/components/views/TimelineView";
import { ContactModal } from "@/components/ContactModal";
import { GitHubRepoCard } from "@/components/GitHubRepoCard";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { Task, Company } from "@shared/schema";

const MermaidDiagram = lazy(() =>
  import("@/components/MermaidDiagram").then(m => ({ default: m.MermaidDiagram }))
);

const TECH_CATEGORY_MAP: { label: string; color: string; tools: string[] }[] = [
  {
    label: "Microsoft",
    color: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
    tools: ["Excel", "Power BI", "Power Apps", "Power Automate", "Power Virtual Agents", "Azure Data Factory", "Azure Synapse Analytics", "Microsoft Fabric"],
  },
  {
    label: "Data Engineering",
    color: "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-400",
    tools: ["Apache Kafka", "Apache Flink", "Apache Spark", "Apache Airflow", "dbt", "Fivetran", "Airbyte", "Databricks", "Snowflake", "BigQuery", "Amazon Redshift", "PostgreSQL", "MySQL", "MongoDB"],
  },
  {
    label: "ML / AI",
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
    tools: ["Python", "scikit-learn", "TensorFlow", "PyTorch", "MLflow", "Evidently AI", "Hugging Face", "LangChain", "OpenAI"],
  },
  {
    label: "DevOps / Infra",
    color: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
    tools: ["Kubernetes", "Docker", "Terraform", "GitHub Actions", "AWS", "GCP", "Azure", "Helm"],
  },
  {
    label: "Analytics / BI",
    color: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
    tools: ["Tableau", "Looker", "Metabase", "Grafana", "Apache Superset"],
  },
];

function getTechColor(tool: string): string {
  const normalized = tool.trim().toLowerCase();
  for (const cat of TECH_CATEGORY_MAP) {
    if (cat.tools.some(t => t.toLowerCase() === normalized)) return cat.color;
  }
  return "bg-secondary/80 text-secondary-foreground border-border/40";
}

function getTechCategoryLabel(tool: string): string {
  const normalized = tool.trim().toLowerCase();
  for (const cat of TECH_CATEGORY_MAP) {
    if (cat.tools.some(t => t.toLowerCase() === normalized)) return cat.label;
  }
  return "Other";
}

const ROLE_ICONS: Record<string, any> = {
  "data engineer": Database,
  "data engineering": Database,
  "data scientist": Brain,
  "data science": Brain,
  "ml engineer": Zap,
  "mlops engineer": Zap,
  "mlops": Zap,
  "data analyst": BarChart3,
  "analytics engineer": BarChart3,
  "software engineer": Code,
  "backend engineer": Server,
  "frontend engineer": LayoutDashboard,
  "stakeholder": UserCircle,
};

function getRoleIcon(role: string) {
  const key = role.toLowerCase();
  for (const [k, Icon] of Object.entries(ROLE_ICONS)) {
    if (key.includes(k)) return Icon;
  }
  return UserCircle;
}

function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [val];
  } catch {
    return val.includes(",") ? val.split(",").map(s => s.trim()).filter(Boolean) : [val];
  }
}

function groupTechStack(techStack: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const tool of techStack) {
    const cat = getTechCategoryLabel(tool);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(tool);
  }
  return groups;
}

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
        if (t.assignedRole) roles.add(t.assignedRole);
        areas.add(t.projectArea);
      });
      const companyRoles = parseJsonArray(c.roles);
      companyRoles.forEach(r => roles.add(r));
      const techStack = parseJsonArray((c as any).techStack);
      return {
        ...c,
        taskCount: companyTasks.length,
        completedCount: companyTasks.filter((t: Task) => t.status === "completed").length,
        inProgressCount: companyTasks.filter((t: Task) => t.status === "in_progress").length,
        incidentCount: companyTasks.filter((t: Task) => t.title?.startsWith("[INCIDENT]")).length,
        roles: Array.from(roles),
        areas: Array.from(areas),
        tasks: companyTasks,
        techStackParsed: techStack,
        phasesParsed: parseJsonArray((c as any).phases),
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
      if (t.assignedRole) allRoles.add(t.assignedRole);
      allAreas.add(t.projectArea);
    });
    companies.forEach((c: Company) => {
      const ts = parseJsonArray((c as any).techStack);
      ts.forEach(t => allTools.add(t));
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
    return <ProjectDetail project={selectedProjectData} companyMap={companyMap} contactTask={contactTask} setContactTask={setContactTask} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-x-hidden">
      <div className="border-b border-border/40 bg-card/50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold tracking-tight" data-testid="text-portfolio-heading">
            Data Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Portfolio</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-base sm:text-lg max-w-2xl">
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
              className="text-left bg-card rounded-2xl border border-border/50 p-5 card-hover group cursor-pointer w-full"
              onClick={() => setSelectedProject(project.id)}
              data-testid={`project-card-${project.id}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  {project.githubLink && (
                    <a href={(project as any).githubLink} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" onClick={e => e.stopPropagation()} data-testid={`project-github-${project.id}`}>
                      <GitBranch className="w-4 h-4" />
                    </a>
                  )}
                  <Badge variant={project.status === "active" ? "default" : "secondary"} className="capitalize text-xs">{project.status}</Badge>
                </div>
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

              {project.techStackParsed.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.techStackParsed.slice(0, 5).map((t: string) => (
                      <Badge key={t} variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${getTechColor(t)}`}>{t}</Badge>
                    ))}
                    {project.techStackParsed.length > 5 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">+{project.techStackParsed.length - 5}</Badge>}
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

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
                {project.incidentCount > 0 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-red-500/10 text-red-600 border-red-500/20 gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> {project.incidentCount} incident{project.incidentCount > 1 ? "s" : ""}
                  </Badge>
                )}
                <div className="ml-auto flex items-center text-xs text-primary font-medium gap-1">
                  View Tasks <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <SectionHeading icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} title="Completed Work" subtitle="Highlighted tasks that have been delivered" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {completedTasks.map(task => (
            <CompletedTaskCard key={task.id} task={task} companyMap={companyMap} onContact={setContactTask} />
          ))}
          {completedTasks.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No completed tasks yet.</p>
          )}
        </div>

        <SectionHeading icon={<TrendingUp className="w-5 h-5 text-blue-500" />} title="Milestones & Overview" subtitle="Summary of skills, tools, and topics covered across all projects" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

function ProjectDetail({ project, companyMap, contactTask, setContactTask, onBack }: {
  project: any;
  companyMap: Record<number, string>;
  contactTask: Task | null;
  setContactTask: (t: Task | null) => void;
  onBack: () => void;
}) {
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);
  const { data: roadmap = [] } = useRoadmap(project.id);
  const phases = [...new Set(roadmap.map((r: any) => r.phase))];

  const top3Tech = project.techStackParsed.slice(0, 3).join(", ");
  const linkedInCaption = `Just shipped: ${project.name} — a ${project.industry} data platform. Built with ${top3Tech || "cutting-edge tools"}. Full case study 👇`;
  const currentUrl = typeof window !== "undefined" ? `${window.location.origin}/` : "";
  const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(`${project.name} — ${project.industry} Data Platform | DataSim`)}&summary=${encodeURIComponent(linkedInCaption)}&source=DataSim`;

  const pageTitle = `${project.name} — ${project.industry} Data Platform | DataSim Portfolio`;
  const pageDesc = (project.description || "").slice(0, 157) + (project.description?.length > 157 ? "..." : "");
  usePageMeta(pageTitle, pageDesc, currentUrl);

  const techGroups = groupTechStack(project.techStackParsed);

  const phaseProgress = useMemo(() => {
    if (!roadmap.length || !phases.length) return [];
    return phases.map((phase: string) => {
      const items = roadmap.filter((r: any) => r.phase === phase);
      const done = items.filter((r: any) => r.status === "completed").length;
      const pct = items.length ? Math.round((done / items.length) * 100) : 0;
      return { phase, total: items.length, done, pct };
    });
  }, [roadmap, phases]);

  return (
    <div className="flex-1 flex flex-col overflow-x-hidden">
      <div className="border-b border-border/40 bg-card/50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Button variant="ghost" size="sm" className="mb-3 text-muted-foreground -ml-2" onClick={onBack} data-testid="button-back-projects">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Projects
          </Button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-display font-bold" data-testid="text-project-name">{project.name}</h1>
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" data-testid="project-detail-github">
                      <GitBranch className="w-5 h-5" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-muted-foreground font-medium">{project.industry}</span>
                  <Badge variant={project.status === "active" ? "default" : "secondary"} className="capitalize text-xs">{project.status}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold">{project.taskCount} <span className="font-normal text-muted-foreground">tasks</span></span>
                <span className="text-emerald-600 font-semibold">{project.completedCount} <span className="font-normal text-muted-foreground">done</span></span>
                <span className="text-blue-600 font-semibold">{project.inProgressCount} <span className="font-normal text-muted-foreground">active</span></span>
              </div>
              <a href={linkedInUrl} target="_blank" rel="noreferrer" data-testid="button-share-linkedin">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <SiLinkedin className="w-3.5 h-3.5 text-[#0077b5]" /> Share
                </Button>
              </a>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3 max-w-3xl">{project.description}</p>

          {project.githubLink && (
            <div className="mt-4 max-w-sm">
              <GitHubRepoCard githubUrl={project.githubLink} />
            </div>
          )}

          {(Object.keys(techGroups).length > 0 || project.architecture || project.phasesParsed.length > 0) && (
            <div className="mt-5 space-y-4">
              {Object.keys(techGroups).length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> Tech Stack
                  </p>
                  <div className="space-y-2">
                    {Object.entries(techGroups).map(([cat, tools]) => (
                      <div key={cat} className="flex items-start gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full shrink-0 mt-0.5">{cat}</span>
                        <div className="flex flex-wrap gap-1">
                          {tools.map(t => (
                            <Badge key={t} variant="outline" className={`text-xs ${getTechColor(t)}`}>{t}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {project.architecture && (
                <div className="border-l-2 border-primary/30 pl-3">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Architecture
                  </p>
                  <p className="text-xs text-foreground/80">{project.architecture}</p>
                </div>
              )}

              {(project as any).architectureDiagram && (
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground gap-1 -ml-2"
                    onClick={() => setShowDiagram(!showDiagram)}
                    data-testid="button-toggle-diagram"
                  >
                    <Layers className="w-3.5 h-3.5" /> Architecture Diagram
                    {showDiagram ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </Button>
                  {showDiagram && (
                    <div className="mt-2 rounded-xl border border-border/50 bg-secondary/10 p-4 overflow-x-auto">
                      <Suspense fallback={<div className="text-xs text-muted-foreground py-2">Loading diagram...</div>}>
                        <MermaidDiagram chart={(project as any).architectureDiagram} />
                      </Suspense>
                    </div>
                  )}
                </div>
              )}

              {project.phasesParsed.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Project Phases
                  </p>
                  <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
                    {project.phasesParsed.map((phase: string, i: number) => {
                      const prog = phaseProgress.find(p => p.phase === phase);
                      const isActive = prog && prog.pct > 0 && prog.pct < 100;
                      const isDone = prog && prog.pct === 100;
                      return (
                        <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
                          isDone ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" :
                          isActive ? "bg-blue-500/10 text-blue-700 border-blue-500/20" :
                          "bg-secondary/50 text-muted-foreground border-border/30"
                        }`} data-testid={`phase-chip-${i}`}>
                          {isDone && <CheckCircle className="w-3 h-3" />}
                          {isActive && <Clock className="w-3 h-3" />}
                          {!isDone && !isActive && <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[8px] font-bold">{i + 1}</span>}
                          <span>{phase}</span>
                          {prog && <span className="text-[10px] opacity-70">{prog.pct}%</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {project.roles.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Roles
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.roles.slice(0, 8).map((role: string) => {
                      const Icon = getRoleIcon(role);
                      return (
                        <div key={role} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/40 bg-secondary/30 text-xs font-medium" data-testid={`role-chip-${role}`}>
                          <Icon className="w-3 h-3 text-primary/70" />
                          {role}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {roadmap.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1 -ml-2" onClick={() => setShowRoadmap(!showRoadmap)} data-testid="button-toggle-roadmap">
                  <Target className="w-3.5 h-3.5" /> Roadmap ({roadmap.length} milestones)
                  {showRoadmap ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </Button>
                {showRoadmap && (
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1" onClick={() => window.print()} data-testid="button-print-roadmap">
                    <Printer className="w-3.5 h-3.5" /> Export PDF
                  </Button>
                )}
              </div>
              {showRoadmap && (
                <div id="roadmap-print-target" data-company={project.name} className="mt-2">
                  <div className="hidden print:block mb-6">
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    <p className="text-muted-foreground">Project Roadmap — {project.industry}</p>
                    <p className="text-xs text-muted-foreground mt-1">Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-3">
                    {phases.map((phase: string) => {
                      const items = roadmap.filter((r: any) => r.phase === phase);
                      return (
                        <div key={phase} className="bg-secondary/20 rounded-lg p-3 border border-border/30 print:border-0 print:rounded-none print:bg-white print:page-break-inside-avoid">
                          <h4 className="text-xs font-semibold mb-2 print:text-base print:font-bold print:border-b print:border-gray-200 print:pb-1">{phase}</h4>
                          <div className="space-y-1">
                            {items.map((r: any) => (
                              <div key={r.id} className="flex items-center gap-2 text-xs print:text-sm" data-testid={`roadmap-item-${r.id}`}>
                                {r.status === "completed" ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 print:hidden" />
                                ) : r.status === "in_progress" ? (
                                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0 print:hidden" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-border/60 shrink-0 print:hidden" />
                                )}
                                <span className="hidden print:inline print:mr-2">
                                  {r.status === "completed" ? "✓" : r.status === "in_progress" ? "→" : "○"}
                                </span>
                                <span className={r.status === "completed" ? "text-muted-foreground line-through print:no-underline print:text-gray-600" : "text-foreground/80"}>{r.milestone}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {project.tasks.length > 0 ? (
          <TimelineView tasks={project.tasks} companyMap={companyMap} onContact={setContactTask} />
        ) : (
          <p className="text-center text-muted-foreground py-16">No tasks yet for this project.</p>
        )}
      </div>
      <ContactModal task={contactTask} onClose={() => setContactTask(null)} />
    </div>
  );
}

function CompletedTaskCard({ task, companyMap, onContact }: { task: Task; companyMap: Record<number, string>; onContact: (t: Task) => void }) {
  const subtasks = parseJsonArray(task.subtasks);
  const deliverables = parseJsonArray(task.deliverables);
  const isIncident = task.title?.startsWith("[INCIDENT]");
  const displayTitle = isIncident ? task.title.replace("[INCIDENT] ", "") : task.title;

  return (
    <div className={`bg-card rounded-xl border p-5 ${isIncident ? "border-l-4 border-l-red-500 border-red-500/30" : "border-border/50 border-l-4 border-l-emerald-500"}`} data-testid={`completed-task-${task.id}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2 min-w-0">
          {isIncident && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
          <h4 className="font-display font-bold text-sm">{displayTitle}</h4>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {task.difficulty && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 capitalize">{task.difficulty}</Badge>
          )}
          {isIncident ? (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-red-500/10 text-red-600 border-red-500/20">Incident</Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Completed</Badge>
          )}
        </div>
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
      {deliverables.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Deliverables</p>
          <div className="flex flex-wrap gap-1">
            {deliverables.slice(0, 3).map((d, i) => (
              <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 h-5">{d}</Badge>
            ))}
            {deliverables.length > 3 && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">+{deliverables.length - 3}</Badge>}
          </div>
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
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground hover:text-primary gap-1" onClick={() => onContact(task)} data-testid={`button-contact-completed-${task.id}`}>
          <Mail className="w-3 h-3" /> Contact
        </Button>
      </div>
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

