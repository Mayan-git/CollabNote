import { Schema, model, Document, Types } from 'mongoose';
import { CollaboratorRole } from '../constants/roles';

export interface IInvitation extends Document {
  _id: Types.ObjectId;
  note: Types.ObjectId;
  invitedEmail: string;
  invitedBy: Types.ObjectId;
  role: CollaboratorRole;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    note: { type: Schema.Types.ObjectId, ref: 'Note', required: true, index: true },
    invitedEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: Object.values(CollaboratorRole), default: CollaboratorRole.VIEWER },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export const InvitationModel = model<IInvitation>('Invitation', invitationSchema);
