import api from './api';
import type { ApiResponse } from '../types';

export interface StudentDoc {
  _id: string;
  rollNo: string;
  admissionNo: string;
  classId: { _id: string; name: string; level: string } | string;
  sectionId: { _id: string; name: string } | string;
  status: string;
  profile: { name: string; dateOfBirth: string; gender: string; cnicOrBForm: string; photoUrl?: string; address?: string; };
  guardianInfo: { fatherName: string; fatherPhone: string; fatherCnic?: string; };
  admissionDate: string;
}

export interface CreateStudentPayload {
  email: string;
  classId: string;
  sectionId: string;
  academicYearId: string;
  profile: StudentDoc['profile'];
  guardianInfo: StudentDoc['guardianInfo'];
  previousSchool?: string;
}

export const studentService = {
  list: (params?: Record<string, string>) =>
    api.get<ApiResponse<StudentDoc[]>>('/students', { params }).then(r => ({ data: r.data.data ?? [], meta: r.data.meta })),

  get: (id: string) => api.get<ApiResponse<StudentDoc>>(`/students/${id}`).then(r => r.data.data!),

  create: (payload: CreateStudentPayload) =>
    api.post<ApiResponse<{ student: StudentDoc; tempPassword: string }>>('/students', payload).then(r => r.data.data!),

  update: (id: string, data: Partial<StudentDoc>) =>
    api.put<ApiResponse<StudentDoc>>(`/students/${id}`, data).then(r => r.data.data!),

  getMe: () => api.get<ApiResponse<StudentDoc>>('/students/me').then(r => r.data.data!),
};
