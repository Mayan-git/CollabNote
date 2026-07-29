import { Server as HttpServer } from 'http';
import { Server, DefaultEventsMap } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { env, isTest } from '../config/env';
import { logger } from '../config/logger';
import { getRedisClient } from '../config/redis';
import { authenticateSocket, AppSocket } from './authenticateSocket';
import { presenceStore } from './presence';
import { socketBus } from './socketBus';
import { SocketEvent } from '../constants/socketEvents';
import { noteRepository } from '../repositories/note.repository';
import { noteService } from '../services/note.service';

function noteRoom(noteId: string): string {
  return `note:${noteId}`;
}

function userRoom(userId: string): string {
  return `user:${userId}`;
}

type AppServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, AppSocket['data']>;

export async function initializeSocket(httpServer: HttpServer): Promise<AppServer> {
  const io: AppServer = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
    pingInterval: 20000,
    pingTimeout: 20000,
  });

  if (!isTest) {
    const pubClient = getRedisClient().duplicate();
    const subClient = getRedisClient().duplicate();
    pubClient.on('error', (err) => logger.error(`Redis pub client error: ${err.message}`));
    subClient.on('error', (err) => logger.error(`Redis sub client error: ${err.message}`));
    io.adapter(createAdapter(pubClient, subClient));
  }

  io.use(async (socket, next) => {
    try {
      await authenticateSocket(socket);
      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error('Authentication failed'));
    }
  });

  io.on(SocketEvent.CONNECTION, (socket: AppSocket) => {
    const { userId } = socket.data;
    logger.debug(`Socket connected: ${socket.id} (user ${userId})`);

    socket.join(userRoom(userId));

    socket.on(SocketEvent.JOIN_ROOM, async (noteId: string, ack?: (ok: boolean, error?: string) => void) => {
      try {
        const hasAccess = await noteRepository.hasAccess(noteId, userId);
        if (!hasAccess) {
          ack?.(false, 'You do not have access to this note');
          return;
        }

        const room = noteRoom(noteId);
        await socket.join(room);
        const user = presenceStore.join(room, socket.id, userId, socket.data.name, socket.data.avatarUrl);

        socket.to(room).emit(SocketEvent.USER_ONLINE, user);
        io.to(room).emit(SocketEvent.PRESENCE_SYNC, presenceStore.list(room));
        ack?.(true);
      } catch (err) {
        logger.error(`join-room failed: ${(err as Error).message}`);
        ack?.(false, 'Failed to join note room');
      }
    });

    socket.on(SocketEvent.LEAVE_ROOM, (noteId: string) => {
      const room = noteRoom(noteId);
      presenceStore.leave(room, socket.id);
      socket.leave(room);
      socket.to(room).emit(SocketEvent.USER_OFFLINE, { socketId: socket.id, userId });
      io.to(room).emit(SocketEvent.PRESENCE_SYNC, presenceStore.list(room));
    });

    socket.on(SocketEvent.TYPING_START, (noteId: string) => {
      const room = noteRoom(noteId);
      presenceStore.setTyping(room, socket.id, true);
      socket.to(room).emit(SocketEvent.TYPING_START, { socketId: socket.id, userId });
    });

    socket.on(SocketEvent.TYPING_STOP, (noteId: string) => {
      const room = noteRoom(noteId);
      presenceStore.setTyping(room, socket.id, false);
      socket.to(room).emit(SocketEvent.TYPING_STOP, { socketId: socket.id, userId });
    });

    socket.on(SocketEvent.CURSOR_UPDATE, (payload: { noteId: string; anchor: number; head: number }) => {
      const room = noteRoom(payload.noteId);
      presenceStore.updateCursor(room, socket.id, { anchor: payload.anchor, head: payload.head });
      socket.to(room).emit(SocketEvent.CURSOR_UPDATE, { socketId: socket.id, userId, anchor: payload.anchor, head: payload.head });
    });

    socket.on(SocketEvent.NOTE_PATCH, (payload: { noteId: string; content: unknown; title?: string; version: number }) => {
      const room = noteRoom(payload.noteId);
      socket.to(room).emit(SocketEvent.NOTE_PATCH, { ...payload, socketId: socket.id, userId });
    });

    socket.on(SocketEvent.SAVE_NOTE, async (payload: { noteId: string; content: Record<string, unknown>; title?: string }, ack?: (result: { success: boolean; version?: number; error?: string }) => void) => {
      try {
        const note = await noteService.update(payload.noteId, userId, { content: payload.content, title: payload.title });
        io.to(noteRoom(payload.noteId)).emit(SocketEvent.NOTE_SAVED, {
          noteId: payload.noteId,
          version: note.currentVersion,
          savedBy: userId,
          savedAt: new Date().toISOString(),
        });
        ack?.({ success: true, version: note.currentVersion });
      } catch (err) {
        logger.error(`save-note failed: ${(err as Error).message}`);
        ack?.({ success: false, error: 'Failed to save note' });
      }
    });

    socket.on(SocketEvent.DISCONNECT, () => {
      const affectedRooms = presenceStore.leaveAllRooms(socket.id);
      for (const room of affectedRooms) {
        socket.to(room).emit(SocketEvent.USER_OFFLINE, { socketId: socket.id, userId });
        io.to(room).emit(SocketEvent.PRESENCE_SYNC, presenceStore.list(room));
      }
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  socketBus.onNotification((recipientUserId, notification) => {
    io.to(userRoom(recipientUserId)).emit(SocketEvent.NOTIFICATION, notification);
  });

  socketBus.on('comment-added', (noteId: string, comment: unknown) => {
    io.to(noteRoom(noteId)).emit(SocketEvent.COMMENT_ADDED, comment);
  });

  socketBus.on('comment-resolved', (noteId: string, comment: unknown) => {
    io.to(noteRoom(noteId)).emit(SocketEvent.COMMENT_RESOLVED, comment);
  });

  return io;
}
