import { EventEmitter } from 'events';
import { INotification } from '../models/Notification.model';

interface SocketBusEvents {
  notification: (userId: string, notification: INotification) => void;
}

class SocketBus extends EventEmitter {
  emitNotification(userId: string, notification: INotification): void {
    this.emit('notification', userId, notification);
  }

  onNotification(listener: SocketBusEvents['notification']): void {
    this.on('notification', listener);
  }
}

export const socketBus = new SocketBus();
