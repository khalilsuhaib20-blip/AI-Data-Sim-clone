import { useState } from "react";
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from "@/hooks/use-companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Building2, Loader2, GitBranch } from "lucide-react";

interface CompanyForm {
  name: string;
  industry: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  githubLink: string;
}

const emptyForm: CompanyForm = { name: "", industry: "", description: "", status: "active", startDate: "", endDate: "", githubLink: "" };

export default function ManageCompanies() {
  const { data: companies = [], isLoading } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CompanyForm>(emptyForm);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setIsOpen(true); };
  const openEdit = (c: any) => {
    setForm({ name: c.name, industry: c.industry, description: c.description, status: c.status, startDate: c.startDate || "", endDate: c.endDate || "", githubLink: c.githubLink || "" });
    setEditId(c.id); setIsOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.industry || !form.description) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    try {
      const data = { ...form, startDate: form.startDate || null, endDate: form.endDate || null, githubLink: form.githubLink || null };
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
            <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold truncate">{c.name}</p>
                    {c.githubLink && (
                      <a href={c.githubLink} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary" data-testid={`link-github-${c.id}`}>
                        <GitBranch className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{c.industry}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={c.status === "active" ? "default" : "secondary"} className="capitalize">{c.status}</Badge>
                <Button variant="outline" size="icon" onClick={() => openEdit(c)} data-testid={`button-edit-${c.id}`}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(c.id)} data-testid={`button-delete-${c.id}`}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
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
