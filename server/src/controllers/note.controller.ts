import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { noteService } from '../services/note.service';
import { versionService } from '../services/version.service';
import { normalizePagination } from '../utils/pagination';

function uid(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.create(uid(req), req.body);
  res.status(201).json(new ApiResponse(201, { note }, 'Note created'));
});

export const listNotes = asyncHandler(async (req: Request, res: Response) => {
  const result = await noteService.list(uid(req), req.query as never);
  res.status(200).json(new ApiResponse(200, result));
});

export const getNote = asyncHandler(async (req: Request, res: Response) => {
  const { note, role } = await noteService.getById(req.params.id, uid(req));
  res.status(200).json(new ApiResponse(200, { note, role }));
});

export const getPublicNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.getPublicByShareToken(req.params.token);
  res.status(200).json(new ApiResponse(200, { note, role: note.shareLink.role }));
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.update(req.params.id, uid(req), req.body);
  res.status(200).json(new ApiResponse(200, { note }, 'Note saved'));
});

export const togglePin = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.toggle(req.params.id, uid(req), 'isPinned');
  res.status(200).json(new ApiResponse(200, { note }));
});

export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.toggle(req.params.id, uid(req), 'isFavorite');
  res.status(200).json(new ApiResponse(200, { note }));
});

export const toggleArchive = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.toggle(req.params.id, uid(req), 'isArchived');
  res.status(200).json(new ApiResponse(200, { note }));
});

export const trashNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.trash(req.params.id, uid(req));
  res.status(200).json(new ApiResponse(200, { note }, 'Note moved to trash'));
});

export const restoreNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.restore(req.params.id, uid(req));
  res.status(200).json(new ApiResponse(200, { note }, 'Note restored'));
});

export const permanentlyDeleteNote = asyncHandler(async (req: Request, res: Response) => {
  await noteService.permanentlyDelete(req.params.id, uid(req));
  res.status(200).json(new ApiResponse(200, null, 'Note permanently deleted'));
});

export const duplicateNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.duplicate(req.params.id, uid(req));
  res.status(201).json(new ApiResponse(201, { note }, 'Note duplicated'));
});

export const addCollaborator = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.addCollaborator(req.params.id, uid(req), req.body.email, req.body.role);
  res.status(200).json(new ApiResponse(200, { note }, 'Collaborator added'));
});

export const removeCollaborator = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.removeCollaborator(req.params.id, uid(req), req.params.collaboratorId);
  res.status(200).json(new ApiResponse(200, { note }, 'Collaborator removed'));
});

export const updateShareLink = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.updateShareLink(req.params.id, uid(req), req.body);
  res.status(200).json(new ApiResponse(200, { note }));
});

export const listVersions = asyncHandler(async (req: Request, res: Response) => {
  await noteService.getById(req.params.id, uid(req));
  const { skip, limit, page } = normalizePagination(req.query as never);
  const { items, totalItems } = await versionService.listForNote(req.params.id, skip, limit);
  res.status(200).json(new ApiResponse(200, { items, totalItems, page, limit }));
});

export const restoreVersion = asyncHandler(async (req: Request, res: Response) => {
  const note = await versionService.restore(req.params.id, Number(req.params.versionNumber), uid(req));
  res.status(200).json(new ApiResponse(200, { note }, 'Version restored'));
});
