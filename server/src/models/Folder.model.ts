import { Schema, model, Document, Types } from 'mongoose';

export interface IFolder extends Document {
  _id: Types.ObjectId;
  name: string;
  color: string;
  icon: string;
  owner: Types.ObjectId;
  workspace: Types.ObjectId;
  parent: Types.ObjectId | null;
  isTrashed: boolean;
  trashedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: 'folder' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
    isTrashed: { type: Boolean, default: false },
    trashedAt: { type: Date },
  },
  { timestamps: true },
);

export const FolderModel = model<IFolder>('Folder', folderSchema);
