'use client';

import React from 'react';
import { UserRole } from '@/types';
import { useHasRole } from '@/hooks/useHasRole';

interface RoleGateProps {
  /** Roles that are allowed to see the children */
  readonly roles: (UserRole | string)[];
  /** Content rendered when the user has access */
  readonly children: React.ReactNode;
  /** Optional fallback rendered when access is denied (defaults to nothing) */
  readonly fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on the current user's role.
 * If the user does not hold any of the specified roles, renders `fallback` (or nothing).
 */
export default function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { hasRole, isLoading } = useHasRole(roles);

  if (isLoading) return null;
  if (!hasRole) return <>{fallback}</>;
  return <>{children}</>;
}
