import { Schema, model, Document, Types } from 'mongoose';

export const NotificationType = {
  INVITE: 'invite',
  COMMENT: 'comment',
  MENTION: 'mention',
  SHARE: 'share',
  NOTE_UPDATED: 'note_updated',
  SYSTEM: 'system',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  note?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    note: { type: Schema.Types.ObjectId, ref: 'Note' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = model<INotification>('Notification', notificationSchema);
