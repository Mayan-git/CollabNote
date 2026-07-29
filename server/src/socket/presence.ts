export interface PresenceUser {
  socketId: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  color: string;
  cursor?: { anchor: number; head: number } | null;
  isTyping: boolean;
}

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#eab308', '#ef4444'];

function colorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

class PresenceStore {
  private rooms = new Map<string, Map<string, PresenceUser>>();

  join(roomId: string, socketId: string, userId: string, name: string, avatarUrl?: string): PresenceUser {
    if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Map());
    const user: PresenceUser = {
      socketId,
      userId,
      name,
      avatarUrl,
      color: colorForUser(userId),
      cursor: null,
      isTyping: false,
    };
    this.rooms.get(roomId)!.set(socketId, user);
    return user;
  }

  leave(roomId: string, socketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.delete(socketId);
    if (room.size === 0) this.rooms.delete(roomId);
  }

  leaveAllRooms(socketId: string): string[] {
    const affectedRooms: string[] = [];
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.has(socketId)) {
        room.delete(socketId);
        affectedRooms.push(roomId);
        if (room.size === 0) this.rooms.delete(roomId);
      }
    }
    return affectedRooms;
  }

  updateCursor(roomId: string, socketId: string, cursor: { anchor: number; head: number }): void {
    const user = this.rooms.get(roomId)?.get(socketId);
    if (user) user.cursor = cursor;
  }

  setTyping(roomId: string, socketId: string, isTyping: boolean): void {
    const user = this.rooms.get(roomId)?.get(socketId);
    if (user) user.isTyping = isTyping;
  }

  list(roomId: string): PresenceUser[] {
    return Array.from(this.rooms.get(roomId)?.values() ?? []);
  }
}

export const presenceStore = new PresenceStore();
