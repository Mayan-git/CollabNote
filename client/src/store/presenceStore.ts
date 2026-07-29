import { create } from 'zustand';

export interface PresenceUser {
  socketId: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  color: string;
  cursor?: { anchor: number; head: number } | null;
  isTyping: boolean;
}

interface PresenceState {
  collaborators: PresenceUser[];
  setCollaborators: (users: PresenceUser[]) => void;
  reset: () => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  collaborators: [],
  setCollaborators: (collaborators) => set({ collaborators }),
  reset: () => set({ collaborators: [] }),
}));
