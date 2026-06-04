import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin } from '../utils/tenantPlugin';

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'docs_verified'
  | 'shortlisted'
  | 'offered'
  | 'accepted'
  | 'enrolled'
  | 'rejected'
  | 'waitlisted'
  | 'declined';

export type QuotaType = 'none' | 'sports' | 'staff' | 'army';

export interface IApplication extends Document {
  orgId: Types.ObjectId;
  refNo: string;

  preferences: {
    programId: Types.ObjectId;
    programName: string;
    rank: 1 | 2 | 3;
  }[];

  personal: {
    name: string;
    fatherName: string;
    motherName?: string;
    dob: Date;
    gender: 'male' | 'female';
    bloodGroup?: string;
    religion?: string;
    nationality?: string;
    address: string;
    studentPhone?: string;
    parentPhone: string;
    emergencyContact?: string;
  };

  academic: {
    previousSchool: string;
    board?: string;
    rollNo?: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
  };

  sibling: {
    has: boolean;
    siblingName?: string;
    siblingGrNo?: string;
    verified: boolean;
  };

  quota: {
    type: QuotaType;
    verified: boolean;
  };

  documents: {
    photo:      { key?: string; url?: string; verified: boolean };
    bForm:      { key?: string; url?: string; verified: boolean };
    resultCard: { key?: string; url?: string; verified: boolean };
    quotaProof: { key?: string; url?: string; verified: boolean };
  };

  status: ApplicationStatus;
  meritScore?: number;
  allocatedProgramId?: Types.ObjectId;
  allocatedProgramName?: string;
  meritRound?: number;

  offerSentAt?: Date;
  enrolledStudentId?: Types.ObjectId;

  adminNotes: {
    text: string;
    addedByName: string;
    addedAt: Date;
  }[];

  statusHistory: {
    status: ApplicationStatus;
    changedAt: Date;
    changedByName?: string;
    note?: string;
  }[];

  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    orgId:  { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    refNo:  { type: String, required: true },

    preferences: [
      {
        programId:   { type: Schema.Types.ObjectId, ref: 'AdmissionProgram', required: true },
        programName: { type: String, required: true },
        rank:        { type: Number, enum: [1, 2, 3], required: true },
      },
    ],

    personal: {
      name:             { type: String, required: true, trim: true },
      fatherName:       { type: String, required: true, trim: true },
      motherName:       String,
      dob:              { type: Date, required: true },
      gender:           { type: String, enum: ['male', 'female'], required: true },
      bloodGroup:       String,
      religion:         String,
      nationality:      { type: String, default: 'Pakistani' },
      address:          { type: String, required: true },
      studentPhone:     String,
      parentPhone:      { type: String, required: true },
      emergencyContact: String,
    },

    academic: {
      previousSchool: { type: String, required: true },
      board:          String,
      rollNo:         String,
      marksObtained:  { type: Number, required: true },
      totalMarks:     { type: Number, required: true },
      percentage:     { type: Number, required: true },
    },

    sibling: {
      has:         { type: Boolean, default: false },
      siblingName: String,
      siblingGrNo: String,
      verified:    { type: Boolean, default: false },
    },

    quota: {
      type:     { type: String, enum: ['none', 'sports', 'staff', 'army'], default: 'none' },
      verified: { type: Boolean, default: false },
    },

    documents: {
      photo:      { key: String, url: String, verified: { type: Boolean, default: false } },
      bForm:      { key: String, url: String, verified: { type: Boolean, default: false } },
      resultCard: { key: String, url: String, verified: { type: Boolean, default: false } },
      quotaProof: { key: String, url: String, verified: { type: Boolean, default: false } },
    },

    status:               { type: String, enum: ['submitted','under_review','docs_verified','shortlisted','offered','accepted','enrolled','rejected','waitlisted','declined'], default: 'submitted' },
    meritScore:           Number,
    allocatedProgramId:   { type: Schema.Types.ObjectId, ref: 'AdmissionProgram' },
    allocatedProgramName: String,
    meritRound:           Number,

    offerSentAt:        Date,
    enrolledStudentId:  { type: Schema.Types.ObjectId, ref: 'Student' },

    adminNotes: [
      {
        text:        { type: String, required: true },
        addedByName: String,
        addedAt:     { type: Date, default: Date.now },
      },
    ],

    statusHistory: [
      {
        status:        String,
        changedAt:     { type: Date, default: Date.now },
        changedByName: String,
        note:          String,
      },
    ],

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ orgId: 1, status: 1 });
applicationSchema.index({ orgId: 1, refNo: 1 }, { unique: true });
applicationSchema.index({ orgId: 1, 'preferences.programId': 1 });
applicationSchema.index({ orgId: 1, submittedAt: -1 });
applicationSchema.plugin(tenantPlugin);

export const Application = model<IApplication>('Application', applicationSchema);
