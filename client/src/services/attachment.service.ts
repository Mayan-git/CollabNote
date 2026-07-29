import { apiClient } from './apiClient';
import { ApiEnvelope } from '@/types';

export interface Attachment {
  _id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  url: string;
  createdAt: string;
}

export const attachmentService = {
  async list(noteId: string) {
    const { data } = await apiClient.get<ApiEnvelope<{ attachments: Attachment[] }>>(`/notes/${noteId}/attachments`);
    return data.data.attachments;
  },

  async upload(noteId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<ApiEnvelope<{ attachment: Attachment }>>(`/notes/${noteId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.attachment;
  },

  async remove(noteId: string, attachmentId: string) {
    await apiClient.delete(`/notes/${noteId}/attachments/${attachmentId}`);
  },
};
