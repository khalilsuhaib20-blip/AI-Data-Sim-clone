import { useQuery } from "@tanstack/react-query";
import { Star, GitBranch, Clock, ExternalLink, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { SiGithub } from "react-icons/si";

interface GitHubRepo {
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  lastCommit: string;
  url: string;
}

export function GitHubRepoCard({ githubUrl }: { githubUrl: string }) {
  const { data, isLoading, isError } = useQuery<GitHubRepo>({
    queryKey: ["/api/github-repo", githubUrl],
    queryFn: async () => {
      const res = await fetch(`/api/github-repo?url=${encodeURIComponent(githubUrl)}`);
      if (!res.ok) throw new Error("Failed to fetch repo");
      return res.json();
    },
    staleTime: 3600000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 bg-secondary/30 p-3 animate-pulse">
        <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
        <div className="h-3 bg-secondary rounded w-2/3" />
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-sm transition-all p-3 group"
      data-testid={`github-card-${data.name}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <SiGithub className="w-4 h-4 shrink-0 text-muted-foreground" />
          <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{data.name}</span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
      </div>
      {data.description && (
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{data.description}</p>
      )}
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {data.language && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
            {data.language}
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3 h-3" />
          {data.stars}
        </div>
        {data.lastCommit && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(data.lastCommit), { addSuffix: true })}
          </div>
        )}
      </div>
      {data.topics.length > 0 && (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {data.topics.slice(0, 4).map(t => (
            <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{t}</Badge>
          ))}
        </div>
      )}
    </a>
  );
}
