import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { studentService } from '../services/student.service.js';
import { getPagination, getFilters } from '../utils/pagination.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, sendError } from '../utils/api-response.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export const studentController = {
  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = getPagination(req);
    const filters = getFilters(req);
    
    const { students, total } = await studentService.findAll(pagination, filters);
    
    return sendPaginated(res, students, pagination.page, pagination.limit, total);
  }),

  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const student = await studentService.findById(id);
    
    if (!student) {
      return sendError(res, 'Étudiant non trouvé', 404);
    }
    
    return sendSuccess(res, student);
  }),

  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const student = await studentService.create(req.body);
    return sendCreated(res, student, 'Étudiant créé avec succès');
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const student = await studentService.update(id, req.body);
    return sendSuccess(res, student, 'Étudiant mis à jour avec succès');
  }),

  delete: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await studentService.delete(id);
    return sendNoContent(res);
  }),

  getStats: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await studentService.getStats();
    return sendSuccess(res, stats);
  }),
};
