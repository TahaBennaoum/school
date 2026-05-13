import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from './auth.middleware.js';
import { AppError } from './error.middleware.js';

// Permission levels
const roleHierarchy: Record<Role, number> = {
  ADMIN: 5,
  DIRECTOR: 4,
  TEACHER: 3,
  PARENT: 2,
  STUDENT: 1,
};

// Check if user has required role(s)
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentification requise', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Accès non autorisé', 403));
    }

    next();
  };
};

// Check if user has minimum role level
export const requireMinRole = (minRole: Role) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentification requise', 401));
    }

    if (roleHierarchy[req.user.role] < roleHierarchy[minRole]) {
      return next(new AppError('Niveau d\'accès insuffisant', 403));
    }

    next();
  };
};

// Admin only
export const adminOnly = requireRole('ADMIN');

// Admin or Director
export const managementOnly = requireRole('ADMIN', 'DIRECTOR');

// Staff only (Admin, Director, Teacher)
export const staffOnly = requireRole('ADMIN', 'DIRECTOR', 'TEACHER');

// Specific permission checks
export const canManageStudents = requireRole('ADMIN', 'DIRECTOR');
export const canManageTeachers = requireRole('ADMIN', 'DIRECTOR');
export const canManageClasses = requireRole('ADMIN', 'DIRECTOR');
export const canViewGrades = requireRole('ADMIN', 'DIRECTOR', 'TEACHER', 'STUDENT', 'PARENT');
export const canEditGrades = requireRole('ADMIN', 'DIRECTOR', 'TEACHER');
export const canManagePayments = requireRole('ADMIN', 'DIRECTOR');
export const canViewAttendance = requireRole('ADMIN', 'DIRECTOR', 'TEACHER', 'PARENT');
export const canEditAttendance = requireRole('ADMIN', 'DIRECTOR', 'TEACHER');
