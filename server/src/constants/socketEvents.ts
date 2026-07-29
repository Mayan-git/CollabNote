export const SocketEvent = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',

  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',

  CURSOR_UPDATE: 'cursor-update',
  SELECTION_UPDATE: 'selection-update',

  NOTE_UPDATE: 'note-update',
  NOTE_PATCH: 'note-patch',
  SAVE_NOTE: 'save-note',
  NOTE_SAVED: 'note-saved',

  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  PRESENCE_SYNC: 'presence-sync',

  COMMENT_ADDED: 'comment-added',
  COMMENT_RESOLVED: 'comment-resolved',

  NOTIFICATION: 'notification',

  ERROR: 'error',
} as const;
export type SocketEvent = (typeof SocketEvent)[keyof typeof SocketEvent];
