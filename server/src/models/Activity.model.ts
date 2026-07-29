import { Schema, model, Document, Types } from 'mongoose';

export const ActivityAction = {
  NOTE_CREATED: 'note_created',
  NOTE_UPDATED: 'note_updated',
  NOTE_DELETED: 'note_deleted',
  NOTE_RESTORED: 'note_restored',
  NOTE_SHARED: 'note_shared',
  NOTE_ARCHIVED: 'note_archived',
  COMMENT_ADDED: 'comment_added',
  COLLABORATOR_ADDED: 'collaborator_added',
  COLLABORATOR_REMOVED: 'collaborator_removed',
  VERSION_RESTORED: 'version_restored',
  USER_LOGIN: 'user_login',
  USER_SIGNUP: 'user_signup',
} as const;
export type ActivityAction = (typeof ActivityAction)[keyof typeof ActivityAction];

export interface IActivity extends Document {
  _id: Types.ObjectId;
  actor: Types.ObjectId;
  action: ActivityAction;
  targetNote?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: Object.values(ActivityAction), required: true },
    targetNote: { type: Schema.Types.ObjectId, ref: 'Note' },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activitySchema.index({ actor: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

export const ActivityModel = model<IActivity>('Activity', activitySchema);
