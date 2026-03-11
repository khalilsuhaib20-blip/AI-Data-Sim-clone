import { Link } from "wouter";
import { Database, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function Navbar() {
  const { isAdmin, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-border/40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0" data-testid="link-home">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 text-white">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-lg font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              DataSim
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <Link href="/admin" data-testid="link-admin">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Shield className="w-3.5 h-3.5" /> Admin Console
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground h-8 w-8" data-testid="button-logout">
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
