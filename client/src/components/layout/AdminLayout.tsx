import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Building2, ListChecks, Sparkles, Inbox, Settings2,
  Database, LogOut, Globe, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Companies", href: "/admin/companies", icon: Building2 },
  { title: "Tasks", href: "/admin/tasks", icon: ListChecks },
  { title: "Generate Task", href: "/admin/generate", icon: Sparkles },
  { title: "Contacts", href: "/admin/contacts", icon: Inbox },
  { title: "AI Prompts", href: "/admin/prompts", icon: Bot },
  { title: "Settings", href: "/admin/settings", icon: Settings2 },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 text-white shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-sm">DataSim</span>
                <span className="text-[10px] text-muted-foreground">Admin Console</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive} data-testid={`sidebar-link-${item.title.toLowerCase().replace(/\s/g, "-")}`}>
                          <Link href={item.href} className="flex items-center gap-2">
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-4 space-y-3">
            <Link href="/" data-testid="sidebar-link-public-view">
              <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                <Globe className="w-3.5 h-3.5" /> View Public Portfolio
              </Button>
            </Link>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{user?.username?.[0]?.toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{user?.username}</p>
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Admin</Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="h-7 w-7 shrink-0 text-muted-foreground" data-testid="button-logout">
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col min-h-0 flex-1">
          <header className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-card/50 shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="h-4 w-px bg-border" />
            <nav className="text-sm text-muted-foreground">
              {navItems.find(n => location === n.href || (n.href !== "/admin" && location.startsWith(n.href)))?.title || "Admin"}
            </nav>
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
