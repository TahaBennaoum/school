import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { attendanceService } from '../services/attendance.service.js';
import { getPagination, getFilters } from '../utils/pagination.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, sendError } from '../utils/api-response.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export const attendanceController = {
  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = getPagination(req);
    const filters = getFilters(req);
    
    const { attendances, total } = await attendanceService.findAll(pagination, filters);
    
    return sendPaginated(res, attendances, pagination.page, pagination.limit, total);
  }),

  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const attendance = await attendanceService.findById(id);
    
    if (!attendance) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, attendance);
  }),

  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const attendance = await attendanceService.create(req.body);
    return sendCreated(res, attendance, 'Présence enregistrée avec succès');
  }),

  createBatch: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { attendances } = req.body;
    const created = await attendanceService.createBatch(attendances);
    return sendCreated(res, created, 'Présences enregistrées avec succès');
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const attendance = await attendanceService.update(id, req.body);
    return sendSuccess(res, attendance, 'Présence mise à jour avec succès');
  }),

  delete: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await attendanceService.delete(id);
    return sendNoContent(res);
  }),

  getClassAttendance: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { classId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return sendError(res, 'La date est requise', 400);
    }
    
    const attendance = await attendanceService.getClassAttendance(
      classId,
      new Date(date as string)
    );
    
    return sendSuccess(res, attendance);
  }),

  getStudentStats: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;
    
    const stats = await attendanceService.getStudentStats(
      studentId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    return sendSuccess(res, stats);
  }),

  getClassStats: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;
    
    const stats = await attendanceService.getClassStats(
      classId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    
    return sendSuccess(res, stats);
  }),

  getGlobalStats: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await attendanceService.getGlobalStats();
    return sendSuccess(res, stats);
  }),
};
