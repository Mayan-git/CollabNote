import { useCallback, useEffect, useRef } from 'react';
import { getSocket } from '@/services/socketClient';
import { usePresenceStore, PresenceUser } from '@/store/presenceStore';

interface RemotePatch {
  noteId: string;
  content: unknown;
  title?: string;
  version: number;
  socketId: string;
  userId: string;
}

interface NoteSaved {
  noteId: string;
  version: number;
  savedBy: string;
  savedAt: string;
}

interface UseNoteCollaborationOptions {
  noteId: string;
  enabled: boolean;
  onRemotePatch?: (patch: RemotePatch) => void;
  onNoteSaved?: (payload: NoteSaved) => void;
}

export function useNoteCollaboration({ noteId, enabled, onRemotePatch, onNoteSaved }: UseNoteCollaborationOptions) {
  const setCollaborators = usePresenceStore((state) => state.setCollaborators);
  const reset = usePresenceStore((state) => state.reset);
  const socketIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !noteId) return undefined;

    const socket = getSocket();
    socketIdRef.current = socket.id ?? null;

    socket.emit('join-room', noteId);

    const handlePresence = (users: PresenceUser[]) => setCollaborators(users);
    const handlePatch = (patch: RemotePatch) => onRemotePatch?.(patch);
    const handleSaved = (payload: NoteSaved) => onNoteSaved?.(payload);

    socket.on('presence-sync', handlePresence);
    socket.on('note-patch', handlePatch);
    socket.on('note-saved', handleSaved);

    return () => {
      socket.emit('leave-room', noteId);
      socket.off('presence-sync', handlePresence);
      socket.off('note-patch', handlePatch);
      socket.off('note-saved', handleSaved);
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, enabled]);

  const emitPatch = useCallback(
    (content: unknown, title: string | undefined, version: number) => {
      getSocket().emit('note-patch', { noteId, content, title, version });
    },
    [noteId],
  );

  const emitCursor = useCallback(
    (anchor: number, head: number) => {
      getSocket().emit('cursor-update', { noteId, anchor, head });
    },
    [noteId],
  );

  const emitTypingStart = useCallback(() => getSocket().emit('typing-start', noteId), [noteId]);
  const emitTypingStop = useCallback(() => getSocket().emit('typing-stop', noteId), [noteId]);

  const emitSave = useCallback(
    (content: unknown, title: string | undefined) =>
      new Promise<{ success: boolean; version?: number }>((resolve) => {
        getSocket().emit('save-note', { noteId, content, title }, resolve);
      }),
    [noteId],
  );

  return { emitPatch, emitCursor, emitTypingStart, emitTypingStop, emitSave };
}
