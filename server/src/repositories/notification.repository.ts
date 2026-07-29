import { Types } from 'mongoose';
import { NotificationModel, INotification } from '../models/Notification.model';

export const notificationRepository = {
  create(data: Partial<INotification>) {
    return NotificationModel.create(data);
  },

  listForUser(userId: string, skip: number, limit: number) {
    return NotificationModel.find({ recipient: userId })
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  countUnread(userId: string) {
    return NotificationModel.countDocuments({ recipient: userId, isRead: false });
  },

  count(userId: string) {
    return NotificationModel.countDocuments({ recipient: userId });
  },

  markAsRead(id: string, userId: string) {
    return NotificationModel.findOneAndUpdate({ _id: id, recipient: userId }, { isRead: true }, { new: true });
  },

  markAllAsRead(userId: string) {
    return NotificationModel.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  },

  deleteById(id: string | Types.ObjectId, userId: string) {
    return NotificationModel.findOneAndDelete({ _id: id, recipient: userId });
  },
};
