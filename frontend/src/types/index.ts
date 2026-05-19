export type UserRole =
  | 'super_admin'
  | 'group_admin'
  | 'branch_principal'
  | 'teacher'
  | 'student'
  | 'accountant'
  | 'it_admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId?: string;
  branchId?: string;
  profilePhotoUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { msg: string; path: string }[];
  meta?: { total: number; page: number; limit?: number };
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'growth' | 'scale';
  status: 'active' | 'suspended' | 'trial';
  contactEmail: string;
  contactPhone?: string;
  usageBilling: { activeStudents: number; lastCountedAt?: string };
  trialEndsAt?: string;
  createdAt: string;
}

export interface Branch {
  _id: string;
  orgId: string;
  name: string;
  code: string;
  address: string;
  city: string;
  status: 'active' | 'inactive';
  settings: {
    attendanceThreshold: number;
    periodsPerDay: number;
    workingDays: number[];
  };
}

export interface User {
  _id: string;
  orgId?: string;
  branchId?: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
  profilePhotoUrl?: string;
}
