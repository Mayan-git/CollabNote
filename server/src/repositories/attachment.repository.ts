import { Types } from 'mongoose';
import { AttachmentModel, IAttachment } from '../models/Attachment.model';

export const attachmentRepository = {
  create(data: Partial<IAttachment>) {
    return AttachmentModel.create(data);
  },

  findById(id: string | Types.ObjectId) {
    return AttachmentModel.findById(id);
  },

  listForNote(noteId: string) {
    return AttachmentModel.find({ note: noteId }).sort({ createdAt: -1 });
  },

  deleteById(id: string | Types.ObjectId) {
    return AttachmentModel.findByIdAndDelete(id);
  },

  sumSizeForWorkspace(noteIds: Types.ObjectId[]) {
    return AttachmentModel.aggregate([
      { $match: { note: { $in: noteIds } } },
      { $group: { _id: null, total: { $sum: '$fileSizeBytes' } } },
    ]);
  },
};
