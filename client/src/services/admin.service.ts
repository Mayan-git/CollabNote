import { apiClient } from './apiClient';
import { ApiEnvelope, PaginatedResponse, User, Note } from '@/types';

export interface Analytics {
  totalUsers: number;
  totalNotes: number;
  activeToday: number;
  totalStorageBytes: number;
  signupsOverTime: { _id: string; count: number }[];
  notesOverTime: { _id: string; count: number }[];
}

export interface ActivityLog {
  _id: string;
  actor: { name: string; email: string };
  action: string;
  createdAt: string;
}

export const adminService = {
  async listUsers(page = 1, search = '') {
    const { data } = await apiClient.get<ApiEnvelope<PaginatedResponse<User>>>('/admin/users', { params: { page, search } });
    return data.data;
  },

  async suspendUser(id: string, isSuspended: boolean) {
    await apiClient.patch(`/admin/users/${id}/suspend`, { isSuspended });
  },

  async deleteUser(id: string) {
    await apiClient.delete(`/admin/users/${id}`);
  },

  async listNotes(page = 1, search = '') {
    const { data } = await apiClient.get<ApiEnvelope<PaginatedResponse<Note>>>('/admin/notes', { params: { page, search } });
    return data.data;
  },

  async deleteNote(id: string) {
    await apiClient.delete(`/admin/notes/${id}`);
  },

  async getAnalytics() {
    const { data } = await apiClient.get<ApiEnvelope<{ analytics: Analytics }>>('/admin/analytics');
    return data.data.analytics;
  },

  async listLogs(page = 1) {
    const { data } = await apiClient.get<ApiEnvelope<PaginatedResponse<ActivityLog>>>('/admin/logs', { params: { page } });
    return data.data;
  },
};
