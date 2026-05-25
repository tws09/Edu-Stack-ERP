import api from './api';
import type { ApiResponse } from '../types';

export interface ExamTypeSection {
  name: string;
  type: 'MCQ' | 'SQ' | 'LQ';
  totalMarks: number;
  questionCount: number;
}

export interface ExamTypeDoc {
  _id: string;
  name: string;
  totalMarks: number;
  sections: ExamTypeSection[];
  isActive: boolean;
  createdById: string;
  createdAt: string;
}

export const examTypeService = {
  list: () =>
    api.get<ApiResponse<ExamTypeDoc[]>>('/exam-types').then(r => r.data.data ?? []),

  create: (data: { name: string; totalMarks: number; sections: ExamTypeSection[] }) =>
    api.post<ApiResponse<ExamTypeDoc>>('/exam-types', data).then(r => r.data.data!),

  update: (id: string, data: Partial<{ name: string; totalMarks: number; sections: ExamTypeSection[]; isActive: boolean }>) =>
    api.put<ApiResponse<ExamTypeDoc>>(`/exam-types/${id}`, data).then(r => r.data.data!),

  delete: (id: string) =>
    api.delete(`/exam-types/${id}`).then(r => r.data),
};
