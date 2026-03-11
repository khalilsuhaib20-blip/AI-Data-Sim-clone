import { useState } from "react";
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  useSuggestCompany,
  useSimulateIncident,
  useRoadmap,
  useGenerateRoadmap,
  useEvolveRoadmap,
} from "@/hooks/use-companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import {
  Plus, Pencil, Trash2, Building2, Loader2, GitBranch,
  Sparkles, Map, RefreshCw, ChevronDown, ChevronRight, CheckCircle2, Clock, Circle,
  Eye, EyeOff, AlertTriangle, X, Tag,
} from "lucide-react";

const TECH_CATEGORIES = [
  {
    label: "Microsoft / Power Platform",
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

function TechStackPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [customInput, setCustomInput] = useState("");
  const selected = value ? value.split(",").map(s => s.trim()).filter(Boolean) : [];

  const toggle = (tool: string) => {
    if (selected.some(s => s.toLowerCase() === tool.toLowerCase())) {
      onChange(selected.filter(s => s.toLowerCase() !== tool.toLowerCase()).join(", "));
    } else {
      onChange([...selected, tool].join(", "));
    }
  };

  const addCustom = () => {
    const t = customInput.trim();
    if (!t) return;
    if (!selected.some(s => s.toLowerCase() === t.toLowerCase())) {
      onChange([...selected, t].join(", "));
    }
    setCustomInput("");
  };

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg border border-border/40 bg-secondary/20 min-h-[40px]">
          {selected.map(t => (
            <Badge key={t} variant="secondary" className="gap-1 pr-1 pl-2 text-xs" data-testid={`selected-tech-${t}`}>
              {t}
              <button onClick={() => toggle(t)} className="ml-0.5 hover:text-destructive rounded-sm">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {TECH_CATEGORIES.map(cat => (
          <div key={cat.label}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3" /> {cat.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cat.tools.map(tool => {
                const isSelected = selected.some(s => s.toLowerCase() === tool.toLowerCase());
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => toggle(tool)}
                    className={`px-2 py-0.5 rounded-md text-xs border transition-all ${
                      isSelected ? cat.color + " font-medium" : "bg-secondary/50 text-muted-foreground border-border/30 hover:border-border"
                    }`}
                    data-testid={`tech-option-${tool}`}
                  >
                    {tool}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          placeholder="Add custom tool..."
          className="h-8 text-xs"
          data-testid="input-custom-tech"
        />
        <Button variant="outline" size="sm" onClick={addCustom} className="h-8 text-xs shrink-0">Add</Button>
      </div>
    </div>
  );
}

interface CompanyForm {
  name: string;
  industry: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  githubLink: string;
  techStack: string;
  architecture: string;
  architectureDiagram: string;
  phases: string;
  roles: string;
  visible: boolean;
}

const emptyForm: CompanyForm = {
  name: "", industry: "", description: "", status: "active",
  startDate: "", endDate: "", githubLink: "",
  techStack: "", architecture: "", architectureDiagram: "",
  phases: "", roles: "", visible: true,
};

function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

function CompanyRoadmap({ companyId }: { companyId: number }) {
  const { data: roadmap = [], isLoading } = useRoadmap(companyId);
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});

  if (isLoading) return <div className="py-2 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading roadmap...</div>;
  if (!roadmap.length) return <p className="text-sm text-muted-foreground py-2">No roadmap items yet.</p>;

  const grouped: Record<string, typeof roadmap> = {};
  for (const item of roadmap) {
    if (!grouped[item.phase]) grouped[item.phase] = [];
    grouped[item.phase].push(item);
  }

  const togglePhase = (phase: string) => setOpenPhases(prev => ({ ...prev, [phase]: !prev[phase] }));

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />;
    if (status === "in_progress") return <Clock className="w-3.5 h-3.5 text-yellow-500 shrink-0" />;
    return <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  };

  return (
    <div className="space-y-1">
      {Object.entries(grouped).map(([phase, items]) => (
        <Collapsible key={phase} open={openPhases[phase]} onOpenChange={() => togglePhase(phase)}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left text-sm font-semibold py-1 hover:bg-secondary/50 rounded-md px-2" data-testid={`roadmap-phase-${phase}`}>
            {openPhases[phase] ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
            {phase}
            <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-6 space-y-1 py-1">
              {items.sort((a: any, b: any) => a.orderIndex - b.orderIndex).map((item: any) => (
                <div key={item.id} className="flex items-start gap-2 text-sm py-1" data-testid={`roadmap-item-${item.id}`}>
                  {statusIcon(item.status)}
                  <div className="min-w-0">
                    <span className="font-medium">{item.milestone}</span>
                    {item.description && <p className="text-muted-foreground text-xs mt-0.5">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

export default function ManageCompanies() {
  const { data: companies = [], isLoading } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const suggestCompany = useSuggestCompany();
  const simulateIncident = useSimulateIncident();
  const generateRoadmap = useGenerateRoadmap();
  const evolveRoadmap = useEvolveRoadmap();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [expandedRoadmaps, setExpandedRoadmaps] = useState<Record<number, boolean>>({});
  const [evolveEvents, setEvolveEvents] = useState<Record<number, any[]>>({});
  const [showDiagramPreview, setShowDiagramPreview] = useState(false);
  const [incidentCompanyId, setIncidentCompanyId] = useState<number | null>(null);
  const [incidentResult, setIncidentResult] = useState<any | null>(null);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setIsOpen(true); };
  const openEdit = (c: any) => {
    setForm({
      name: c.name,
      industry: c.industry,
      description: c.description,
      status: c.status,
      startDate: c.startDate || "",
      endDate: c.endDate || "",
      githubLink: c.githubLink || "",
      techStack: c.techStack || "",
      architecture: c.architecture || "",
      architectureDiagram: c.architectureDiagram || "",
      phases: parseJsonArray(c.phases).join(", "),
      roles: parseJsonArray(c.roles).join(", "),
      visible: c.visible !== false,
    });
    setEditId(c.id);
    setIsOpen(true);
    setShowDiagramPreview(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.industry || !form.description) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    try {
      const phasesArr = form.phases.split(",").map(s => s.trim()).filter(Boolean);
      const rolesArr = form.roles.split(",").map(s => s.trim()).filter(Boolean);
      const data = {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        githubLink: form.githubLink || null,
        techStack: form.techStack || null,
        architecture: form.architecture || null,
        architectureDiagram: form.architectureDiagram || null,
        phases: phasesArr.length ? JSON.stringify(phasesArr) : null,
        roles: rolesArr.length ? JSON.stringify(rolesArr) : null,
        visible: form.visible,
      };
      if (editId) {
        await updateCompany.mutateAsync({ id: editId, ...data });
        toast({ title: "Company updated." });
      } else {
        await createCompany.mutateAsync(data);
        toast({ title: "Company created." });
      }
      setIsOpen(false);
    } catch {
      toast({ title: "Failed to save company.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this company?")) return;
    try {
      await deleteCompany.mutateAsync(id);
      toast({ title: "Company deleted." });
    } catch {
      toast({ title: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleToggleVisible = async (c: any) => {
    try {
      await updateCompany.mutateAsync({ id: c.id, visible: !c.visible });
      toast({ title: c.visible ? "Company hidden from public." : "Company now visible to public." });
    } catch {
      toast({ title: "Failed to update visibility.", variant: "destructive" });
    }
  };

  const handleSuggest = async (id: number) => {
    try {
      const suggestions = await suggestCompany.mutateAsync(id);
      const phasesStr = (suggestions.phases || []).join(", ");
      const rolesStr = (suggestions.roles || []).join(", ");
      setForm(f => ({
        ...f,
        techStack: suggestions.techStack || f.techStack,
        architecture: suggestions.architecture || f.architecture,
        phases: phasesStr || f.phases,
        roles: rolesStr || f.roles,
      }));
      setEditId(id);
      setIsOpen(true);
      toast({ title: "AI suggestions loaded. Review and save." });
    } catch {
      toast({ title: "Failed to get AI suggestions.", variant: "destructive" });
    }
  };

  const handleSimulateIncident = async (companyId: number) => {
    setIncidentCompanyId(companyId);
    setIncidentResult(null);
    try {
      const result = await simulateIncident.mutateAsync(companyId);
      setIncidentResult(result);
      toast({ title: "Incident simulated. Urgent task created." });
    } catch {
      toast({ title: "Failed to simulate incident.", variant: "destructive" });
      setIncidentCompanyId(null);
    }
  };

  const handleGenerateRoadmap = async (companyId: number) => {
    try {
      await generateRoadmap.mutateAsync(companyId);
      setExpandedRoadmaps(prev => ({ ...prev, [companyId]: true }));
      toast({ title: "Roadmap generated successfully." });
    } catch {
      toast({ title: "Failed to generate roadmap.", variant: "destructive" });
    }
  };

  const handleEvolveRoadmap = async (companyId: number) => {
    try {
      const result = await evolveRoadmap.mutateAsync(companyId);
      if (result?.events) {
        setEvolveEvents(prev => ({ ...prev, [companyId]: result.events }));
      }
      setExpandedRoadmaps(prev => ({ ...prev, [companyId]: true }));
      toast({ title: "Roadmap evolved with new events." });
    } catch {
      toast({ title: "Failed to evolve roadmap.", variant: "destructive" });
    }
  };

  const toggleRoadmap = (id: number) => setExpandedRoadmaps(prev => ({ ...prev, [id]: !prev[id] }));

  const isPending = createCompany.isPending || updateCompany.isPending;

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-manage-companies">Manage Companies</h1>
          <p className="text-muted-foreground mt-1">Create, edit, or manage visibility of simulated companies.</p>
        </div>
        <Button onClick={openCreate} data-testid="button-create-company">
          <Plus className="w-4 h-4 mr-2" /> New Company
        </Button>
      </div>

      <div className="space-y-4">
        {companies.map((c: any) => (
          <Card key={c.id} className={`border-border/50 ${c.visible === false ? "opacity-70" : ""}`} data-testid={`company-row-${c.id}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-bold truncate">{c.name}</p>
                      {c.visible === false && (
                        <Badge variant="secondary" className="text-[10px] gap-1"><EyeOff className="w-3 h-3" /> Hidden</Badge>
                      )}
                      {c.githubLink && (
                        <a href={c.githubLink} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary" data-testid={`link-github-${c.id}`}>
                          <GitBranch className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{c.industry}</p>
                    {(c.techStack || parseJsonArray(c.roles).length > 0) && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {c.techStack && c.techStack.split(",").slice(0, 4).map((t: string) => (
                          <Badge key={t.trim()} variant="secondary" className="text-xs" data-testid={`badge-tech-${c.id}`}>{t.trim()}</Badge>
                        ))}
                        {parseJsonArray(c.roles).slice(0, 3).map((r: string) => (
                          <Badge key={r} variant="outline" className="text-xs" data-testid={`badge-role-${c.id}`}>{r}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={c.status === "active" ? "default" : "secondary"} className="capitalize">{c.status}</Badge>
                  <Button
                    variant="outline"
                    size="icon"
                    title={c.visible !== false ? "Hide from public" : "Show to public"}
                    onClick={() => handleToggleVisible(c)}
                    disabled={updateCompany.isPending}
                    data-testid={`button-toggle-visible-${c.id}`}
                  >
                    {c.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSuggest(c.id)} disabled={suggestCompany.isPending} data-testid={`button-suggest-${c.id}`}>
                    {suggestCompany.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                    AI Suggest
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSimulateIncident(c.id)}
                    disabled={simulateIncident.isPending}
                    data-testid={`button-incident-${c.id}`}
                  >
                    {simulateIncident.isPending && incidentCompanyId === c.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-1" />}
                    Incident
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleGenerateRoadmap(c.id)} disabled={generateRoadmap.isPending} data-testid={`button-generate-roadmap-${c.id}`}>
                    {generateRoadmap.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Map className="w-4 h-4 mr-1" />}
                    Roadmap
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEvolveRoadmap(c.id)} disabled={evolveRoadmap.isPending} data-testid={`button-evolve-roadmap-${c.id}`}>
                    {evolveRoadmap.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                    Evolve
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => openEdit(c)} data-testid={`button-edit-${c.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(c.id)} data-testid={`button-delete-${c.id}`}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {evolveEvents[c.id] && evolveEvents[c.id].length > 0 && (
                <div className="mt-3 p-3 rounded-md bg-muted/50 border border-border/50">
                  <p className="text-sm font-semibold mb-1">Evolution Events:</p>
                  <div className="space-y-1">
                    {evolveEvents[c.id].map((evt: any, i: number) => (
                      <p key={i} className="text-sm text-muted-foreground" data-testid={`evolve-event-${c.id}-${i}`}>
                        {typeof evt === "string" ? evt : evt.description || evt.title || JSON.stringify(evt)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3">
                <Button variant="ghost" size="sm" onClick={() => toggleRoadmap(c.id)} className="text-muted-foreground" data-testid={`button-toggle-roadmap-${c.id}`}>
                  {expandedRoadmaps[c.id] ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                  Roadmap
                </Button>
                {expandedRoadmaps[c.id] && <CompanyRoadmap companyId={c.id} />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editId ? "Edit Company" : "New Company"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} data-testid="input-company-name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Industry *</label>
              <Input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} data-testid="input-industry" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Description *</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} data-testid="input-description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Status</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Visibility</label>
                <Button
                  type="button"
                  variant={form.visible ? "default" : "outline"}
                  className="w-full gap-2"
                  onClick={() => setForm(f => ({ ...f, visible: !f.visible }))}
                  data-testid="button-toggle-form-visible"
                >
                  {form.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {form.visible ? "Visible to Public" : "Hidden from Public"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Tech Stack</label>
              <TechStackPicker value={form.techStack} onChange={v => setForm(f => ({ ...f, techStack: v }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Architecture Description</label>
              <Textarea value={form.architecture} onChange={e => setForm(f => ({ ...f, architecture: e.target.value }))} rows={2} placeholder="Describe the system architecture..." data-testid="input-architecture" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Architecture Diagram (Mermaid)</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowDiagramPreview(p => !p)}
                >
                  {showDiagramPreview ? "Hide Preview" : "Preview Diagram"}
                </Button>
              </div>
              <Textarea
                value={form.architectureDiagram}
                onChange={e => setForm(f => ({ ...f, architectureDiagram: e.target.value }))}
                rows={4}
                placeholder={`flowchart LR\n    Kafka --> Flink --> Snowflake --> PowerBI`}
                className="font-mono text-xs"
                data-testid="input-architecture-diagram"
              />
              {showDiagramPreview && form.architectureDiagram && (
                <div className="rounded-lg border border-border/40 bg-secondary/20 p-3">
                  <MermaidDiagram chart={form.architectureDiagram} />
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">
                Supports Mermaid flowchart, sequenceDiagram, erDiagram, etc.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Phases</label>
              <Input value={form.phases} onChange={e => setForm(f => ({ ...f, phases: e.target.value }))} placeholder="Comma-separated: Planning, Development, Testing..." data-testid="input-phases" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Roles</label>
              <Input value={form.roles} onChange={e => setForm(f => ({ ...f, roles: e.target.value }))} placeholder="Comma-separated: Frontend Dev, Backend Dev, PM..." data-testid="input-roles" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">GitHub Link</label>
              <Input value={form.githubLink} onChange={e => setForm(f => ({ ...f, githubLink: e.target.value }))} placeholder="https://github.com/..." data-testid="input-github-link" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} data-testid="input-start-date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} data-testid="input-end-date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending} data-testid="button-save-company">
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editId ? "Save Changes" : "Create Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!incidentResult} onOpenChange={(open) => { if (!open) { setIncidentResult(null); setIncidentCompanyId(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Production Incident
            </DialogTitle>
            <DialogDescription>
              An urgent incident has been simulated and a task was automatically created.
            </DialogDescription>
          </DialogHeader>
          {incidentResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`capitalize ${
                  incidentResult.incident?.severity === "critical" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                  incidentResult.incident?.severity === "high" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                  "bg-amber-500/10 text-amber-600 border-amber-500/20"
                }`}>
                  {incidentResult.incident?.severity || "high"} severity
                </Badge>
                {incidentResult.incident?.affectedSystem && (
                  <Badge variant="secondary" className="text-xs">{incidentResult.incident.affectedSystem}</Badge>
                )}
              </div>
              <div>
                <p className="text-sm font-bold">{incidentResult.incident?.incidentTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">{incidentResult.incident?.incidentDescription}</p>
              </div>
              {incidentResult.incident?.businessImpact && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">Business Impact</p>
                  <p className="text-xs">{incidentResult.incident.businessImpact}</p>
                </div>
              )}
              {incidentResult.task && (
                <div className="bg-secondary/30 rounded-lg p-3 border border-border/30">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Urgent Task Created</p>
                  <p className="text-sm font-medium">{incidentResult.task.title}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => { setIncidentResult(null); setIncidentCompanyId(null); }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
