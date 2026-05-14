import type { Role } from '@/store/auth-store';

// Permission modules
export const MODULES = {
  DASHBOARD: 'dashboard',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  CLASSES: 'classes',
  ROOMS: 'rooms',
  SCHEDULE: 'schedule',
  ATTENDANCE: 'attendance',
  GRADES: 'grades',
  PAYMENTS: 'payments',
  COURSES: 'courses',
  QUIZZES: 'quizzes',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  USER_VALIDATION: 'user_validation',
  ACTIVITY_LOG: 'activity_log',
} as const;

export type Module = typeof MODULES[keyof typeof MODULES];

// Permission actions
export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  MANAGE: 'manage', // Full control
} as const;

export type Action = typeof ACTIONS[keyof typeof ACTIONS];

// Permission string format: "module.action"
export type Permission = `${Module}.${Action}`;

// Role-based default permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    // Full access to everything
    'dashboard.view',
    'dashboard.manage',
    'students.view',
    'students.create',
    'students.update',
    'students.delete',
    'students.export',
    'teachers.view',
    'teachers.create',
    'teachers.update',
    'teachers.delete',
    'teachers.export',
    'classes.view',
    'classes.create',
    'classes.update',
    'classes.delete',
    'rooms.view',
    'rooms.create',
    'rooms.update',
    'rooms.delete',
    'schedule.view',
    'schedule.create',
    'schedule.update',
    'schedule.delete',
    'attendance.view',
    'attendance.create',
    'attendance.update',
    'attendance.delete',
    'attendance.export',
    'grades.view',
    'grades.create',
    'grades.update',
    'grades.delete',
    'grades.export',
    'payments.view',
    'payments.create',
    'payments.update',
    'payments.delete',
    'payments.export',
    'courses.view',
    'courses.create',
    'courses.update',
    'courses.delete',
    'quizzes.view',
    'quizzes.create',
    'quizzes.update',
    'quizzes.delete',
    'messages.view',
    'messages.create',
    'messages.delete',
    'notifications.view',
    'notifications.create',
    'notifications.manage',
    'reports.view',
    'reports.export',
    'settings.view',
    'settings.manage',
    'user_validation.view',
    'user_validation.manage',
    'activity_log.view',
  ],
  DIRECTOR: [
    'dashboard.view',
    'students.view',
    'students.create',
    'students.update',
    'students.export',
    'teachers.view',
    'teachers.create',
    'teachers.update',
    'teachers.export',
    'classes.view',
    'classes.create',
    'classes.update',
    'rooms.view',
    'rooms.create',
    'rooms.update',
    'schedule.view',
    'schedule.create',
    'schedule.update',
    'attendance.view',
    'attendance.export',
    'grades.view',
    'grades.export',
    'payments.view',
    'payments.create',
    'payments.update',
    'payments.export',
    'courses.view',
    'quizzes.view',
    'messages.view',
    'messages.create',
    'notifications.view',
    'notifications.create',
    'reports.view',
    'reports.export',
    'settings.view',
    'user_validation.view',
    'activity_log.view',
  ],
  TEACHER: [
    'dashboard.view',
    'students.view',
    'classes.view',
    'schedule.view',
    'attendance.view',
    'attendance.create',
    'attendance.update',
    'grades.view',
    'grades.create',
    'grades.update',
    'courses.view',
    'courses.create',
    'courses.update',
    'courses.delete',
    'quizzes.view',
    'quizzes.create',
    'quizzes.update',
    'quizzes.delete',
    'messages.view',
    'messages.create',
    'notifications.view',
    'settings.view',
  ],
  STUDENT: [
    'dashboard.view',
    'schedule.view',
    'attendance.view',
    'grades.view',
    'courses.view',
    'quizzes.view',
    'messages.view',
    'messages.create',
    'notifications.view',
    'settings.view',
    'payments.view',
  ],
  PARENT: [
    'dashboard.view',
    'students.view', // Only their children
    'schedule.view',
    'attendance.view',
    'grades.view',
    'payments.view',
    'messages.view',
    'messages.create',
    'notifications.view',
    'settings.view',
  ],
};

