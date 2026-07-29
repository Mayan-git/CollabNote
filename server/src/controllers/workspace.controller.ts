import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { workspaceService } from '../services/workspace.service';

export const listWorkspaces = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const workspaces = await workspaceService.listForUser(req.user.id);
  res.status(200).json(new ApiResponse(200, { workspaces }));
});
