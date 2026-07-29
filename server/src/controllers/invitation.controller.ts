import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { invitationService } from '../services/invitation.service';

function uid(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const inviteToNote = asyncHandler(async (req: Request, res: Response) => {
  const result = await invitationService.invite(req.params.id, uid(req), req.body.email, req.body.role);
  res.status(200).json(new ApiResponse(200, { result }, 'Invitation sent'));
});

export const listInvitations = asyncHandler(async (req: Request, res: Response) => {
  const invitations = await invitationService.listForNote(req.params.id);
  res.status(200).json(new ApiResponse(200, { invitations }));
});

export const acceptInvitation = asyncHandler(async (req: Request, res: Response) => {
  const note = await invitationService.accept(req.params.token, uid(req));
  res.status(200).json(new ApiResponse(200, { note }, 'Invitation accepted'));
});

export const declineInvitation = asyncHandler(async (req: Request, res: Response) => {
  await invitationService.decline(req.params.token);
  res.status(200).json(new ApiResponse(200, null, 'Invitation declined'));
});
