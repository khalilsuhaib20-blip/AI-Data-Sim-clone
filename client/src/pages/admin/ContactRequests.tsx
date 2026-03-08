import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { Loader2, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ContactRequests() {
  const { token } = useAuth();
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async () => {
      const res = await fetch("/api/contacts", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold" data-testid="text-contacts-heading">Contact Requests</h1>
        <p className="text-muted-foreground mt-1">Messages from visitors interested in your work.</p>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-16">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No contact requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((c: any) => (
            <Card key={c.id} className="border-border/50" data-testid={`contact-card-${c.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <p className="font-display font-bold">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {c.createdAt && format(new Date(c.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-3">{c.message}</p>
                {(c.relatedCompany || c.relatedTask) && (
                  <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                    {c.relatedCompany && <span>Company: {c.relatedCompany}</span>}
                    {c.relatedTask && <span>Task: {c.relatedTask}</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
