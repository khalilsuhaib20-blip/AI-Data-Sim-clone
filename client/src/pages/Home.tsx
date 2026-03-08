import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, DatabaseZap, SquareKanban } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 mix-blend-multiply" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] -z-10 mix-blend-multiply" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 to-transparent dark:from-black/40 blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border/50 text-sm font-medium text-muted-foreground backdrop-blur-md mb-4 shadow-sm">
          <SparkleIcon className="w-4 h-4 text-primary" />
          <span>AI-Powered Workflow Simulator</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-extrabold text-foreground leading-[1.1] tracking-tight">
          Experience Data Engineering at <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Scale</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
          A dynamic Kanban simulator that generates realistic data infrastructure, machine learning, and analytics tasks. Perfect for building your portfolio and practicing real-world scenarios.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/board">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 group font-bold">
              Enter Simulator
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl border-2 border-border/50 hover:bg-secondary transition-all font-bold">
              View Documentation
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20 text-left">
          <FeatureCard 
            icon={<DatabaseZap className="w-6 h-6 text-blue-500" />}
            title="Realistic Scenarios"
            description="Tasks generated mimic real requests from Stakeholders, Data Scientists, and Product Managers."
          />
          <FeatureCard 
            icon={<SquareKanban className="w-6 h-6 text-emerald-500" />}
            title="Kanban Workflow"
            description="Drag and drop interface to organize tasks, track progress, and manage your simulated sprint."
          />
          <FeatureCard 
            icon={<BrainCircuit className="w-6 h-6 text-purple-500" />}
            title="AI Generated"
            description="Endless variety of unique engineering challenges tailored to modern data stack architecture."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-lg shadow-black/[0.02] hover:shadow-xl hover:border-primary/20 transition-all duration-300 glass-panel">
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm font-medium">{description}</p>
    </div>
  );
}

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
