import { apiClient } from './apiClient';
import { ApiEnvelope, Workspace } from '@/types';

export const workspaceService = {
  async list() {
    const { data } = await apiClient.get<ApiEnvelope<{ workspaces: Workspace[] }>>('/workspaces');
    return data.data.workspaces;
  },
};
