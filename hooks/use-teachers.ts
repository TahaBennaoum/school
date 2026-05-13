"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Teacher, PaginatedResponse } from "@/types";

interface TeacherFilters {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  status?: string;
}

export function useTeachers(filters?: TeacherFilters) {
  return useQuery({
    queryKey: ["teachers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.subjectId) params.append("subjectId", filters.subjectId);
      if (filters?.status) params.append("status", filters.status);

      const response = await api.get<PaginatedResponse<Teacher>>(
        `/teachers?${params.toString()}`
      );
      return response.data;
    },
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: ["teacher", id],
    queryFn: async () => {
      const response = await api.get<Teacher>(`/teachers/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Teacher>) => {
      const response = await api.post<Teacher>("/teachers", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Teacher> }) => {
      const response = await api.put<Teacher>(`/teachers/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher", id] });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}
