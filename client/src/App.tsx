import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Companies from "@/pages/Companies";
import CompanyDetails from "@/pages/CompanyDetails";
import Tasks from "@/pages/Tasks";
import TaskDetails from "@/pages/TaskDetails";
import Dashboard from "@/pages/Dashboard";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageCompanies from "@/pages/admin/ManageCompanies";
import ManageTasks from "@/pages/admin/ManageTasks";
import GenerateTask from "@/pages/admin/GenerateTask";
import ContactRequests from "@/pages/admin/ContactRequests";

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAdmin) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/companies" component={Companies} />
      <Route path="/companies/:id" component={CompanyDetails} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/tasks/:id" component={TaskDetails} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
      <Route path="/admin/companies">{() => <AdminRoute component={ManageCompanies} />}</Route>
      <Route path="/admin/tasks">{() => <AdminRoute component={ManageTasks} />}</Route>
      <Route path="/admin/generate">{() => <AdminRoute component={GenerateTask} />}</Route>
      <Route path="/admin/contacts">{() => <AdminRoute component={ContactRequests} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
            <Navbar />
            <main className="flex-1 flex flex-col">
              <Router />
            </main>
          </div>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
