import axios from 'axios';
import api from './api';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export interface AdmissionProgram {
  _id: string;
  name: string;
  code: string;
  description?: string;
  totalSeats: number;
  quotaSeats: { sports: number; staff: number; army: number };
  isOpen: boolean;
  sortOrder: number;
}

export interface AdmissionConfig {
  org: { name: string; slug: string; logoUrl?: string; primaryColor?: string; tagline?: string };
  programs: AdmissionProgram[];
  totalOpenSeats: number;
  isOpen: boolean;
}

export interface Application {
  _id: string;
  refNo: string;
  status: string;
  personal: { name: string; fatherName: string; parentPhone: string };
  academic: { percentage: number; previousSchool: string };
  quota: { type: string; verified: boolean };
  sibling: { has: boolean; verified: boolean };
  preferences: { programId: string; programName: string; rank: number }[];
  allocatedProgramName?: string;
  meritScore?: number;
  submittedAt: string;
}

export interface ApplicationDetail extends Application {
  personal: {
    name: string; fatherName: string; motherName?: string; dob: string;
    gender: string; bloodGroup?: string; religion?: string; nationality?: string;
    address: string; studentPhone?: string; parentPhone: string; emergencyContact?: string;
  };
  academic: {
    previousSchool: string; board?: string; rollNo?: string;
    marksObtained: number; totalMarks: number; percentage: number;
  };
  sibling: { has: boolean; siblingName?: string; siblingGrNo?: string; verified: boolean };
  documents: {
    photo: { url?: string; verified: boolean };
    bForm: { url?: string; verified: boolean };
    resultCard: { url?: string; verified: boolean };
    quotaProof: { url?: string; verified: boolean };
  };
  adminNotes: { text: string; addedByName: string; addedAt: string }[];
  statusHistory: { status: string; changedAt: string; changedByName?: string; note?: string }[];
  enrolledStudentId?: string;
  offerSentAt?: string;
  meritRound?: number;
}

export interface MeritEntry {
  _id: string;
  refNo: string;
  status: string;
  'personal.name': string;
  'personal.fatherName': string;
  'academic.percentage': number;
  'quota.type': string;
  'sibling.has': boolean;
  meritScore?: number;
  allocatedProgramName?: string;
  meritRound?: number;
}

export interface SeatOccupancy {
  _id: string;
  name: string;
  code: string;
  totalSeats: number;
  quotaSeats: { sports: number; staff: number; army: number };
  filledSeats: number;
  availableSeats: number;
  isOpen: boolean;
}

// ─── Public (no auth) ───────────────────────────────────────────────────────

export async function getAdmissionConfig(slug: string): Promise<AdmissionConfig> {
  const res = await axios.get(`${BASE_URL}/public/admission/${slug}`);
  return res.data.data;
}

export async function getPublicUploadUrl(slug: string, filename: string, contentType: string) {
  const res = await axios.post(`${BASE_URL}/public/admission/${slug}/upload-url`, { filename, contentType });
  return res.data.data as { uploadUrl: string; key: string };
}

export async function submitApplication(slug: string, payload: Record<string, unknown>) {
  const res = await axios.post(`${BASE_URL}/public/admission/${slug}`, payload);
  return res.data.data as { refNo: string; message: string };
}

// ─── Admin (authenticated) ──────────────────────────────────────────────────

export const admissionService = {
  // Programs
  listPrograms: async () => {
    const res = await api.get('/admission/programs');
    return res.data.data as AdmissionProgram[];
  },
  createProgram: async (data: Record<string, unknown>) => {
    const res = await api.post('/admission/programs', data);
    return res.data.data as AdmissionProgram;
  },
  updateProgram: async (id: string, data: Record<string, unknown>) => {
    const res = await api.put(`/admission/programs/${id}`, data);
    return res.data.data as AdmissionProgram;
  },
  deleteProgram: async (id: string) => {
    await api.delete(`/admission/programs/${id}`);
  },

  // Applications
  listApplications: async (params?: Record<string, string>) => {
    const res = await api.get('/admission/applications', { params });
    return { data: res.data.data as Application[], meta: res.data.meta };
  },
  getApplication: async (id: string) => {
    const res = await api.get(`/admission/applications/${id}`);
    return res.data.data as ApplicationDetail;
  },
  updateStatus: async (id: string, status: string, note?: string) => {
    const res = await api.put(`/admission/applications/${id}/status`, { status, note });
    return res.data.data;
  },
  verifyDocument: async (id: string, docType: string, verified: boolean) => {
    const res = await api.put(`/admission/applications/${id}/documents/${docType}/verify`, { verified });
    return res.data.data;
  },
  verifyField: async (id: string, field: string, verified: boolean) => {
    await api.put(`/admission/applications/${id}/verify/${field}`, { verified });
  },
  addNote: async (id: string, text: string) => {
    const res = await api.post(`/admission/applications/${id}/notes`, { text });
    return res.data.data;
  },
  enroll: async (id: string, data: { classId: string; sectionId: string; academicYearId: string; email: string }) => {
    const res = await api.post(`/admission/applications/${id}/enroll`, data);
    return res.data.data as { admissionNo: string; rollNo: string; studentId: string; tempPassword: string };
  },

  // Merit list
  generateMeritList: async (programIds: string[], round = 1) => {
    const res = await api.post('/admission/merit-list/generate', { programIds, round });
    return res.data.data as { allocated: number; waitlisted: number; totalProcessed: number };
  },
  getMeritList: async (programId?: string) => {
    const res = await api.get('/admission/merit-list', { params: programId ? { programId } : undefined });
    return res.data.data as MeritEntry[];
  },
  getSeatOccupancy: async () => {
    const res = await api.get('/admission/seat-occupancy');
    return res.data.data as SeatOccupancy[];
  },
  getStats: async () => {
    const res = await api.get('/admission/applications/stats');
    return res.data.data;
  },
};
