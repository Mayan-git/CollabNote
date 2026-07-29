import { UserModel } from '../models/User.model';
import { NoteModel } from '../models/Note.model';
import { ActivityModel } from '../models/Activity.model';
import { AttachmentModel } from '../models/Attachment.model';
import { normalizePagination, buildPaginatedResult, PaginationQuery } from '../utils/pagination';
import { ApiError } from '../utils/ApiError';
import { userRepository } from '../repositories/user.repository';

export const adminService = {
  async listUsers(query: PaginationQuery & { search?: string }) {
    const { skip, limit, sort, page } = normalizePagination(query);
    const filter = query.search
      ? { $or: [{ name: new RegExp(query.search, 'i') }, { email: new RegExp(query.search, 'i') }] }
      : {};

    const [items, totalItems] = await Promise.all([
      userRepository.paginate(filter, skip, limit, sort),
      userRepository.count(filter),
    ]);
    return buildPaginatedResult(items, totalItems, page, limit);
  },

  async suspendUser(userId: string, isSuspended: boolean) {
    const user = await UserModel.findByIdAndUpdate(userId, { isSuspended }, { new: true });
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async deleteUser(userId: string) {
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) throw ApiError.notFound('User not found');
    await NoteModel.deleteMany({ owner: userId });
  },

  async listNotes(query: PaginationQuery & { search?: string }) {
    const { skip, limit, sort, page } = normalizePagination(query);
    const filter = query.search ? { title: new RegExp(query.search, 'i') } : {};

    const [items, totalItems] = await Promise.all([
      NoteModel.find(filter).populate('owner', 'name email').sort(sort).skip(skip).limit(limit),
      NoteModel.countDocuments(filter),
    ]);
    return buildPaginatedResult(items, totalItems, page, limit);
  },

  async deleteNote(noteId: string) {
    const note = await NoteModel.findByIdAndDelete(noteId);
    if (!note) throw ApiError.notFound('Note not found');
  },

  async getAnalytics() {
    const [totalUsers, totalNotes, activeToday, storageAgg] = await Promise.all([
      UserModel.countDocuments(),
      NoteModel.countDocuments({ isTrashed: false }),
      UserModel.countDocuments({ lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      AttachmentModel.aggregate([{ $group: { _id: null, total: { $sum: '$fileSizeBytes' } } }]),
    ]);

    const signupsOverTime = await UserModel.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const notesOverTime = await NoteModel.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    return {
      totalUsers,
      totalNotes,
      activeToday,
      totalStorageBytes: storageAgg[0]?.total ?? 0,
      signupsOverTime,
      notesOverTime,
    };
  },

  async listActivityLogs(query: PaginationQuery) {
    const { skip, limit, page } = normalizePagination(query);
    const [items, totalItems] = await Promise.all([
      ActivityModel.find().populate('actor', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      ActivityModel.countDocuments(),
    ]);
    return buildPaginatedResult(items, totalItems, page, limit);
  },
};
