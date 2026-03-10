import { useState } from "react";
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
  useSuggestCompany,
  useRoadmap,
  useGenerateRoadmap,
  useEvolveRoadmap,
} from "@/hooks/use-companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, Building2, Loader2, GitBranch,
  Sparkles, Map, RefreshCw, ChevronDown, ChevronRight, CheckCircle2, Clock, Circle,
} from "lucide-react";

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
  phases: string;
  roles: string;
}

const emptyForm: CompanyForm = {
  name: "", industry: "", description: "", status: "active",
  startDate: "", endDate: "", githubLink: "",
  techStack: "", architecture: "", phases: "", roles: "",
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
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left text-sm font-semibold py-1 hover-elevate rounded-md px-2" data-testid={`roadmap-phase-${phase}`}>
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
  const generateRoadmap = useGenerateRoadmap();
  const evolveRoadmap = useEvolveRoadmap();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [expandedRoadmaps, setExpandedRoadmaps] = useState<Record<number, boolean>>({});
  const [evolveEvents, setEvolveEvents] = useState<Record<number, any[]>>({});

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
      phases: parseJsonArray(c.phases).join(", "),
      roles: parseJsonArray(c.roles).join(", "),
    });
    setEditId(c.id);
    setIsOpen(true);
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
        phases: phasesArr.length ? JSON.stringify(phasesArr) : null,
        roles: rolesArr.length ? JSON.stringify(rolesArr) : null,
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold" data-testid="text-manage-companies">Manage Companies</h1>
          <p className="text-muted-foreground mt-1">Create, edit, or close simulated companies.</p>
        </div>
        <Button onClick={openCreate} data-testid="button-create-company">
          <Plus className="w-4 h-4 mr-2" /> New Company
        </Button>
      </div>

      <div className="space-y-4">
        {companies.map((c: any) => (
          <Card key={c.id} className="border-border/50" data-testid={`company-row-${c.id}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-bold truncate">{c.name}</p>
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
                  <Button variant="outline" size="sm" onClick={() => handleSuggest(c.id)} disabled={suggestCompany.isPending} data-testid={`button-suggest-${c.id}`}>
                    {suggestCompany.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                    AI Suggest
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleGenerateRoadmap(c.id)} disabled={generateRoadmap.isPending} data-testid={`button-generate-roadmap-${c.id}`}>
                    {generateRoadmap.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Map className="w-4 h-4 mr-1" />}
                    Generate Roadmap
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
              <label className="text-sm font-semibold">Tech Stack</label>
              <Textarea value={form.techStack} onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))} rows={2} placeholder="e.g. React, Node.js, PostgreSQL..." data-testid="input-tech-stack" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Architecture</label>
              <Textarea value={form.architecture} onChange={e => setForm(f => ({ ...f, architecture: e.target.value }))} rows={2} placeholder="Describe the system architecture..." data-testid="input-architecture" />
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
    </div>
  );
}
