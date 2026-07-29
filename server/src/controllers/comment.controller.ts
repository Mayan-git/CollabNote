import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { commentService } from '../services/comment.service';

function uid(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.create(req.params.id, uid(req), req.body);
  res.status(201).json(new ApiResponse(201, { comment }, 'Comment added'));
});

export const listComments = asyncHandler(async (req: Request, res: Response) => {
  const comments = await commentService.list(req.params.id, uid(req));
  res.status(200).json(new ApiResponse(200, { comments }));
});

export const resolveComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.resolve(req.params.commentId, req.params.id, uid(req));
  res.status(200).json(new ApiResponse(200, { comment }, 'Comment resolved'));
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  await commentService.remove(req.params.commentId, req.params.id, uid(req));
  res.status(200).json(new ApiResponse(200, null, 'Comment deleted'));
});