// Helper functions
export function hasPermission(
  userRole: Role,
  permission: Permission,
  userPermissions?: { permission: { name: string }; granted: boolean }[]
): boolean {
  // Check user-specific permissions first (can override role permissions)
  if (userPermissions) {
    const userPerm = userPermissions.find(p => p.permission.name === permission);
    if (userPerm) {
      return userPerm.granted;
    }
  }

  // Fall back to role-based permissions
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  userRole: Role,
  permissions: Permission[],
  userPermissions?: { permission: { name: string }; granted: boolean }[]
): boolean {
  return permissions.some(permission => 
    hasPermission(userRole, permission, userPermissions)
  );
}

export function hasAllPermissions(
  userRole: Role,
  permissions: Permission[],
  userPermissions?: { permission: { name: string }; granted: boolean }[]
): boolean {
  return permissions.every(permission => 
    hasPermission(userRole, permission, userPermissions)
  );
}

export function canAccessModule(
  userRole: Role,
  module: Module,
  userPermissions?: { permission: { name: string }; granted: boolean }[]
): boolean {
  return hasPermission(userRole, `${module}.view` as Permission, userPermissions);
}

// Get all permissions for a role
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  'dashboard.view': 'Voir le tableau de bord',
  'dashboard.manage': 'Gérer le tableau de bord',
  'students.view': 'Voir les étudiants',
  'students.create': 'Créer des étudiants',
  'students.update': 'Modifier les étudiants',
  'students.delete': 'Supprimer des étudiants',
  'students.export': 'Exporter les données des étudiants',
  'teachers.view': 'Voir les enseignants',
  'teachers.create': 'Créer des enseignants',
  'teachers.update': 'Modifier les enseignants',
  'teachers.delete': 'Supprimer des enseignants',
  'teachers.export': 'Exporter les données des enseignants',
  'classes.view': 'Voir les classes',
  'classes.create': 'Créer des classes',
  'classes.update': 'Modifier les classes',
  'classes.delete': 'Supprimer des classes',
  'rooms.view': 'Voir les salles',
  'rooms.create': 'Créer des salles',
  'rooms.update': 'Modifier les salles',
  'rooms.delete': 'Supprimer des salles',
  'schedule.view': 'Voir l\'emploi du temps',
  'schedule.create': 'Créer des créneaux',
  'schedule.update': 'Modifier l\'emploi du temps',
  'schedule.delete': 'Supprimer des créneaux',
  'attendance.view': 'Voir les absences',
  'attendance.create': 'Marquer les présences',
  'attendance.update': 'Modifier les absences',
  'attendance.delete': 'Supprimer des absences',
  'attendance.export': 'Exporter les absences',
  'grades.view': 'Voir les notes',
  'grades.create': 'Créer des notes',
  'grades.update': 'Modifier les notes',
  'grades.delete': 'Supprimer des notes',
  'grades.export': 'Exporter les notes',
  'payments.view': 'Voir les paiements',
  'payments.create': 'Créer des paiements',
  'payments.update': 'Modifier les paiements',
  'payments.delete': 'Supprimer des paiements',
  'payments.export': 'Exporter les paiements',
  'courses.view': 'Voir les cours',
  'courses.create': 'Créer des cours',
  'courses.update': 'Modifier les cours',
  'courses.delete': 'Supprimer des cours',
  'quizzes.view': 'Voir les quiz',
  'quizzes.create': 'Créer des quiz',
  'quizzes.update': 'Modifier les quiz',
  'quizzes.delete': 'Supprimer des quiz',
  'messages.view': 'Voir les messages',
  'messages.create': 'Envoyer des messages',
  'messages.delete': 'Supprimer des messages',
  'notifications.view': 'Voir les notifications',
  'notifications.create': 'Créer des notifications',
  'notifications.manage': 'Gérer les notifications',
  'reports.view': 'Voir les rapports',
  'reports.export': 'Exporter les rapports',
  'settings.view': 'Voir les paramètres',
  'settings.manage': 'Gérer les paramètres',
  'user_validation.view': 'Voir les utilisateurs en attente',
  'user_validation.manage': 'Valider/Rejeter les utilisateurs',
  'activity_log.view': 'Voir le journal d\'activité',
};
