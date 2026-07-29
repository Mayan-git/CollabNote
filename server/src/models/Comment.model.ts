import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  note: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  anchor?: { from: number; to: number } | null;
  parentComment: Types.ObjectId | null;
  mentions: Types.ObjectId[];
  isResolved: boolean;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    note: { type: Schema.Types.ObjectId, ref: 'Note', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    anchor: {
      from: { type: Number },
      to: { type: Number },
    },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

export const CommentModel = model<IComment>('Comment', commentSchema);
