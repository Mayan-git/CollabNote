import { Types } from 'mongoose';
import { IUser, UserModel } from '../models/User.model';

export const userRepository = {
  create(data: Partial<IUser>) {
    return UserModel.create(data);
  },

  findById(id: string | Types.ObjectId) {
    return UserModel.findById(id);
  },

  findByIdWithPassword(id: string | Types.ObjectId) {
    return UserModel.findById(id).select('+password');
  },

  findByEmail(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() });
  },

  findByEmailWithPassword(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+password');
  },

  async existsByEmail(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  },

  updateById(id: string | Types.ObjectId, update: Partial<IUser>) {
    return UserModel.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  },

  incrementTokenVersion(id: string | Types.ObjectId) {
    return UserModel.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } }, { new: true });
  },

  deleteById(id: string | Types.ObjectId) {
    return UserModel.findByIdAndDelete(id);
  },

  search(query: string, limit = 10) {
    return UserModel.find({
      $or: [{ name: new RegExp(query, 'i') }, { email: new RegExp(query, 'i') }],
    })
      .select('name email avatarUrl')
      .limit(limit);
  },

  paginate(filter: Record<string, unknown>, skip: number, limit: number, sort: Record<string, 1 | -1>) {
    return UserModel.find(filter).sort(sort).skip(skip).limit(limit);
  },

  count(filter: Record<string, unknown>) {
    return UserModel.countDocuments(filter);
  },
};
