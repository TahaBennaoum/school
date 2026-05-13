import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { dashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/api-response.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export const dashboardController = {
  getStats: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await dashboardService.getStats();
    return sendSuccess(res, stats);
  }),

  getRecentActivity: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await dashboardService.getRecentActivity(limit);
    return sendSuccess(res, activities);
  }),

  getMonthlyRevenue: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const revenue = await dashboardService.getMonthlyRevenue(year);
    return sendSuccess(res, revenue);
  }),

  getAttendanceTrend: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;
    const trend = await dashboardService.getAttendanceTrend(days);
    return sendSuccess(res, trend);
  }),

  getGradeDistribution: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { classId, subjectId } = req.query;
    const distribution = await dashboardService.getGradeDistribution(
      classId as string,
      subjectId as string
    );
    return sendSuccess(res, distribution);
  }),
};
