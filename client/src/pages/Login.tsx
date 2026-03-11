import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2, ShieldOff, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: config, isLoading: configLoading } = useQuery<{ adminEnabled: boolean }>({
    queryKey: ["/api/config"],
    staleTime: Infinity,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(username, password);
      setLocation("/admin");
    } catch (err: any) {
      toast({ title: err.message || "Login failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50">

        {configLoading ? (
          <>
            <CardHeader className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl font-display">Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-24" />
            </CardContent>
          </>
        ) : config?.adminEnabled === false ? (
          <>
            <CardHeader className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <ShieldOff className="w-7 h-7 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl font-display">Admin Access Disabled</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                The admin panel is not available in this environment. To manage your portfolio, run the app locally.
              </p>
              <Link href="/">
                <Button variant="outline" className="gap-2" data-testid="button-back-to-portfolio">
                  <ArrowLeft className="w-4 h-4" /> Back to Portfolio
                </Button>
              </Link>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-2xl font-display">Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Username</label>
                  <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" data-testid="input-username" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Password</label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" data-testid="input-password" />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-11 font-bold" data-testid="button-login">
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </>
        )}

      </Card>
    </div>
  );
}
