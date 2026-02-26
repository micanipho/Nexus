'use client';

import React from 'react';
import { useHasRole } from '../../hooks/useHasRole';
import { UserRole } from '../../types';

interface RoleGuardProps {
  /** Roles that are allowed to see / interact with the children. */
  roles: UserRole[];
  /**
   * `hide`    — render nothing when the user lacks the role (default).
   * `disable` — render the children but disable pointer events and dim them.
   */
  mode?: 'hide' | 'disable';
  children: React.ReactNode;
}

/**
 * Conditionally show or disable UI elements based on the current user's role.
 *
 * @example
 * ```tsx
 * <RoleGuard roles={[UserRole.ADMIN, UserRole.SALES_MANAGER]}>
 *   <Button danger>Delete</Button>
 * </RoleGuard>
 *
 * <RoleGuard roles={[UserRole.ADMIN]} mode="disable">
 *   <Button>Approve</Button>
 * </RoleGuard>
 * ```
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ roles, mode = 'hide', children }) => {
  const { hasRole } = useHasRole(roles);

  if (hasRole) {
    return <>{children}</>;
  }

  if (mode === 'disable') {
    return (
      <div style={{ pointerEvents: 'none', opacity: 0.5, cursor: 'not-allowed' }}>
        {children}
      </div>
    );
  }

  // mode === 'hide'
  return null;
};

export default RoleGuard;
