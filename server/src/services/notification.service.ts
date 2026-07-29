import { Types } from 'mongoose';
import { notificationRepository } from '../repositories/notification.repository';
import { normalizePagination, buildPaginatedResult, PaginationQuery } from '../utils/pagination';
import { NotificationType } from '../models/Notification.model';
import { socketBus } from '../socket/socketBus';
import { ApiError } from '../utils/ApiError';

interface NotifyInput {
  recipient: string;
  sender?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  note?: string;
}

export const notificationService = {
  async notify(input: NotifyInput) {
    if (input.recipient === input.sender) return null;

    const notification = await notificationRepository.create({
      recipient: new Types.ObjectId(input.recipient),
      sender: input.sender ? new Types.ObjectId(input.sender) : undefined,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      note: input.note ? new Types.ObjectId(input.note) : undefined,
    });
    socketBus.emitNotification(input.recipient, notification);
    return notification;
  },

  async list(userId: string, query: PaginationQuery) {
    const { skip, limit, page } = normalizePagination(query);
    const [items, totalItems, unreadCount] = await Promise.all([
      notificationRepository.listForUser(userId, skip, limit),
      notificationRepository.count(userId),
      notificationRepository.countUnread(userId),
    ]);
    return { ...buildPaginatedResult(items, totalItems, page, limit), unreadCount };
  },

  async markAsRead(id: string, userId: string) {
    const notification = await notificationRepository.markAsRead(id, userId);
    if (!notification) throw ApiError.notFound('Notification not found');
    return notification;
  },

  markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  },

  async remove(id: string, userId: string) {
    const notification = await notificationRepository.deleteById(id, userId);
    if (!notification) throw ApiError.notFound('Notification not found');
  },
};
