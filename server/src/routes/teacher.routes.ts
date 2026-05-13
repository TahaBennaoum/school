import { Router } from 'express';
import { teacherController } from '../controllers/teacher.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { canManageTeachers, staffOnly } from '../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// GET /api/teachers - List all teachers
router.get('/', staffOnly, teacherController.getAll);

// GET /api/teachers/stats - Get teacher statistics
router.get('/stats', staffOnly, teacherController.getStats);

// GET /api/teachers/:id - Get teacher by ID
router.get('/:id', staffOnly, teacherController.getById);

// POST /api/teachers - Create teacher
router.post('/', canManageTeachers, teacherController.create);

// PUT /api/teachers/:id - Update teacher
router.put('/:id', canManageTeachers, teacherController.update);

// DELETE /api/teachers/:id - Delete teacher
router.delete('/:id', canManageTeachers, teacherController.delete);

export default router;
