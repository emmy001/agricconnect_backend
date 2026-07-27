// src/common/constants/roles.ts
export const ROLES = {
  FARMER: 'farmer',
  PROFESSIONAL: 'professional',
  ADMIN: 'admin',
} as const;

export const ROLES_LIST = Object.values(ROLES);

export const DEFAULT_ROLE = ROLES.FARMER;