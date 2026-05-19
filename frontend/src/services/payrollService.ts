import api from './api';
import type { ApiResponse } from '../types';

export interface PayrollDoc {
  _id: string;
  staffId: { _id: string; name: string; email: string; role: string } | string;
  month: string;
  basicSalary: number;
  allowances: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  absentDays: number;
  absentDeduction: number;
  grossSalary: number;
  totalDeductions: number;
  netPay: number;
  status: 'draft' | 'approved' | 'paid';
  approvedById?: { _id: string; name: string } | string;
  approvedAt?: string;
  paidAt?: string;
  paymentMethod?: string;
}

export const payrollService = {
  list: (params?: Record<string, string>) =>
    api.get<ApiResponse<PayrollDoc[]>>('/payroll', { params }).then(r => r.data.data ?? []),

  create: (data: { staffId: string; month: string; basicSalary: number; allowances?: { name: string; amount: number }[]; deductions?: { name: string; amount: number }[] }) =>
    api.post<ApiResponse<PayrollDoc>>('/payroll', data).then(r => r.data.data!),

  bulkProcess: (data: { month: string; staffIds?: string[] }) =>
    api.post<ApiResponse<{ created: number; skipped: number }>>('/payroll/bulk', data).then(r => r.data),

  update: (id: string, data: Partial<PayrollDoc>) =>
    api.put<ApiResponse<PayrollDoc>>(`/payroll/${id}`, data).then(r => r.data.data!),

  approve: (id: string) =>
    api.post<ApiResponse<PayrollDoc>>(`/payroll/${id}/approve`).then(r => r.data.data!),

  markPaid: (id: string, paymentMethod: string) =>
    api.post<ApiResponse<PayrollDoc>>(`/payroll/${id}/pay`, { paymentMethod }).then(r => r.data.data!),
};
