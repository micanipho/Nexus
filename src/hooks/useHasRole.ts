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
export function useHasRole(requiredRoles: (UserRole | string)[]) {
  const authState = useAuth();
  const { user, loading, isAuthenticated } = authState;

  const hasRole = useMemo(() => {
    console.log("[RBAC Hook] Evaluating for:", requiredRoles);
    console.log("[RBAC Hook] Current AuthState context:", { 
      hasUserObj: !!user, 
      userKeys: user ? Object.keys(user) : 'null',
      loading, 
      isAuthenticated 
    });

    if (!user?.roles) {
      console.log("[RBAC Hook] No user roles found.", user);
      return false;
    }
    
    // Normalize required roles for safer comparison
    const normalizedRequiredRoles = new Set(
      requiredRoles.map(r => String(r).toLowerCase())
    );
    
    const userRolesLower = user.roles.map(r => String(r).toLowerCase());
    
    console.log("[RBAC Hook] Checking access:", {
      userRoles: userRolesLower,
      requiredMatches: Array.from(normalizedRequiredRoles)
    });

    // Check if any of the user's roles match the normalized required roles
    return userRolesLower.some((role) => 
      normalizedRequiredRoles.has(role)
    );
  }, [user?.roles, requiredRoles]);

  // If auth is still initializing, don't proactively deny
  // so the component can safely render loading skeletons instead if it wants to.
  const resolvedRoleState = loading ? false : hasRole;

  return { hasRole: resolvedRoleState, isLoading: loading, user };
}
