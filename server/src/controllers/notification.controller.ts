import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { notificationService } from '../services/notification.service';

function uid(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.list(uid(req), req.query as never);
  res.status(200).json(new ApiResponse(200, result));
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(req.params.id, uid(req));
  res.status(200).json(new ApiResponse(200, { notification }));
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(uid(req));
  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.remove(req.params.id, uid(req));
  res.status(200).json(new ApiResponse(200, null, 'Notification deleted'));
});
