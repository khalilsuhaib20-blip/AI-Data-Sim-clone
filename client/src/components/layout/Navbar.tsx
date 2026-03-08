import { Link } from "wouter";
import { Database, LayoutGrid } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 text-white">
              <Database className="w-4 h-4" />
            </div>
            <Link 
              href="/" 
              className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
            >
              DataSim
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/board" 
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-secondary/80"
            >
              <LayoutGrid className="w-4 h-4" />
              Task Board
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
