import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { attachmentService } from '../services/attachment.service';

function uid(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const uploadAttachment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  const attachment = await attachmentService.upload(req.params.id, uid(req), req.file);
  res.status(201).json(new ApiResponse(201, { attachment }, 'File uploaded'));
});

export const listAttachments = asyncHandler(async (req: Request, res: Response) => {
  const attachments = await attachmentService.list(req.params.id, uid(req));
  res.status(200).json(new ApiResponse(200, { attachments }));
});

export const deleteAttachment = asyncHandler(async (req: Request, res: Response) => {
  await attachmentService.remove(req.params.attachmentId, req.params.id, uid(req));
  res.status(200).json(new ApiResponse(200, null, 'Attachment removed'));
});
