"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Attendance, PaginatedResponse } from "@/types";

interface AttendanceFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  classId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export function useAttendance(filters?: AttendanceFilters) {
  return useQuery({
    queryKey: ["attendance", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.studentId) params.append("studentId", filters.studentId);
      if (filters?.classId) params.append("classId", filters.classId);
      if (filters?.date) params.append("date", filters.date);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.status) params.append("status", filters.status);

      const response = await api.get<PaginatedResponse<Attendance>>(
        `/attendance?${params.toString()}`
      );
      return response.data;
    },
  });
}

export function useClassAttendance(classId: string, date: string) {
  return useQuery({
    queryKey: ["class-attendance", classId, date],
    queryFn: async () => {
      const response = await api.get(`/attendance/class/${classId}?date=${date}`);
      return response.data;
    },
    enabled: !!classId && !!date,
  });
}

export function useStudentAttendance(studentId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["student-attendance", studentId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const response = await api.get(`/attendance/student/${studentId}?${params.toString()}`);
      return response.data;
    },
    enabled: !!studentId,
  });
}

export function useAttendanceStats(classId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["attendance-stats", classId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (classId) params.append("classId", classId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const response = await api.get(`/attendance/stats?${params.toString()}`);
      return response.data;
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Attendance>) => {
      const response = await api.post<Attendance>("/attendance", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["class-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["student-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
    },
  });
}

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { records: Partial<Attendance>[] }) => {
      const response = await api.post("/attendance/bulk", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["class-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["student-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Attendance> }) => {
      const response = await api.put<Attendance>(`/attendance/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["class-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["student-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
    },
  });
}
