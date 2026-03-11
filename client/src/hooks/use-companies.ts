import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "@/lib/auth";

export function useCompanies() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["/api/companies", !!token],
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(api.companies.list.path, { headers });
      if (!res.ok) throw new Error("Failed to fetch companies");
      return res.json();
    },
  });
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: ["/api/companies", id],
    queryFn: async () => {
      const url = buildUrl(api.companies.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch company");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.companies.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create company");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; [key: string]: any }) => {
      const url = buildUrl(api.companies.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update company");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.companies.delete.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete company");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
  });
}

export function useSuggestCompany() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/companies/${id}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to get AI suggestions");
      return res.json() as Promise<{
        techStack: string;
        architecture: string;
        phases: string[];
        roles: string[];
      }>;
    },
  });
}

export function useSimulateIncident() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (companyId: number) => {
      const res = await fetch(`/api/companies/${companyId}/incident`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to simulate incident");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
  });
}

export function useRoadmap(companyId: number | null) {
  return useQuery({
    queryKey: ["/api/companies", companyId, "roadmap"],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/roadmap`);
      if (!res.ok) throw new Error("Failed to fetch roadmap");
      return res.json();
    },
    enabled: !!companyId,
  });
}

export function useGenerateRoadmap() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (companyId: number) => {
      const res = await fetch(`/api/companies/${companyId}/roadmap/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to generate roadmap");
      return res.json();
    },
    onSuccess: (_data, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "roadmap"] });
    },
  });
}

export function useEvolveRoadmap() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (companyId: number) => {
      const res = await fetch(`/api/companies/${companyId}/roadmap/evolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to evolve roadmap");
      return res.json();
    },
    onSuccess: (_data, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "roadmap"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}
