import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Settings2, Save, Loader2, RotateCcw, Key, Globe, Cpu, Info } from "lucide-react";

export default function SettingsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");

  useEffect(() => {
    if (settings) {
      setApiKey(settings.openai_api_key || "");
      setBaseUrl(settings.openai_base_url || "");
      setModel(settings.openai_model || "");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, string> = {};
      if (apiKey) body.openai_api_key = apiKey;
      if (baseUrl) body.openai_base_url = baseUrl;
      if (model) body.openai_model = model;
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved successfully." });
    },
    onError: () => {
      toast({ title: "Failed to save settings.", variant: "destructive" });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async (key: string) => {
      const res = await fetch(`/api/settings/${key}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to clear");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Setting cleared. Using default." });
    },
  });

  const handleClearAll = async () => {
    await clearMutation.mutateAsync("openai_api_key");
    await clearMutation.mutateAsync("openai_base_url");
    await clearMutation.mutateAsync("openai_model");
    setApiKey("");
    setBaseUrl("");
    setModel("");
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold" data-testid="text-settings-heading">Settings</h1>
            <p className="text-muted-foreground">Configure your AI provider and other preferences.</p>
          </div>
        </div>
      </div>

      <Card className="border-border/50 mb-6">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            AI Provider Configuration
          </CardTitle>
          <CardDescription>
            Configure which AI provider to use for task generation. Leave fields empty to use the built-in default provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">How it works</p>
              <p>By default, the app uses the built-in AI integration. If you want to use your own OpenAI key (or any OpenAI-compatible API like Anthropic, Groq, etc.), fill in the fields below. Your API key is stored securely and masked when displayed.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-muted-foreground" />
              API Key
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-... (leave empty for default)"
              data-testid="input-api-key"
            />
            <p className="text-xs text-muted-foreground">Your OpenAI or compatible API key.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Base URL
            </label>
            <Input
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1 (leave empty for default)"
              data-testid="input-base-url"
            />
            <p className="text-xs text-muted-foreground">Custom endpoint URL. Useful for proxies or alternative providers (Groq, Together, etc.).</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              Model
            </label>
            <Input
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="gpt-4o (leave empty for default)"
              data-testid="input-model"
            />
            <p className="text-xs text-muted-foreground">Which model to use for task generation (e.g., gpt-4o, gpt-3.5-turbo, llama-3, etc.).</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="flex-1" data-testid="button-save-settings">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </Button>
            <Button variant="outline" onClick={handleClearAll} disabled={clearMutation.isPending} data-testid="button-reset-settings">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-base">Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <StatusRow label="API Key" value={settings.openai_api_key ? "Custom key configured" : "Using built-in default"} isCustom={!!settings.openai_api_key} />
            <StatusRow label="Base URL" value={settings.openai_base_url || "Using built-in default"} isCustom={!!settings.openai_base_url} />
            <StatusRow label="Model" value={settings.openai_model || "gpt-4o (default)"} isCustom={!!settings.openai_model} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusRow({ label, value, isCustom }: { label: string; value: string; isCustom: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{value}</span>
        <div className={`w-2 h-2 rounded-full ${isCustom ? "bg-blue-500" : "bg-emerald-500"}`} />
      </div>
    </div>
  );
}
