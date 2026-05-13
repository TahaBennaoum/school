import { Router } from 'express';
import studentRoutes from './student.routes.js';
import teacherRoutes from './teacher.routes.js';
import classRoutes from './class.routes.js';
import gradeRoutes from './grade.routes.js';
import attendanceRoutes from './attendance.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

// API Routes
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/classes', classRoutes);
router.use('/grades', gradeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/dashboard', dashboardRoutes);

// API Info
router.get('/', (_req, res) => {
  res.json({
    name: 'School Management API',
    version: '1.0.0',
    endpoints: {
      students: '/api/students',
      teachers: '/api/teachers',
      classes: '/api/classes',
      grades: '/api/grades',
      attendance: '/api/attendance',
      dashboard: '/api/dashboard',
    },
  });
});

export default router;
