import api from './api';
import type { ApiResponse } from '../types';

export type PaperStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'printed';

export interface PopulatedQuestion {
  _id: string;
  text: string;
  chapter: string;
  difficulty: string;
  type: string;
  language: string;
  options?: string[];
  correctAnswer?: string;
}

export interface PaperQuestion {
  questionId: string | PopulatedQuestion;
  marks: number;
  isOverridden: boolean;
  textOverride?: string;
}

export interface PaperSection {
  name: string;
  type: 'MCQ' | 'SQ' | 'LQ';
  totalMarks: number;
  questions: PaperQuestion[];
}

export interface ExamPaperDoc {
  _id: string;
  examId: string | { _id: string; name: string; startDate: string; endDate: string };
  examTypeId: string | { _id: string; name: string; totalMarks: number; sections: unknown[] };
  subjectId: string | { _id: string; name: string; code: string };
  classId: string | { _id: string; name: string; level: string };
  createdById: string | { _id: string; name: string };
  approvedById?: string | { _id: string; name: string };
  approvedAt?: string;
  rejectedById?: string | { _id: string; name: string };
  rejectionComment?: string;
  status: PaperStatus;
  sections: PaperSection[];
  createdAt: string;
}

export const examPaperDraftService = {
  list: (params?: { status?: PaperStatus; examId?: string }) =>
    api.get<ApiResponse<ExamPaperDoc[]>>('/exam-paper-drafts', { params }).then(r => r.data.data ?? []),

  get: (id: string) =>
    api.get<ApiResponse<ExamPaperDoc>>(`/exam-paper-drafts/${id}`).then(r => r.data.data!),

  create: (data: { examId: string; examTypeId: string; subjectId: string; classId: string }) =>
    api.post<ApiResponse<ExamPaperDoc>>('/exam-paper-drafts', data).then(r => r.data.data!),

  updateSections: (id: string, sections: PaperSection[]) =>
    api.put<ApiResponse<ExamPaperDoc>>(`/exam-paper-drafts/${id}/sections`, { sections }).then(r => r.data.data!),

  submit: (id: string) =>
    api.post<ApiResponse<ExamPaperDoc>>(`/exam-paper-drafts/${id}/submit`).then(r => r.data.data!),

  approve: (id: string) =>
    api.post<ApiResponse<ExamPaperDoc>>(`/exam-paper-drafts/${id}/approve`).then(r => r.data.data!),

  reject: (id: string, comment: string) =>
    api.post<ApiResponse<ExamPaperDoc>>(`/exam-paper-drafts/${id}/reject`, { comment }).then(r => r.data.data!),

  markPrinted: (id: string) =>
    api.post<ApiResponse<ExamPaperDoc>>(`/exam-paper-drafts/${id}/printed`).then(r => r.data.data!),
};
