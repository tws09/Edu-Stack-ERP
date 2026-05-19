import api from './api';
import type { ApiResponse } from '../types';

export interface AssignmentDoc { _id: string; title: string; description: string; classId: string; sectionId: string; subjectId: { _id: string; name: string; code: string } | string; dueDate: string; totalMarks?: number; attachmentUrl?: string; isActive: boolean; createdById: { _id: string; name: string } | string; }
export interface SubmissionDoc { _id: string; studentId: { _id: string; profile: { name: string }; rollNo: string } | string; textResponse?: string; fileUrl?: string; fileName?: string; submittedAt: string; status: 'submitted' | 'graded' | 'late'; marksAwarded?: number; feedback?: string; }

export const assignmentService = {
  list: (params?: Record<string, string>) =>
    api.get<ApiResponse<AssignmentDoc[]>>('/assignments', { params }).then(r => r.data.data ?? []),

  get: (id: string) => api.get<ApiResponse<AssignmentDoc>>(`/assignments/${id}`).then(r => r.data.data!),

  create: (data: Partial<AssignmentDoc>) =>
    api.post<ApiResponse<AssignmentDoc>>('/assignments', data).then(r => r.data.data!),

  update: (id: string, data: Partial<AssignmentDoc>) =>
    api.put<ApiResponse<AssignmentDoc>>(`/assignments/${id}`, data).then(r => r.data.data!),

  getSubmissions: (assignmentId: string) =>
    api.get<ApiResponse<SubmissionDoc[]>>(`/assignments/${assignmentId}/submissions`).then(r => r.data.data ?? []),

  submit: (assignmentId: string, data: { studentId: string; textResponse?: string; fileKey?: string; fileName?: string }) =>
    api.post<ApiResponse<SubmissionDoc>>(`/assignments/${assignmentId}/submit`, data).then(r => r.data.data!),

  grade: (assignmentId: string, submissionId: string, data: { marksAwarded: number; feedback?: string }) =>
    api.put<ApiResponse<SubmissionDoc>>(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data).then(r => r.data.data!),
};
