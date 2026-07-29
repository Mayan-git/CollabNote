import { Types } from 'mongoose';
import { CommentModel, IComment } from '../models/Comment.model';

export const commentRepository = {
  create(data: Partial<IComment>) {
    return CommentModel.create(data);
  },

  findById(id: string | Types.ObjectId) {
    return CommentModel.findById(id);
  },

  listForNote(noteId: string) {
    return CommentModel.find({ note: noteId })
      .populate('author', 'name email avatarUrl')
      .populate('mentions', 'name email')
      .sort({ createdAt: 1 });
  },

  deleteById(id: string | Types.ObjectId) {
    return CommentModel.findByIdAndDelete(id);
  },

  deleteAllForNote(noteId: string | Types.ObjectId) {
    return CommentModel.deleteMany({ note: noteId });
  },
};
