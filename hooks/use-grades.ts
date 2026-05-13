"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Grade, PaginatedResponse } from "@/types";

interface GradeFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  classId?: string;
  subjectId?: string;
  type?: string;
  trimester?: number;
}

export function useGrades(filters?: GradeFilters) {
  return useQuery({
    queryKey: ["grades", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.studentId) params.append("studentId", filters.studentId);
      if (filters?.classId) params.append("classId", filters.classId);
      if (filters?.subjectId) params.append("subjectId", filters.subjectId);
      if (filters?.type) params.append("type", filters.type);
      if (filters?.trimester) params.append("trimester", filters.trimester.toString());

      const response = await api.get<PaginatedResponse<Grade>>(
        `/grades?${params.toString()}`
      );
      return response.data;
    },
  });
}

export function useStudentGrades(studentId: string, trimester?: number) {
  return useQuery({
    queryKey: ["student-grades", studentId, trimester],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (trimester) params.append("trimester", trimester.toString());
      const response = await api.get(`/grades/student/${studentId}?${params.toString()}`);
      return response.data;
    },
    enabled: !!studentId,
  });
}

export function useClassGrades(classId: string, subjectId?: string, trimester?: number) {
  return useQuery({
    queryKey: ["class-grades", classId, subjectId, trimester],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (subjectId) params.append("subjectId", subjectId);
      if (trimester) params.append("trimester", trimester.toString());
      const response = await api.get(`/grades/class/${classId}?${params.toString()}`);
      return response.data;
    },
    enabled: !!classId,
  });
}

export function useCreateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Grade>) => {
      const response = await api.post<Grade>("/grades", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      queryClient.invalidateQueries({ queryKey: ["student-grades"] });
      queryClient.invalidateQueries({ queryKey: ["class-grades"] });
    },
  });
}

export function useBulkCreateGrades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { grades: Partial<Grade>[] }) => {
      const response = await api.post("/grades/bulk", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      queryClient.invalidateQueries({ queryKey: ["student-grades"] });
      queryClient.invalidateQueries({ queryKey: ["class-grades"] });
    },
  });
}

export function useUpdateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Grade> }) => {
      const response = await api.put<Grade>(`/grades/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      queryClient.invalidateQueries({ queryKey: ["student-grades"] });
      queryClient.invalidateQueries({ queryKey: ["class-grades"] });
    },
  });
}

export function useDeleteGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/grades/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      queryClient.invalidateQueries({ queryKey: ["student-grades"] });
      queryClient.invalidateQueries({ queryKey: ["class-grades"] });
    },
  });
}
