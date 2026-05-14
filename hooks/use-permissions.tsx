'use client';

import { useCallback, useMemo } from 'react';
import { useAuthStore, type Role } from '@/store/auth-store';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessModule,
  type Permission,
  type Module,
} from '@/lib/rbac/permissions';

interface UserPermission {
  permission: { name: string };
  granted: boolean;
}

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  // TODO: Fetch user-specific permissions from API
  const userPermissions: UserPermission[] = [];

  const role = user?.role as Role | undefined;

  const can = useCallback(
    (permission: Permission): boolean => {
      if (!role) return false;
      return hasPermission(role, permission, userPermissions);
    },
    [role, userPermissions]
  );

  const canAny = useCallback(
    (permissions: Permission[]): boolean => {
      if (!role) return false;
      return hasAnyPermission(role, permissions, userPermissions);
    },
    [role, userPermissions]
  );

  const canAll = useCallback(
    (permissions: Permission[]): boolean => {
      if (!role) return false;
      return hasAllPermissions(role, permissions, userPermissions);
    },
    [role, userPermissions]
  );

  const canAccess = useCallback(
    (module: Module): boolean => {
      if (!role) return false;
      return canAccessModule(role, module, userPermissions);
    },
    [role, userPermissions]
  );

  const isAdmin = useMemo(() => role === 'ADMIN', [role]);
  const isDirector = useMemo(() => role === 'ADMIN' || role === 'DIRECTOR', [role]);
  const isStaff = useMemo(
    () => role === 'ADMIN' || role === 'DIRECTOR' || role === 'TEACHER',
    [role]
  );
  const isStudent = useMemo(() => role === 'STUDENT', [role]);
  const isParent = useMemo(() => role === 'PARENT', [role]);

  return {
    role,
    can,
    canAny,
    canAll,
    canAccess,
    isAdmin,
    isDirector,
    isStaff,
    isStudent,
    isParent,
  };
}

// HOC for permission-based rendering
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: Permission
) {
  return function PermissionWrapper(props: P) {
    const { can } = usePermissions();

    if (!can(requiredPermission)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
