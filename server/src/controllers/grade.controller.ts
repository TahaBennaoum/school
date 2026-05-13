import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { gradeService } from '../services/grade.service.js';
import { getPagination, getFilters } from '../utils/pagination.js';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent, sendError } from '../utils/api-response.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export const gradeController = {
  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = getPagination(req);
    const filters = getFilters(req);
    
    const { grades, total } = await gradeService.findAll(pagination, filters);
    
    return sendPaginated(res, grades, pagination.page, pagination.limit, total);
  }),

  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const grade = await gradeService.findById(id);
    
    if (!grade) {
      return sendError(res, 'Note non trouvée', 404);
    }
    
    return sendSuccess(res, grade);
  }),

  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const grade = await gradeService.create(req.body);
    return sendCreated(res, grade, 'Note créée avec succès');
  }),

  createBatch: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { grades } = req.body;
    const created = await gradeService.createBatch(grades);
    return sendCreated(res, created, `${created.length} notes créées avec succès`);
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const grade = await gradeService.update(id, req.body);
    return sendSuccess(res, grade, 'Note mise à jour avec succès');
  }),

  delete: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await gradeService.delete(id);
    return sendNoContent(res);
  }),

  getStudentAverage: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { studentId } = req.params;
    const { term, schoolYearId } = req.query;
    
    const average = await gradeService.getStudentAverage(
      studentId,
      term ? parseInt(term as string) : undefined,
      schoolYearId as string
    );
    
    return sendSuccess(res, { average });
  }),

  getClassRanking: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { classId } = req.params;
    const { term, schoolYearId } = req.query;
    
    if (!term) {
      return sendError(res, 'Le trimestre est requis', 400);
    }
    
    const ranking = await gradeService.getClassRanking(
      classId,
      parseInt(term as string),
      schoolYearId as string
    );
    
    return sendSuccess(res, ranking);
  }),

  getStats: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { classId, term } = req.query;
    const stats = await gradeService.getStats(
      classId as string,
      term ? parseInt(term as string) : undefined
    );
    return sendSuccess(res, stats);
  }),
};
