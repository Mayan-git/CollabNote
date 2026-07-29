import { Schema, model, Document, Types } from 'mongoose';
import { CollaboratorRole } from '../constants/roles';

export interface INoteCollaborator {
  user: Types.ObjectId;
  role: CollaboratorRole;
  addedAt: Date;
}

export interface IShareLink {
  enabled: boolean;
  token: string;
  role: 'viewer' | 'commenter' | 'editor';
  expiresAt: Date | null;
}

export interface INote extends Document {
  _id: Types.ObjectId;
  title: string;
  content: Record<string, unknown>;
  plainText: string;
  coverImage?: string;
  icon?: string;
  owner: Types.ObjectId;
  workspace: Types.ObjectId;
  folder: Types.ObjectId | null;
  tags: string[];
  collaborators: INoteCollaborator[];
  shareLink: IShareLink;
  isPublic: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  trashedAt?: Date | null;
  lastEditedBy?: Types.ObjectId;
  currentVersion: number;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: { type: String, required: true, trim: true, default: 'Untitled', maxlength: 300 },
    content: { type: Schema.Types.Mixed, default: { type: 'doc', content: [] } },
    plainText: { type: String, default: '', select: false },
    coverImage: { type: String, default: '' },
    icon: { type: String, default: '📝' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    folder: { type: Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
    collaborators: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: Object.values(CollaboratorRole), default: CollaboratorRole.VIEWER },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    shareLink: {
      enabled: { type: Boolean, default: false },
      token: { type: String, default: '' },
      role: { type: String, enum: ['viewer', 'commenter', 'editor'], default: 'viewer' },
      expiresAt: { type: Date, default: null },
    },
    isPublic: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    trashedAt: { type: Date, default: null },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    currentVersion: { type: Number, default: 1 },
    wordCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

noteSchema.index({ title: 'text', plainText: 'text', tags: 'text' });
noteSchema.index({ owner: 1, isTrashed: 1, isArchived: 1, updatedAt: -1 });
noteSchema.index({ 'collaborators.user': 1 });
noteSchema.index({ 'shareLink.token': 1 }, { sparse: true });

export const NoteModel = model<INote>('Note', noteSchema);
