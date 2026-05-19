import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
  planPricing: { starter: number; growth: number; scale: number };
  trialDays: number;
  supportEmail: string;
  maintenanceMode: boolean;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    planPricing: {
      starter: { type: Number, default: 50 },
      growth: { type: Number, default: 40 },
      scale: { type: Number, default: 30 },
    },
    trialDays: { type: Number, default: 30 },
    supportEmail: { type: String, default: 'support@edustack.pk' },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PlatformSettings = mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);
