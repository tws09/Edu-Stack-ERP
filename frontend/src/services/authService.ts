import api from './api';
import type { AuthUser, ApiResponse } from '../types';

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
  if (!data.success || !data.data) throw new Error(data.message ?? 'Login failed');
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
