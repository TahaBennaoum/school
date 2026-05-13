import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { teacherService } from '../services/teacher.service.js';
import { getPagination, getFilters } from '../utils/pagination.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, sendError } from '../utils/api-response.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export const teacherController = {
  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = getPagination(req);
    const filters = getFilters(req);
    
    const { teachers, total } = await teacherService.findAll(pagination, filters);
    
    return sendPaginated(res, teachers, pagination.page, pagination.limit, total);
  }),

  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const teacher = await teacherService.findById(id);
    
    if (!teacher) {
      return sendError(res, 'Enseignant non trouvé', 404);
    }
    
    return sendSuccess(res, teacher);
  }),

  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const teacher = await teacherService.create(req.body);
    return sendCreated(res, teacher, 'Enseignant créé avec succès');
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const teacher = await teacherService.update(id, req.body);
    return sendSuccess(res, teacher, 'Enseignant mis à jour avec succès');
  }),

  delete: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await teacherService.delete(id);
    return sendNoContent(res);
  }),

  getStats: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await teacherService.getStats();
    return sendSuccess(res, stats);
  }),
};
