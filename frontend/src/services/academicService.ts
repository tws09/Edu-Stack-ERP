import api from './api';
import type { ApiResponse } from '../types';

export interface AcademicYear { _id: string; label: string; startDate: string; endDate: string; isCurrent: boolean; }
export interface ClassDoc { _id: string; name: string; level: string; academicYearId: string; displayOrder: number; }
export interface SectionDoc { _id: string; name: string; classId: string; classTeacherId?: string; capacity?: number; }
export interface SubjectDoc { _id: string; name: string; code: string; isElective: boolean; }

export const academicService = {
  getYears: () => api.get<ApiResponse<AcademicYear[]>>('/academic/years').then(r => r.data.data ?? []),
  createYear: (d: Partial<AcademicYear>) => api.post<ApiResponse<AcademicYear>>('/academic/years', d).then(r => r.data.data!),
  updateYear: (id: string, d: Partial<AcademicYear>) => api.put<ApiResponse<AcademicYear>>(`/academic/years/${id}`, d).then(r => r.data.data!),

  getClasses: (academicYearId?: string) => api.get<ApiResponse<ClassDoc[]>>('/academic/classes', { params: { academicYearId } }).then(r => r.data.data ?? []),
  createClass: (d: Partial<ClassDoc>) => api.post<ApiResponse<ClassDoc>>('/academic/classes', d).then(r => r.data.data!),
  updateClass: (id: string, d: Partial<ClassDoc>) => api.put<ApiResponse<ClassDoc>>(`/academic/classes/${id}`, d).then(r => r.data.data!),
  deleteClass: (id: string) => api.delete(`/academic/classes/${id}`),

  getSections: (classId?: string) => api.get<ApiResponse<SectionDoc[]>>('/academic/sections', { params: { classId } }).then(r => r.data.data ?? []),
  createSection: (d: Partial<SectionDoc>) => api.post<ApiResponse<SectionDoc>>('/academic/sections', d).then(r => r.data.data!),
  updateSection: (id: string, d: Partial<SectionDoc>) => api.put<ApiResponse<SectionDoc>>(`/academic/sections/${id}`, d).then(r => r.data.data!),
  deleteSection: (id: string) => api.delete(`/academic/sections/${id}`),

  getSubjects: (classId?: string) => api.get<ApiResponse<SubjectDoc[]>>('/academic/subjects', { params: classId ? { classId } : undefined }).then(r => r.data.data ?? []),
  createSubject: (d: Partial<SubjectDoc>) => api.post<ApiResponse<SubjectDoc>>('/academic/subjects', d).then(r => r.data.data!),
  updateSubject: (id: string, d: Partial<SubjectDoc>) => api.put<ApiResponse<SubjectDoc>>(`/academic/subjects/${id}`, d).then(r => r.data.data!),
  deleteSubject: (id: string) => api.delete(`/academic/subjects/${id}`),
};
