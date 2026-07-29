import { apiClient } from './apiClient';
import { ApiEnvelope, AppNotification, PaginatedResponse } from '@/types';

export const notificationService = {
  async list(page = 1) {
    const { data } = await apiClient.get<ApiEnvelope<PaginatedResponse<AppNotification> & { unreadCount: number }>>('/notifications', {
      params: { page },
    });
    return data.data;
  },

  async markAsRead(id: string) {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    await apiClient.patch('/notifications/read-all');
  },

  async remove(id: string) {
    await apiClient.delete(`/notifications/${id}`);
  },
};
