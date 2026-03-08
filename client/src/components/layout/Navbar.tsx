import { Link, useLocation } from "wouter";
import { Database, LayoutGrid, Building2, BarChart3, Mail, Lock, LogOut, Shield, Sparkles, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const [location] = useLocation();
  const { isAdmin, user, logout } = useAuth();
  const isAdminRoute = location.startsWith("/admin");

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-2 rounded-md ${
      location === path ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 text-white">
              <Database className="w-4 h-4" />
            </div>
            <Link href="/" className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70" data-testid="link-home">
              DataSim
            </Link>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {isAdminRoute && isAdmin ? (
              <>
                <Link href="/admin" className={linkClass("/admin")} data-testid="link-admin-dash">
                  <Shield className="w-4 h-4" /> Dashboard
                </Link>
                <Link href="/admin/companies" className={linkClass("/admin/companies")} data-testid="link-admin-companies">
                  <Building2 className="w-4 h-4" /> Companies
                </Link>
                <Link href="/admin/tasks" className={linkClass("/admin/tasks")} data-testid="link-admin-tasks">
                  <LayoutGrid className="w-4 h-4" /> Tasks
                </Link>
                <Link href="/admin/generate" className={linkClass("/admin/generate")} data-testid="link-admin-generate">
                  <Sparkles className="w-4 h-4" /> Generate
                </Link>
                <Link href="/admin/contacts" className={linkClass("/admin/contacts")} data-testid="link-admin-contacts">
                  <Inbox className="w-4 h-4" /> Contacts
                </Link>
                <div className="w-px h-6 bg-border mx-1" />
                <Link href="/" className={linkClass("/__public__")} data-testid="link-public-site">
                  Public Site
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground" data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={linkClass("/dashboard")} data-testid="link-dashboard">
                  <BarChart3 className="w-4 h-4" /> Dashboard
                </Link>
                <Link href="/companies" className={linkClass("/companies")} data-testid="link-companies">
                  <Building2 className="w-4 h-4" /> Companies
                </Link>
                <Link href="/tasks" className={linkClass("/tasks")} data-testid="link-tasks">
                  <LayoutGrid className="w-4 h-4" /> Tasks
                </Link>
                <Link href="/contact" className={linkClass("/contact")} data-testid="link-contact">
                  <Mail className="w-4 h-4" /> Contact
                </Link>
                <div className="w-px h-6 bg-border mx-1" />
                {isAdmin ? (
                  <>
                    <Link href="/admin" className={linkClass("/admin")} data-testid="link-admin">
                      <Shield className="w-4 h-4" /> Admin
                    </Link>
                    <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground" data-testid="button-logout">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Link href="/login" className={linkClass("/login")} data-testid="link-login">
                    <Lock className="w-4 h-4" /> Admin
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
