'use client';

import { useMemo } from 'react';
import { useAuth } from '../providers/authProvider';
import { UserRole } from '../types';

/**
 * Check whether the current user holds at least one of the required roles.
 *
 * @param requiredRoles - roles that grant access (user needs **any one** of them)
 * @returns `hasRole` – true when the user's roles overlap with `requiredRoles`
 */
export function useHasRole(requiredRoles: UserRole[]) {
  const { user, loading } = useAuth();

  const hasRole = useMemo(() => {
    if (!user?.roles) return false;
    return user.roles.some((role) => requiredRoles.includes(role));
  }, [user?.roles, requiredRoles]);

  return { hasRole, isLoading: loading, user };
}
