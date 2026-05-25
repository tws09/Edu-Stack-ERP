import api from './api';
import type { AuthUser, ApiResponse } from '../types';

interface LoginResponse {
  user: AuthUser;
  mustChangePassword?: boolean;
}

export async function login(
  email: string,
  password: string,
  slug?: string,
  loginAs?: 'admin' | 'teacher' | 'student',
): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
    email,
    password,
    ...(slug ? { slug } : {}),
    ...(loginAs ? { loginAs } : {}),
  });
  if (!data.success || !data.data) throw new Error(data.message ?? 'Login failed');
  if (data.data.mustChangePassword) throw new Error('PASSWORD_CHANGE_REQUIRED');
  return data.data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout').catch(() => {});
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<ApiResponse<AuthUser>>('/auth/me');
  if (!data.success || !data.data) throw new Error('Failed to get user');
  return data.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.put('/auth/change-password', { currentPassword, newPassword });
}

export interface OrgBranding {
  name: string;
  slug: string;
  logoUrl: string | null;
  welcomeMessage: string | null;
}

export async function getOrgBranding(slug: string): Promise<OrgBranding | null> {
  try {
    const { data } = await api.get<{ success: boolean; data: OrgBranding }>(`/public/orgs/${slug}`);
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}
