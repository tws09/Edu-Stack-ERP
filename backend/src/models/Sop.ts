import mongoose, { Schema, Document } from 'mongoose';
import { tenantPlugin } from '../utils/tenantPlugin';
import type { UserRole } from './User';

export interface ISop extends Document {
  orgId: mongoose.Types.ObjectId;
  branchId: mongoose.Types.ObjectId;
  title: string;
  category: string;
  content: string;
  targetRoles: UserRole[];
  order: number;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const SopSchema = new Schema<ISop>(
  {
    orgId: { type: Schema.Types.ObjectId, required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    targetRoles: [{ type: String, enum: ['branch_principal', 'teacher', 'student', 'accountant', 'it_admin', 'group_admin'] }],
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

SopSchema.plugin(tenantPlugin);
SopSchema.index({ orgId: 1, branchId: 1, targetRoles: 1, order: 1 });

export const Sop = mongoose.model<ISop>('Sop', SopSchema);
