import api from './api';
import type { ApiResponse } from '../types';

export interface AttendanceRecord { studentId: string; status: 'present' | 'absent' | 'late' | 'excused'; note?: string; }
export interface AttendanceDoc { _id: string; classId: string; sectionId: string; date: string; periodNo?: number; records: AttendanceRecord[]; }
export interface StudentSummary { studentId: string; name: string; rollNo: string; present: number; absent: number; late: number; excused: number; total: number; percentage: number; isShortage: boolean; }

export const attendanceService = {
  mark: (data: { classId: string; sectionId: string; date: string; periodNo?: number; records: AttendanceRecord[] }) =>
    api.post<ApiResponse<AttendanceDoc>>('/attendance', data).then(r => r.data.data!),

  get: (params: Record<string, string>) =>
    api.get<ApiResponse<AttendanceDoc[]>>('/attendance', { params }).then(r => r.data.data ?? []),

  getStudentSummary: (params: { studentId: string; month: string; year: string }) =>
    api.get<ApiResponse<StudentSummary>>('/attendance/student-summary', { params }).then(r => r.data.data!),

  getSectionSummary: (params: { sectionId: string; month: string; year: string }) =>
    api.get<ApiResponse<StudentSummary[]>>('/attendance/section-summary', { params }).then(r => r.data.data ?? []),

  getMyRecords: (params: { month: string; year: string }) =>
    api.get<ApiResponse<{ records: { date: string; status: string }[]; stats: { present: number; absent: number; late: number; excused: number; total: number; percentage: number; threshold: number; isShortage: boolean } }>>('/attendance/my-records', { params }).then(r => r.data.data!),
};
