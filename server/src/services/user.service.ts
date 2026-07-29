import { userRepository } from '../repositories/user.repository';
import { uploadService } from './upload.service';
import { ApiError } from '../utils/ApiError';
import { IUser } from '../models/User.model';

export const userService = {
  async updateProfile(userId: string, updates: Partial<Pick<IUser, 'name' | 'preferences'>>) {
    const user = await userRepository.updateById(userId, updates);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async updateAvatar(userId: string, fileBuffer: Buffer) {
    const result = await uploadService.uploadBuffer(fileBuffer, 'avatars');
    const user = await userRepository.updateById(userId, { avatarUrl: result.url });
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async deleteAccount(userId: string, password: string) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw ApiError.notFound('User not found');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw ApiError.badRequest('Password is incorrect');

    await userRepository.deleteById(userId);
  },

  async searchUsers(query: string) {
    if (!query || query.trim().length < 2) return [];
    return userRepository.search(query.trim());
  },
};
