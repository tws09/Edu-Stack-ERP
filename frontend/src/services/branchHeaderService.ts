import api from './api';
import type { ApiResponse } from '../types';

export interface BranchHeaderConfig {
  schoolName: string;
  tagline: string;
  address: string;
  logoBase64: string;
  showStudentName: boolean;
  showRollNo: boolean;
  showSection: boolean;
}

export const branchHeaderService = {
  get: () =>
    api.get<ApiResponse<BranchHeaderConfig | null>>('/branch-header')
      .then(r => r.data.data ?? null),

  save: (data: BranchHeaderConfig) =>
    api.put<ApiResponse<BranchHeaderConfig>>('/branch-header', data)
      .then(r => r.data.data!),
};
