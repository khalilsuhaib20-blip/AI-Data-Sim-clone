import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import PortfolioDashboard from "@/pages/PortfolioDashboard";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageCompanies from "@/pages/admin/ManageCompanies";
import ManageTasks from "@/pages/admin/ManageTasks";
import GenerateTask from "@/pages/admin/GenerateTask";
import ContactRequests from "@/pages/admin/ContactRequests";
import SettingsPage from "@/pages/admin/Settings";
import PromptsPage from "@/pages/admin/Prompts";
import TaskDetails from "@/pages/TaskDetails";

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAdmin) return <Redirect to="/login" />;
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function AdminRoutes() {
  return (
    <Switch>
      <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
      <Route path="/admin/companies">{() => <AdminRoute component={ManageCompanies} />}</Route>
      <Route path="/admin/tasks">{() => <AdminRoute component={ManageTasks} />}</Route>
      <Route path="/admin/generate">{() => <AdminRoute component={GenerateTask} />}</Route>
      <Route path="/admin/contacts">{() => <AdminRoute component={ContactRequests} />}</Route>
      <Route path="/admin/settings">{() => <AdminRoute component={SettingsPage} />}</Route>
      <Route path="/admin/prompts">{() => <AdminRoute component={PromptsPage} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function PublicRoutes() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Switch>
          <Route path="/" component={PortfolioDashboard} />
          <Route path="/tasks/:id" component={TaskDetails} />
          <Route path="/login" component={Login} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function AppShell() {
  const [location] = useLocation();
  const isAdminArea = location.startsWith("/admin");

  if (isAdminArea) {
    return <AdminRoutes />;
  }

  return <PublicRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
