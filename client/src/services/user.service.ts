import { apiClient } from './apiClient';
import { ApiEnvelope, User } from '@/types';

export const userService = {
  async updateProfile(updates: { name?: string; preferences?: Partial<User['preferences']> }) {
    const { data } = await apiClient.patch<ApiEnvelope<{ user: User }>>('/users/me', updates);
    return data.data.user;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await apiClient.post<ApiEnvelope<{ user: User }>>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.user;
  },

  async deleteAccount(password: string) {
    await apiClient.delete('/users/me', { data: { password } });
  },

  async search(query: string) {
    const { data } = await apiClient.get<ApiEnvelope<{ users: User[] }>>('/users/search', { params: { q: query } });
    return data.data.users;
  },
};
