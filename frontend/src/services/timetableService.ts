import api from './api';
import type { ApiResponse } from '../types';

export interface TimetableSlot { dayOfWeek: number; periodNo: number; subjectId: string | { _id: string; name: string; code: string }; teacherId: string | { _id: string; name: string }; roomNo?: string; }
export interface PeriodTiming { periodNo: number; startTime: string; endTime: string; }
export interface TimetableDoc { _id: string; classId: string | { _id: string; name: string }; sectionId: string | { _id: string; name: string }; academicYearId: string; slots: TimetableSlot[]; periodTimings: PeriodTiming[]; isActive: boolean; }

export const timetableService = {
  get: (params: Record<string, string>) =>
    api.get<ApiResponse<TimetableDoc[]>>('/timetable', { params }).then(r => r.data.data ?? []),

  create: (data: { classId: string; sectionId: string; academicYearId: string; slots: TimetableSlot[]; periodTimings: PeriodTiming[] }) =>
    api.post<ApiResponse<TimetableDoc>>('/timetable', data).then(r => r.data.data!),

  update: (id: string, data: { slots: TimetableSlot[]; periodTimings: PeriodTiming[] }) =>
    api.put<ApiResponse<TimetableDoc>>(`/timetable/${id}`, data).then(r => r.data.data!),
};
