import api from './api';
import type { ApiResponse } from '../types';

export interface FeeItem { name: string; amount: number; isOptional: boolean; }
export interface FeeStructureDoc { _id: string; classId: { _id: string; name: string } | string; academicYearId: string; name: string; items: FeeItem[]; totalAmount: number; dueDay: number; isActive: boolean; }

export interface PaymentEntry { amount: number; method: 'cash' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'cheque'; transactionRef?: string; collectedById: string; paidAt: string; receiptNo?: string; }
export interface ChallanDoc { _id: string; studentId: { _id: string; rollNo: string; profile: { name: string } } | string; classId: { _id: string; name: string } | string; month: string; challanNo: string; items: { name: string; amount: number }[]; totalAmount: number; discount: number; waiver: number; netAmount: number; paidAmount: number; dueDate: string; status: 'unpaid' | 'partial' | 'paid' | 'waived' | 'overdue'; payments: PaymentEntry[]; }

export interface FeeSummaryItem { _id: string; count: number; totalNet: number; totalPaid: number; }

export const feeService = {
  listStructures: (params?: Record<string, string>) =>
    api.get<ApiResponse<FeeStructureDoc[]>>('/fees/structures', { params }).then(r => r.data.data ?? []),

  createStructure: (data: Partial<FeeStructureDoc>) =>
    api.post<ApiResponse<FeeStructureDoc>>('/fees/structures', data).then(r => r.data.data!),

  updateStructure: (id: string, data: Partial<FeeStructureDoc>) =>
    api.put<ApiResponse<FeeStructureDoc>>(`/fees/structures/${id}`, data).then(r => r.data.data!),

  deleteStructure: (id: string) =>
    api.delete(`/fees/structures/${id}`),

  listChallans: (params?: Record<string, string>) =>
    api.get<ApiResponse<ChallanDoc[]>>('/fees/challans', { params }).then(r => r.data),

  getChallan: (id: string) =>
    api.get<ApiResponse<ChallanDoc>>(`/fees/challans/${id}`).then(r => r.data.data!),

  generateChallans: (data: { month: string; classId?: string }) =>
    api.post<ApiResponse<{ created: number; skipped: number }>>('/fees/challans/generate', data).then(r => r.data),

  recordPayment: (id: string, data: { amount: number; method: string; transactionRef?: string }) =>
    api.post<ApiResponse<ChallanDoc>>(`/fees/challans/${id}/payment`, data).then(r => r.data.data!),

  applyWaiver: (id: string, data: { discount?: number; waiver?: number; reason?: string }) =>
    api.post<ApiResponse<ChallanDoc>>(`/fees/challans/${id}/waiver`, data).then(r => r.data.data!),

  getSummary: (params?: Record<string, string>) =>
    api.get<ApiResponse<FeeSummaryItem[]>>('/fees/challans/summary', { params }).then(r => r.data.data ?? []),
};
