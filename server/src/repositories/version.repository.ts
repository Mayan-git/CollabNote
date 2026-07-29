import { Types } from 'mongoose';
import { VersionModel } from '../models/Version.model';

export const versionRepository = {
  create(data: {
    note: string | Types.ObjectId;
    versionNumber: number;
    title: string;
    content: Record<string, unknown>;
    editedBy: string | Types.ObjectId;
    changeType: 'auto' | 'manual' | 'restore';
  }) {
    return VersionModel.create(data);
  },

  listForNote(noteId: string, skip: number, limit: number) {
    return VersionModel.find({ note: noteId })
      .populate('editedBy', 'name email avatarUrl')
      .sort({ versionNumber: -1 })
      .skip(skip)
      .limit(limit);
  },

  count(noteId: string) {
    return VersionModel.countDocuments({ note: noteId });
  },

  findByNoteAndVersion(noteId: string, versionNumber: number) {
    return VersionModel.findOne({ note: noteId, versionNumber });
  },

  findLatest(noteId: string) {
    return VersionModel.findOne({ note: noteId }).sort({ versionNumber: -1 });
  },

  deleteAllForNote(noteId: string | Types.ObjectId) {
    return VersionModel.deleteMany({ note: noteId });
  },
};
