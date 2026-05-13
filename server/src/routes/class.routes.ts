import { Router } from 'express';
import { classController } from '../controllers/class.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { canManageClasses, staffOnly } from '../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// GET /api/classes - List all classes
router.get('/', staffOnly, classController.getAll);

// GET /api/classes/stats - Get class statistics
router.get('/stats', staffOnly, classController.getStats);

// GET /api/classes/:id - Get class by ID with students
router.get('/:id', staffOnly, classController.getById);

// POST /api/classes - Create class
router.post('/', canManageClasses, classController.create);

// PUT /api/classes/:id - Update class
router.put('/:id', canManageClasses, classController.update);

// DELETE /api/classes/:id - Delete class
router.delete('/:id', canManageClasses, classController.delete);

// POST /api/classes/:id/students - Add student to class
router.post('/:id/students', canManageClasses, classController.addStudent);

// DELETE /api/classes/:id/students/:studentId - Remove student from class
router.delete('/:id/students/:studentId', canManageClasses, classController.removeStudent);

export default router;
