import { apiClient } from './apiClient';
import { ApiEnvelope, Note, PaginatedResponse, NoteVersion, CollaboratorRole } from '@/types';

export interface NoteListParams {
  page?: number;
  limit?: number;
  folder?: string;
  tag?: string;
  search?: string;
  filter?: 'all' | 'pinned' | 'favorites' | 'archived' | 'trash' | 'shared';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const noteService = {
  async list(params: NoteListParams) {
    const { data } = await apiClient.get<ApiEnvelope<PaginatedResponse<Note>>>('/notes', { params });
    return data.data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get<ApiEnvelope<{ note: Note; role: CollaboratorRole }>>(`/notes/${id}`);
    return data.data;
  },

  async getByShareToken(token: string) {
    const { data } = await apiClient.get<ApiEnvelope<{ note: Note; role: string }>>(`/notes/shared/${token}`);
    return data.data;
  },

  async claimShareLink(token: string) {
    const { data } = await apiClient.post<ApiEnvelope<{ note: Note }>>(`/notes/shared/${token}/claim`);
    return data.data.note;
  },

  async create(input: { title?: string; workspace: string; folder?: string | null; tags?: string[] }) {
    const { data } = await apiClient.post<ApiEnvelope<{ note: Note }>>('/notes', input);
    return data.data.note;
  },

  async update(id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'icon' | 'coverImage' | 'tags' | 'folder'>>) {
    const { data } = await apiClient.patch<ApiEnvelope<{ note: Note }>>(`/notes/${id}`, updates);
    return data.data.note;
  },

  async togglePin(id: string) {
    const { data } = await apiClient.post<ApiEnvelope<{ note: Note }>>(`/notes/${id}/pin`);
    return data.data.note;
  },

  async toggleFavorite(id: string) {
    const { data } = await apiClient.post<ApiEnvelope<{ note: Note }>>(`/notes/${id}/favorite`);
    return data.data.note;
  },

  async toggleArchive(id: string) {
    const { data } = await apiClient.post<ApiEnvelope<{ note: Note }>>(`/notes/${id}/archive`);
    return data.data.note;
  },

  async trash(id: string) {
    await apiClient.delete(`/notes/${id}`);
  },

  async restore(id: string) {
    const { data } = await apiClient.post<ApiEnvelope<{ note: Note }>>(`/notes/${id}/restore`);
    return data.data.note;
  },

  async permanentlyDelete(id: string) {
    await apiClient.delete(`/notes/${id}/permanent`);
  },

  async duplicate(id: string) {
    const { data } = await apiClient.post<ApiEnvelope<{ note: Note }>>(`/notes/${id}/duplicate`);
    return data.data.note;
  },

  async addCollaborator(id: string, email: string, role: CollaboratorRole) {
    const { data } = await apiClient.post<ApiEnvelope<{ note: Note }>>(`/notes/${id}/collaborators`, { email, role });
    return data.data.note;
  },

  async removeCollaborator(id: string, collaboratorId: string) {
    const { data } = await apiClient.delete<ApiEnvelope<{ note: Note }>>(`/notes/${id}/collaborators/${collaboratorId}`);
    return data.data.note;
  },

  async updateShareLink(id: string, input: { enabled: boolean; role?: string; expiresAt?: string | null }) {
    const { data } = await apiClient.put<ApiEnvelope<{ note: Note }>>(`/notes/${id}/share-link`, input);
    return data.data.note;
  },

  async listVersions(id: string, page = 1) {
    const { data } = await apiClient.get<ApiEnvelope<{ items: NoteVersion[]; totalItems: number }>>(`/notes/${id}/versions`, {
      params: { page },
    });
    return data.data;
  },

  async restoreVersion(id: string, versionNumber: number) {
    const { data } = await apiClient.post<ApiEnvelope<{ note: Note }>>(`/notes/${id}/versions/${versionNumber}/restore`);
    return data.data.note;
  },

  async inviteByEmail(id: string, email: string, role: CollaboratorRole) {
    await apiClient.post(`/notes/${id}/invitations`, { email, role });
  },
};
