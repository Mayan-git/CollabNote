import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { adminService } from '../services/admin.service';

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.listUsers(req.query as never);
  res.status(200).json(new ApiResponse(200, result));
});

export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.suspendUser(req.params.id, req.body.isSuspended);
  res.status(200).json(new ApiResponse(200, { user }, 'User updated'));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteUser(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'User deleted'));
});

export const listNotes = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.listNotes(req.query as never);
  res.status(200).json(new ApiResponse(200, result));
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteNote(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Note deleted'));
});

export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const analytics = await adminService.getAnalytics();
  res.status(200).json(new ApiResponse(200, { analytics }));
});

export const listActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.listActivityLogs(req.query as never);
  res.status(200).json(new ApiResponse(200, result));
});
