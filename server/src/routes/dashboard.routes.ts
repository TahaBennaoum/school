import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { staffOnly } from '../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(staffOnly);

// GET /api/dashboard/stats - Get all dashboard statistics
router.get('/stats', dashboardController.getStats);

// GET /api/dashboard/activity - Get recent activity
router.get('/activity', dashboardController.getRecentActivity);

// GET /api/dashboard/revenue - Get monthly revenue
router.get('/revenue', dashboardController.getMonthlyRevenue);

// GET /api/dashboard/attendance-trend - Get attendance trend
router.get('/attendance-trend', dashboardController.getAttendanceTrend);

// GET /api/dashboard/grade-distribution - Get grade distribution
router.get('/grade-distribution', dashboardController.getGradeDistribution);

export default router;
