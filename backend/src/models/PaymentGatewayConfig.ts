import { Schema, model, Document, Types } from 'mongoose';

export interface IPaymentGatewayConfig extends Document {
  orgId: Types.ObjectId;
  gateway: 'jazzcash' | 'easypaisa';
  isSandbox: boolean;
  isActive: boolean;
  credentials: { encrypted: string; iv: string; tag: string };
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IPaymentGatewayConfig>(
  {
    orgId:     { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    gateway:   { type: String, enum: ['jazzcash', 'easypaisa'], required: true },
    isSandbox: { type: Boolean, default: true },
    isActive:  { type: Boolean, default: true },
    credentials: {
      encrypted: { type: String, required: true },
      iv:        { type: String, required: true },
      tag:       { type: String, required: true },
    },
  },
  { timestamps: true }
);

schema.index({ orgId: 1, gateway: 1 }, { unique: true });

export const PaymentGatewayConfig = model<IPaymentGatewayConfig>('PaymentGatewayConfig', schema);
