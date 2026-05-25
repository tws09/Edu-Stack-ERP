import api from './api';
import type { ApiResponse } from '../types';

export interface QuestionDoc {
  _id: string;
  subjectId: string | { _id: string; name: string; code: string };
  classId: string | { _id: string; name: string; level: string };
  type: 'MCQ' | 'SQ' | 'LQ';
  text: string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'en' | 'ur';
  options?: string[];        // 4 entries, MCQ only
  correctAnswer?: 'A' | 'B' | 'C' | 'D'; // MCQ only
  createdById: string | { _id: string; name: string };
  createdAt: string;
}

export interface QuestionFilters {
  subjectId?: string;
  classId?: string;
  type?: 'MCQ' | 'SQ' | 'LQ';
  difficulty?: string;
  chapter?: string;
}

export const questionBankService = {
  list: (filters?: QuestionFilters) =>
    api.get<ApiResponse<QuestionDoc[]>>('/question-bank', { params: filters }).then(r => r.data.data ?? []),

  create: (data: {
    subjectId: string;
    classId: string;
    type: 'MCQ' | 'SQ' | 'LQ';
    text: string;
    chapter: string;
    difficulty: 'easy' | 'medium' | 'hard';
    language: 'en' | 'ur';
    options?: string[];
    correctAnswer?: 'A' | 'B' | 'C' | 'D';
  }) => api.post<ApiResponse<QuestionDoc>>('/question-bank', data).then(r => r.data.data!),

  update: (id: string, data: Partial<{
    text: string;
    chapter: string;
    difficulty: string;
    language: string;
    options: string[];
    correctAnswer: 'A' | 'B' | 'C' | 'D';
  }>) => api.put<ApiResponse<QuestionDoc>>(`/question-bank/${id}`, data).then(r => r.data.data!),

  delete: (id: string) =>
    api.delete(`/question-bank/${id}`).then(r => r.data),
};
