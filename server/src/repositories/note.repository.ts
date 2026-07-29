import { FilterQuery, Types } from 'mongoose';
import { INote, NoteModel } from '../models/Note.model';

export interface NoteListFilter {
  userId: string;
  workspace?: string;
  folder?: string;
  tag?: string;
  search?: string;
  filter?: 'all' | 'pinned' | 'favorites' | 'archived' | 'trash' | 'shared';
}

function accessibleBy(userId: string): FilterQuery<INote> {
  return { $or: [{ owner: userId }, { 'collaborators.user': userId }] };
}

export const noteRepository = {
  create(data: Partial<INote>) {
    return NoteModel.create(data);
  },

  findById(id: string | Types.ObjectId) {
    return NoteModel.findById(id);
  },

  findByIdWithPlainText(id: string | Types.ObjectId) {
    return NoteModel.findById(id).select('+plainText');
  },

  buildListQuery(input: NoteListFilter): FilterQuery<INote> {
    const base: FilterQuery<INote> = accessibleBy(input.userId);
    const conditions: FilterQuery<INote>[] = [base];

    if (input.workspace) conditions.push({ workspace: input.workspace });
    if (input.folder) conditions.push({ folder: input.folder });
    if (input.tag) conditions.push({ tags: input.tag });
    if (input.search) conditions.push({ $text: { $search: input.search } });

    switch (input.filter) {
      case 'pinned':
        conditions.push({ isPinned: true, isTrashed: false, isArchived: false });
        break;
      case 'favorites':
        conditions.push({ isFavorite: true, isTrashed: false });
        break;
      case 'archived':
        conditions.push({ isArchived: true, isTrashed: false });
        break;
      case 'trash':
        conditions.push({ isTrashed: true });
        break;
      case 'shared':
        conditions.push({ 'collaborators.user': input.userId, isTrashed: false });
        break;
      default:
        conditions.push({ isTrashed: false, isArchived: false });
    }

    return conditions.length === 1 ? conditions[0] : { $and: conditions };
  },

  find(filter: FilterQuery<INote>, sort: Record<string, 1 | -1>, skip: number, limit: number) {
    return NoteModel.find(filter)
      .populate('owner', 'name email avatarUrl')
      .populate('collaborators.user', 'name email avatarUrl')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  },

  count(filter: FilterQuery<INote>) {
    return NoteModel.countDocuments(filter);
  },

  updateById(id: string | Types.ObjectId, update: Partial<INote> | Record<string, unknown>) {
    return NoteModel.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  },

  hasAccess(noteId: string, userId: string) {
    return NoteModel.exists({ _id: noteId, ...accessibleBy(userId) });
  },

  findByShareToken(token: string) {
    return NoteModel.findOne({ 'shareLink.token': token, 'shareLink.enabled': true });
  },

  permanentlyDelete(id: string | Types.ObjectId) {
    return NoteModel.findByIdAndDelete(id);
  },

  findTrashedOlderThan(date: Date) {
    return NoteModel.find({ isTrashed: true, trashedAt: { $lte: date } });
  },
};
