'use client';

import { type ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import type { Permission } from '@/lib/rbac/permissions';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
  const { can, canAny, canAll } = usePermissions();

  // Single permission check
  if (permission) {
    if (!can(permission)) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  // Multiple permissions check
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? canAll(permissions)
      : canAny(permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  // No permission specified, render children
  return <>{children}</>;
}

// Role-based gate component
interface RoleGateProps {
  children: ReactNode;
  roles: Array<'ADMIN' | 'DIRECTOR' | 'TEACHER' | 'STUDENT' | 'PARENT'>;
  fallback?: ReactNode;
}

export function RoleGate({ children, roles, fallback = null }: RoleGateProps) {
  const { role } = usePermissions();

  if (!role || !roles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Admin-only gate
export function AdminGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAdmin } = usePermissions();

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Staff-only gate (Admin, Director, Teacher)
export function StaffGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { isStaff } = usePermissions();

  if (!isStaff) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
