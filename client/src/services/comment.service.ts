import { apiClient } from './apiClient';
import { ApiEnvelope, Comment } from '@/types';

export const commentService = {
  async list(noteId: string) {
    const { data } = await apiClient.get<ApiEnvelope<{ comments: Comment[] }>>(`/notes/${noteId}/comments`);
    return data.data.comments;
  },

  async create(noteId: string, input: { content: string; anchor?: { from: number; to: number } | null; parentComment?: string | null; mentions?: string[] }) {
    const { data } = await apiClient.post<ApiEnvelope<{ comment: Comment }>>(`/notes/${noteId}/comments`, input);
    return data.data.comment;
  },

  async resolve(noteId: string, commentId: string) {
    const { data } = await apiClient.post<ApiEnvelope<{ comment: Comment }>>(`/notes/${noteId}/comments/${commentId}/resolve`);
    return data.data.comment;
  },

  async remove(noteId: string, commentId: string) {
    await apiClient.delete(`/notes/${noteId}/comments/${commentId}`);
  },
};
