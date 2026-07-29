import { Schema, model, Document, Types } from 'mongoose';

export interface IWorkspace extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  owner: Types.ObjectId;
  members: { user: Types.ObjectId; role: 'admin' | 'member' }[];
  storageUsedBytes: number;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['admin', 'member'], default: 'member' },
      },
    ],
    storageUsedBytes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

workspaceSchema.index({ owner: 1, name: 1 });

export const WorkspaceModel = model<IWorkspace>('Workspace', workspaceSchema);
