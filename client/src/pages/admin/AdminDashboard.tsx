import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Building2, CheckCircle, Clock, ListTodo, Inbox } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

export default function AdminDashboard() {
  const { token } = useAuth();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const res = await fetch("/api/contacts", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (statsLoading || contactsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-display font-bold mb-2" data-testid="text-admin-heading">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-10">Manage your portfolio companies, tasks, and contact requests.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard icon={<Building2 className="w-5 h-5 text-blue-500" />} label="Companies" value={stats?.totalCompanies || 0} />
        <StatCard icon={<Building2 className="w-5 h-5 text-emerald-500" />} label="Active" value={stats?.activeCompanies || 0} />
        <StatCard icon={<ListTodo className="w-5 h-5 text-purple-500" />} label="Total Tasks" value={stats?.totalTasks || 0} />
        <StatCard icon={<Clock className="w-5 h-5 text-amber-500" />} label="In Progress" value={stats?.inProgressTasks || 0} />
        <StatCard icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} label="Completed" value={stats?.completedTasks || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" />
              Recent Contact Requests ({contacts.length})
            </h3>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contact requests yet.</p>
            ) : (
              <div className="space-y-3">
                {contacts.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="bg-secondary/30 rounded-xl p-4 border border-border/50" data-testid={`contact-${c.id}`}>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <span className="text-xs text-muted-foreground">{c.email}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{c.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <h3 className="font-display font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/admin/companies">
                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 card-hover cursor-pointer" data-testid="link-manage-companies">
                  <p className="font-semibold text-sm">Manage Companies</p>
                  <p className="text-xs text-muted-foreground">Create, edit, or close companies</p>
                </div>
              </Link>
              <Link href="/admin/tasks">
                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 card-hover cursor-pointer" data-testid="link-manage-tasks">
                  <p className="font-semibold text-sm">Manage Tasks</p>
                  <p className="text-xs text-muted-foreground">Edit tasks, update status, add notes</p>
                </div>
              </Link>
              <Link href="/admin/generate">
                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 card-hover cursor-pointer" data-testid="link-generate-task">
                  <p className="font-semibold text-sm">Generate AI Task</p>
                  <p className="text-xs text-muted-foreground">Use AI to create a realistic new task</p>
                </div>
              </Link>
              <Link href="/admin/settings">
                <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 card-hover cursor-pointer" data-testid="link-settings">
                  <p className="font-semibold text-sm">Settings</p>
                  <p className="text-xs text-muted-foreground">Configure AI provider, API keys, and preferences</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">{icon}</div>
          <span className="text-xs text-muted-foreground font-medium">{label}</span>
        </div>
        <p className="text-2xl font-display font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
