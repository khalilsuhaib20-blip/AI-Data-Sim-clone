import { Link } from "wouter";
import { useCompanies } from "@/hooks/use-companies";
import { Badge } from "@/components/ui/badge";
import { Building2, Loader2, ArrowRight } from "lucide-react";

export default function Companies() {
  const { data: companies = [], isLoading } = useCompanies();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold text-foreground" data-testid="text-companies-heading">Companies</h1>
        <p className="text-muted-foreground mt-2 text-lg">Browse the simulated companies and explore completed work.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company: any) => (
          <Link key={company.id} href={`/companies/${company.id}`}>
            <div className="p-6 rounded-2xl bg-card border border-border/50 card-hover cursor-pointer group" data-testid={`card-company-${company.id}`}>
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <Badge variant={company.status === "active" ? "default" : "secondary"} className="capitalize text-xs" data-testid={`badge-status-${company.id}`}>
                  {company.status}
                </Badge>
              </div>
              <h3 className="text-lg font-display font-bold mb-2 group-hover:text-primary transition-colors" data-testid={`text-company-name-${company.id}`}>
                {company.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 font-medium">{company.industry}</p>
              <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-4">{company.description}</p>
              <div className="flex items-center text-sm text-primary font-medium gap-1">
                View Details <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
