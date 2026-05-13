import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { classService } from '../services/class.service.js';
import { getPagination, getFilters } from '../utils/pagination.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, sendError } from '../utils/api-response.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export const classController = {
  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = getPagination(req);
    const filters = getFilters(req);
    
    const { classes, total } = await classService.findAll(pagination, filters);
    
    return sendPaginated(res, classes, pagination.page, pagination.limit, total);
  }),

  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const classData = await classService.findById(id);
    
    if (!classData) {
      return sendError(res, 'Classe non trouvée', 404);
    }
    
    return sendSuccess(res, classData);
  }),

  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const classData = await classService.create(req.body);
    return sendCreated(res, classData, 'Classe créée avec succès');
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const classData = await classService.update(id, req.body);
    return sendSuccess(res, classData, 'Classe mise à jour avec succès');
  }),

  delete: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await classService.delete(id);
    return sendNoContent(res);
  }),

  addStudent: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { studentId } = req.body;
    await classService.addStudent(id, studentId);
    return sendSuccess(res, null, 'Étudiant ajouté à la classe');
  }),

  removeStudent: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id, studentId } = req.params;
    await classService.removeStudent(id, studentId);
    return sendSuccess(res, null, 'Étudiant retiré de la classe');
  }),

  getStats: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await classService.getStats();
    return sendSuccess(res, stats);
  }),
};
