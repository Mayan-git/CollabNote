import { Schema, model, Document, Types } from 'mongoose';

export interface IVersion extends Document {
  _id: Types.ObjectId;
  note: Types.ObjectId;
  versionNumber: number;
  title: string;
  content: Record<string, unknown>;
  editedBy: Types.ObjectId;
  changeType: 'auto' | 'manual' | 'restore';
  createdAt: Date;
}

const versionSchema = new Schema<IVersion>(
  {
    note: { type: Schema.Types.ObjectId, ref: 'Note', required: true, index: true },
    versionNumber: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    editedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changeType: { type: String, enum: ['auto', 'manual', 'restore'], default: 'auto' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

versionSchema.index({ note: 1, versionNumber: -1 });

export const VersionModel = model<IVersion>('Version', versionSchema);
