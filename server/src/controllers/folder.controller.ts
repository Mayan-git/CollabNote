import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { folderService } from '../services/folder.service';

function uid(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const createFolder = asyncHandler(async (req: Request, res: Response) => {
  const folder = await folderService.create(uid(req), req.body);
  res.status(201).json(new ApiResponse(201, { folder }, 'Folder created'));
});

export const listFolders = asyncHandler(async (req: Request, res: Response) => {
  const folders = await folderService.list(String(req.query.workspace));
  res.status(200).json(new ApiResponse(200, { folders }));
});

export const updateFolder = asyncHandler(async (req: Request, res: Response) => {
  const folder = await folderService.update(req.params.id, uid(req), req.body);
  res.status(200).json(new ApiResponse(200, { folder }, 'Folder updated'));
});

export const deleteFolder = asyncHandler(async (req: Request, res: Response) => {
  await folderService.remove(req.params.id, uid(req));
  res.status(200).json(new ApiResponse(200, null, 'Folder deleted'));
});
