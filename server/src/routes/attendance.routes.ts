import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { canViewAttendance, canEditAttendance } from '../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// GET /api/attendance - List all attendance records
router.get('/', canViewAttendance, attendanceController.getAll);

// GET /api/attendance/stats - Get global attendance statistics
router.get('/stats', canViewAttendance, attendanceController.getGlobalStats);

// GET /api/attendance/class/:classId - Get class attendance for a date
router.get('/class/:classId', canViewAttendance, attendanceController.getClassAttendance);

// GET /api/attendance/class/:classId/stats - Get class attendance stats
router.get('/class/:classId/stats', canViewAttendance, attendanceController.getClassStats);

// GET /api/attendance/student/:studentId/stats - Get student attendance stats
router.get('/student/:studentId/stats', canViewAttendance, attendanceController.getStudentStats);

// GET /api/attendance/:id - Get attendance by ID
router.get('/:id', canViewAttendance, attendanceController.getById);

// POST /api/attendance - Create attendance record
router.post('/', canEditAttendance, attendanceController.create);

// POST /api/attendance/batch - Create multiple attendance records
router.post('/batch', canEditAttendance, attendanceController.createBatch);

// PUT /api/attendance/:id - Update attendance record
router.put('/:id', canEditAttendance, attendanceController.update);

// DELETE /api/attendance/:id - Delete attendance record
router.delete('/:id', canEditAttendance, attendanceController.delete);

export default router;
