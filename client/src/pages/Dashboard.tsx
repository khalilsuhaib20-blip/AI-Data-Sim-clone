import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2, CheckCircle, Clock, ListTodo } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  if (isLoading || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold" data-testid="text-dashboard-heading">Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-lg">Overview of work across all companies.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={<Building2 className="w-5 h-5 text-blue-500" />} label="Total Companies" value={stats.totalCompanies} sub={`${stats.activeCompanies} active`} testId="stat-companies" />
        <StatCard icon={<ListTodo className="w-5 h-5 text-purple-500" />} label="Total Tasks" value={stats.totalTasks} sub={`${stats.backlogTasks} backlog`} testId="stat-tasks" />
        <StatCard icon={<Clock className="w-5 h-5 text-amber-500" />} label="In Progress" value={stats.inProgressTasks} testId="stat-in-progress" />
        <StatCard icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} label="Completed" value={stats.completedTasks} testId="stat-completed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BarChart title="Tasks by Company" data={stats.tasksByCompany} labelKey="companyName" testId="chart-company" />
        <BarChart title="Tasks by Role" data={stats.tasksByRole} labelKey="role" testId="chart-role" />
        <BarChart title="Tasks by Project Area" data={stats.tasksByArea} labelKey="area" testId="chart-area" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, testId }: { icon: React.ReactNode; label: string; value: number; sub?: string; testId: string }) {
  return (
    <Card className="border-border/50" data-testid={testId}>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">{icon}</div>
          <span className="text-sm text-muted-foreground font-medium">{label}</span>
        </div>
        <p className="text-3xl font-display font-bold">{value}</p>
        {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function BarChart({ title, data, labelKey, testId }: { title: string; data: any[]; labelKey: string; testId: string }) {
  const maxCount = Math.max(...data.map((d: any) => d.count), 1);
  const colors = ["bg-primary", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-rose-500"];

  return (
    <Card className="border-border/50" data-testid={testId}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
        {data.map((item: any, i: number) => (
          <div key={item[labelKey]} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium truncate">{item[labelKey]}</span>
              <span className="text-muted-foreground">{item.count}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-500`}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
