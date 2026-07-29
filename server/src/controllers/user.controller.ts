import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { userService } from '../services/user.service';

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await userService.updateProfile(req.user.id, req.body);
  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated'));
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  const user = await userService.updateAvatar(req.user.id, req.file.buffer);
  res.status(200).json(new ApiResponse(200, { user }, 'Avatar updated'));
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await userService.deleteAccount(req.user.id, req.body.password);
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.status(200).json(new ApiResponse(200, null, 'Account deleted'));
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.searchUsers(String(req.query.q ?? ''));
  res.status(200).json(new ApiResponse(200, { users }));
});
