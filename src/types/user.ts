import { UserRole } from './enums';

export interface User {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: UserRole[];
  tenantId: string;
  tenantName?: string;
  expiresAt: string;
  avatar?: string;
}
