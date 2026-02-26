'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Result, Spin } from 'antd';
import { useHasRole } from './useHasRole';
import { UserRole } from '../types';

/**
 * Higher-Order Component that restricts a page to certain roles.
 *
 * - While auth is loading → shows a centred spinner.
 * - Not authenticated   → redirects to `/login`.
 * - Wrong role          → renders a 403 "Access Denied" result.
 * - Authorised          → renders the wrapped component.
 *
 * @example
 * ```tsx
 * function SettingsPage() { return <div>Admin Settings</div>; }
 * export default withRoleGuard(SettingsPage, [UserRole.ADMIN]);
 * ```
 */
export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: UserRole[],
) {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const GuardedComponent: React.FC<P> = (props) => {
    const { hasRole, isLoading, user } = useHasRole(allowedRoles);
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.replace('/login');
      }
    }, [isLoading, user, router]);

    if (isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!user) {
      // Will redirect via the useEffect above; render nothing in the meantime.
      return null;
    }

    if (!hasRole) {
      return (
        <Result
          status="403"
          title="403 — Access Denied"
          subTitle="You do not have permission to view this page."
        />
      );
    }

    return <WrappedComponent {...props} />;
  };

  GuardedComponent.displayName = `withRoleGuard(${displayName})`;
  return GuardedComponent;
}
