import { Router } from 'express';
import { studentController } from '../controllers/student.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { canManageStudents, staffOnly } from '../middlewares/rbac.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/students - List all students (staff only)
router.get('/', staffOnly, studentController.getAll);

// GET /api/students/stats - Get student statistics
router.get('/stats', staffOnly, studentController.getStats);

// GET /api/students/:id - Get student by ID
router.get('/:id', staffOnly, studentController.getById);

// POST /api/students - Create student (management only)
router.post('/', canManageStudents, studentController.create);

// PUT /api/students/:id - Update student
router.put('/:id', canManageStudents, studentController.update);

// DELETE /api/students/:id - Delete student
router.delete('/:id', canManageStudents, studentController.delete);

export default router;
