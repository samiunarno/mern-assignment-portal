
import { UserRole } from './types';

export const ROLES_CONFIG = {
  [UserRole.Admin]: {
    label: 'Admin',
    color: 'bg-red-500',
  },
  [UserRole.Monitor]: {
    label: 'Monitor',
    color: 'bg-yellow-500',
  },
  [UserRole.Student]: {
    label: 'Student',
    color: 'bg-blue-500',
  },
};
