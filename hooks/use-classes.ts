"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Class, PaginatedResponse } from "@/types";

interface ClassFilters {
  page?: number;
  limit?: number;
  search?: string;
  level?: string;
  schoolYearId?: string;
}

export function useClasses(filters?: ClassFilters) {
  return useQuery({
    queryKey: ["classes", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.level) params.append("level", filters.level);
      if (filters?.schoolYearId) params.append("schoolYearId", filters.schoolYearId);

      const response = await api.get<PaginatedResponse<Class>>(
        `/classes?${params.toString()}`
      );
      return response.data;
    },
  });
}

export function useClass(id: string) {
  return useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      const response = await api.get<Class>(`/classes/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useClassStudents(classId: string) {
  return useQuery({
    queryKey: ["class-students", classId],
    queryFn: async () => {
      const response = await api.get(`/classes/${classId}/students`);
      return response.data;
    },
    enabled: !!classId,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Class>) => {
      const response = await api.post<Class>("/classes", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Class> }) => {
      const response = await api.put<Class>(`/classes/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", id] });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}
