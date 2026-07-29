import { INote } from '../models/Note.model';
import { CollaboratorRole, hasAtLeastRole } from '../constants/roles';
import { ApiError } from '../utils/ApiError';

export function getEffectiveRole(note: INote, userId: string): CollaboratorRole | null {
  if (note.owner.toString() === userId) return CollaboratorRole.OWNER;

  const collaborator = note.collaborators.find((c) => c.user.toString() === userId);
  return collaborator?.role ?? null;
}

export function assertRole(note: INote, userId: string, required: CollaboratorRole): CollaboratorRole {
  const role = getEffectiveRole(note, userId);
  if (!role) throw ApiError.forbidden('You do not have access to this note');
  if (!hasAtLeastRole(role, required)) throw ApiError.forbidden('Insufficient permissions for this action');
  return role;
}
