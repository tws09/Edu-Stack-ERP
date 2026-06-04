import { Schema, model, Document, Types } from 'mongoose';
import { tenantPlugin } from '../utils/tenantPlugin';

export interface IAdmissionProgram extends Document {
  orgId: Types.ObjectId;
  branchId: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  totalSeats: number;
  quotaSeats: {
    sports: number;
    staff: number;
    army: number;
  };
  isOpen: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const admissionProgramSchema = new Schema<IAdmissionProgram>(
  {
    orgId:     { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    branchId:  { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    name:      { type: String, required: true, trim: true },
    code:      { type: String, required: true, trim: true, uppercase: true },
    description: String,
    totalSeats: { type: Number, required: true, min: 1 },
    quotaSeats: {
      sports: { type: Number, default: 0 },
      staff:  { type: Number, default: 0 },
      army:   { type: Number, default: 0 },
    },
    isOpen:    { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

admissionProgramSchema.index({ orgId: 1, branchId: 1, isOpen: 1 });
admissionProgramSchema.index({ orgId: 1, code: 1 }, { unique: true });
admissionProgramSchema.plugin(tenantPlugin);

export const AdmissionProgram = model<IAdmissionProgram>('AdmissionProgram', admissionProgramSchema);
