import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "@/lib/auth";

export function useTasks(companyId?: number) {
  return useQuery({
    queryKey: ["/api/tasks", companyId],
    queryFn: async () => {
      const url = companyId ? `${api.tasks.list.path}?companyId=${companyId}` : api.tasks.list.path;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });
}

export function useTask(id: number) {
  return useQuery({
    queryKey: ["/api/tasks", id],
    queryFn: async () => {
      const url = buildUrl(api.tasks.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch task");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; [key: string]: any }) => {
      const url = buildUrl(api.tasks.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: ["/api/tasks"] });
      const previousTasks = queryClient.getQueryData(["/api/tasks", undefined]);
      queryClient.setQueryData(["/api/tasks", undefined], (old: any) => {
        if (!old) return old;
        return old.map((task: any) => task.id === updatedTask.id ? { ...task, ...updatedTask } : task);
      });
      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      if (context?.previousTasks) queryClient.setQueryData(["/api/tasks", undefined], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}

export function useGenerateTask() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (companyId?: number) => {
      const res = await fetch(api.tasks.generate.path, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ companyId }),
      });
      if (!res.ok) throw new Error("Failed to generate task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tasks.delete.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });
}
