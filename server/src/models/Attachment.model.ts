import { Schema, model, Document, Types } from 'mongoose';

export interface IAttachment extends Document {
  _id: Types.ObjectId;
  note: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  url: string;
  publicId: string;
  createdAt: Date;
}

const attachmentSchema = new Schema<IAttachment>(
  {
    note: { type: Schema.Types.ObjectId, ref: 'Note', required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const AttachmentModel = model<IAttachment>('Attachment', attachmentSchema);
