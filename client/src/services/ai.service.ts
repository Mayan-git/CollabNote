import { apiClient } from './apiClient';
import { ApiEnvelope } from '@/types';

async function post<T = string>(noteId: string, action: string, body?: Record<string, unknown>): Promise<T> {
  const { data } = await apiClient.post<ApiEnvelope<{ result: T }>>(`/notes/${noteId}/ai/${action}`, body);
  return data.data.result;
}

export const aiService = {
  summarize: (noteId: string) => post<string>(noteId, 'summarize'),
  fixGrammar: (noteId: string) => post<string>(noteId, 'fix-grammar'),
  rewrite: (noteId: string, style: string) => post<string>(noteId, 'rewrite', { style }),
  translate: (noteId: string, targetLanguage: string) => post<string>(noteId, 'translate', { targetLanguage }),
  generateTitle: (noteId: string) => post<string>(noteId, 'generate-title'),
  generateTags: (noteId: string) => post<string[]>(noteId, 'generate-tags'),
  generateMeetingNotes: (noteId: string) => post<string>(noteId, 'meeting-notes'),
  extractActionItems: (noteId: string) => post<string>(noteId, 'action-items'),
};
