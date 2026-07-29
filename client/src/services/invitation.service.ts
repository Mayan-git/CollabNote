import { apiClient } from './apiClient';
import { ApiEnvelope, Note } from '@/types';

export const invitationService = {
  async accept(token: string) {
    const { data } = await apiClient.post<ApiEnvelope<{ note: Note }>>(`/invitations/${token}/accept`);
    return data.data.note;
  },

  async decline(token: string) {
    await apiClient.post(`/invitations/${token}/decline`);
  },
};
