import { apiClient } from './apiClient';
import { ApiEnvelope, Folder } from '@/types';

export const folderService = {
  async list(workspaceId: string) {
    const { data } = await apiClient.get<ApiEnvelope<{ folders: Folder[] }>>('/folders', { params: { workspace: workspaceId } });
    return data.data.folders;
  },

  async create(input: { name: string; workspace: string; parent?: string | null; color?: string; icon?: string }) {
    const { data } = await apiClient.post<ApiEnvelope<{ folder: Folder }>>('/folders', input);
    return data.data.folder;
  },

  async update(id: string, updates: Partial<Pick<Folder, 'name' | 'color' | 'icon'>>) {
    const { data } = await apiClient.patch<ApiEnvelope<{ folder: Folder }>>(`/folders/${id}`, updates);
    return data.data.folder;
  },

  async remove(id: string) {
    await apiClient.delete(`/folders/${id}`);
  },
};
