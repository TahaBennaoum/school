import { Router } from 'express';
import { gradeController } from '../controllers/grade.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { canViewGrades, canEditGrades } from '../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// GET /api/grades - List all grades
router.get('/', canViewGrades, gradeController.getAll);

// GET /api/grades/stats - Get grade statistics
router.get('/stats', canViewGrades, gradeController.getStats);

// GET /api/grades/student/:studentId/average - Get student average
router.get('/student/:studentId/average', canViewGrades, gradeController.getStudentAverage);

// GET /api/grades/class/:classId/ranking - Get class ranking
router.get('/class/:classId/ranking', canViewGrades, gradeController.getClassRanking);

// GET /api/grades/:id - Get grade by ID
router.get('/:id', canViewGrades, gradeController.getById);

// POST /api/grades - Create grade
router.post('/', canEditGrades, gradeController.create);

// POST /api/grades/batch - Create multiple grades
router.post('/batch', canEditGrades, gradeController.createBatch);

// PUT /api/grades/:id - Update grade
router.put('/:id', canEditGrades, gradeController.update);

// DELETE /api/grades/:id - Delete grade
router.delete('/:id', canEditGrades, gradeController.delete);

export default router;
