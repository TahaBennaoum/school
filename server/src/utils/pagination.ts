import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const getPagination = (req: Request, defaultLimit: number = 10): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || defaultLimit));
  const skip = (page - 1) * limit;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, sortBy, sortOrder };
};

export interface FilterParams {
  search?: string;
  status?: string;
  classId?: string;
  level?: string;
  startDate?: Date;
  endDate?: Date;
  [key: string]: string | Date | undefined;
}

export const getFilters = (req: Request): FilterParams => {
  const { search, status, classId, level, startDate, endDate, ...rest } = req.query;

  return {
    ...(search && { search: String(search) }),
    ...(status && { status: String(status) }),
    ...(classId && { classId: String(classId) }),
    ...(level && { level: String(level) }),
    ...(startDate && { startDate: new Date(String(startDate)) }),
    ...(endDate && { endDate: new Date(String(endDate)) }),
    ...Object.fromEntries(
      Object.entries(rest)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ),
  };
};
