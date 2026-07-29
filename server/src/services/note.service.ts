import { nanoid } from 'nanoid';
import { Types } from 'mongoose';
import { noteRepository, NoteListFilter } from '../repositories/note.repository';
import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';
import { extractPlainText, countWords } from '../utils/richText';
import { normalizePagination, buildPaginatedResult, PaginationQuery } from '../utils/pagination';
import { getEffectiveRole, assertRole } from './permission.service';
import { versionService } from './version.service';
import { activityService } from './activity.service';
import { notificationService } from './notification.service';
import { ActivityAction } from '../models/Activity.model';
import { CollaboratorRole } from '../constants/roles';
import { INote } from '../models/Note.model';

const EMPTY_DOC = { type: 'doc', content: [{ type: 'paragraph' }] };

export const noteService = {
  async create(userId: string, input: { title?: string; workspace: string; folder?: string | null; content?: Record<string, unknown>; tags?: string[] }) {
    const content = input.content ?? EMPTY_DOC;
    const plainText = extractPlainText(content);

    const note = await noteRepository.create({
      title: input.title || 'Untitled',
      content,
      plainText,
      wordCount: countWords(plainText),
      owner: new Types.ObjectId(userId),
      workspace: new Types.ObjectId(input.workspace),
      folder: input.folder ? new Types.ObjectId(input.folder) : null,
      tags: input.tags ?? [],
      lastEditedBy: new Types.ObjectId(userId),
    });

    await activityService.log({ actor: userId, action: ActivityAction.NOTE_CREATED, targetNote: note._id });
    return note;
  },

  async getById(noteId: string, userId: string): Promise<{ note: INote; role: CollaboratorRole }> {
    const note = await noteRepository.findById(noteId);
    if (!note) throw ApiError.notFound('Note not found');

    const role = getEffectiveRole(note, userId);
    if (!role) throw ApiError.forbidden('You do not have access to this note');

    return { note, role };
  },

  async getPublicByShareToken(token: string) {
    const note = await noteRepository.findByShareTokenForDisplay(token);
    if (!note) throw ApiError.notFound('This share link is invalid or has expired');
    if (note.shareLink.expiresAt && note.shareLink.expiresAt < new Date()) {
      throw ApiError.forbidden('This share link has expired');
    }
    return note;
  },

  /**
   * Grants a logged-in visitor of a public share link real, persistent access
   * to the note (added as a collaborator with the link's role), so it shows
   * up in their dashboard and they can use the normal authenticated editor —
   * without this, "log in to edit" from the public share page was a dead end.
   */
  async claimShareLink(token: string, userId: string) {
    const note = await noteRepository.findByShareToken(token);
    if (!note) throw ApiError.notFound('This share link is invalid or has expired');
    if (note.shareLink.expiresAt && note.shareLink.expiresAt < new Date()) {
      throw ApiError.forbidden('This share link has expired');
    }

    if (note.owner.toString() === userId) return note;

    const alreadyCollaborator = note.collaborators.some((c) => c.user.toString() === userId);
    if (!alreadyCollaborator) {
      note.collaborators.push({
        user: new Types.ObjectId(userId),
        role: note.shareLink.role as CollaboratorRole,
        addedAt: new Date(),
      });
      await note.save();
      await activityService.log({ actor: userId, action: ActivityAction.COLLABORATOR_ADDED, targetNote: note._id, metadata: { via: 'share-link' } });
    }

    return note;
  },

  async list(userId: string, query: PaginationQuery & NoteListFilter) {
    const { skip, limit, sort, page } = normalizePagination(query, 'updatedAt');
    const filter = noteRepository.buildListQuery({ ...query, userId });

    const [items, totalItems] = await Promise.all([
      noteRepository.find(filter, sort, skip, limit),
      noteRepository.count(filter),
    ]);

    return buildPaginatedResult(items, totalItems, page, limit);
  },

  async update(noteId: string, userId: string, updates: Partial<INote>) {
    const { note } = await this.getById(noteId, userId);
    assertRole(note, userId, CollaboratorRole.EDITOR);

    if (updates.title !== undefined) note.title = updates.title || 'Untitled';
    if (updates.content !== undefined) {
      const plainText = extractPlainText(updates.content);
      note.content = updates.content;
      note.plainText = plainText;
      note.wordCount = countWords(plainText);
      note.currentVersion += 1;
      await versionService.snapshot(note, userId, 'auto');
    }
    if (updates.folder !== undefined) note.folder = updates.folder as INote['folder'];
    if (updates.tags !== undefined) note.tags = updates.tags;
    if (updates.icon !== undefined) note.icon = updates.icon;
    if (updates.coverImage !== undefined) note.coverImage = updates.coverImage;

    note.lastEditedBy = new Types.ObjectId(userId);
    await note.save();

    await activityService.log({ actor: userId, action: ActivityAction.NOTE_UPDATED, targetNote: note._id });
    return note;
  },

  async toggle(noteId: string, userId: string, field: 'isPinned' | 'isFavorite' | 'isArchived') {
    const { note } = await this.getById(noteId, userId);
    assertRole(note, userId, CollaboratorRole.EDITOR);
    note[field] = !note[field];
    await note.save();
    return note;
  },

  async trash(noteId: string, userId: string) {
    const { note } = await this.getById(noteId, userId);
    assertRole(note, userId, CollaboratorRole.OWNER);
    note.isTrashed = true;
    note.trashedAt = new Date();
    await note.save();
    await activityService.log({ actor: userId, action: ActivityAction.NOTE_DELETED, targetNote: note._id });
    return note;
  },

  async restore(noteId: string, userId: string) {
    const { note } = await this.getById(noteId, userId);
    assertRole(note, userId, CollaboratorRole.OWNER);
    note.isTrashed = false;
    note.trashedAt = null;
    await note.save();
    await activityService.log({ actor: userId, action: ActivityAction.NOTE_RESTORED, targetNote: note._id });
    return note;
  },

  async permanentlyDelete(noteId: string, userId: string) {
    const { note } = await this.getById(noteId, userId);
    assertRole(note, userId, CollaboratorRole.OWNER);
    await noteRepository.permanentlyDelete(noteId);
    return note;
  },

  async duplicate(noteId: string, userId: string) {
    const { note } = await this.getById(noteId, userId);
    const copy = await noteRepository.create({
      title: `${note.title} (Copy)`,
      content: note.content,
      plainText: note.plainText,
      wordCount: note.wordCount,
      owner: new Types.ObjectId(userId),
      workspace: note.workspace,
      folder: note.folder,
      tags: note.tags,
      lastEditedBy: new Types.ObjectId(userId),
    });
    return copy;
  },

  async addCollaborator(noteId: string, userId: string, email: string, role: CollaboratorRole) {
    const { note } = await this.getById(noteId, userId);
    assertRole(note, userId, CollaboratorRole.OWNER);

    const invitedUser = await userRepository.findByEmail(email);
    if (!invitedUser) throw ApiError.notFound('No user found with that email');
    if (invitedUser._id.toString() === note.owner.toString()) {
      throw ApiError.badRequest('This user already owns the note');
    }

    const existing = note.collaborators.find((c) => c.user.toString() === invitedUser._id.toString());
    if (existing) {
      existing.role = role;
    } else {
      note.collaborators.push({ user: invitedUser._id, role, addedAt: new Date() });
    }
    await note.save();

    await activityService.log({ actor: userId, action: ActivityAction.COLLABORATOR_ADDED, targetNote: note._id, metadata: { email, role } });
    await notificationService.notify({
      recipient: invitedUser._id.toString(),
      sender: userId,
      type: 'share',
      title: 'You were added to a note',
      message: `You now have ${role} access to "${note.title}"`,
      note: note._id.toString(),
    });

    return note;
  },

  async removeCollaborator(noteId: string, userId: string, collaboratorId: string) {
    const { note } = await this.getById(noteId, userId);
    assertRole(note, userId, CollaboratorRole.OWNER);

    note.collaborators = note.collaborators.filter((c) => c.user.toString() !== collaboratorId);
    await note.save();
    await activityService.log({ actor: userId, action: ActivityAction.COLLABORATOR_REMOVED, targetNote: note._id });
    return note;
  },

  async updateShareLink(noteId: string, userId: string, input: { enabled: boolean; role?: 'viewer' | 'commenter' | 'editor'; expiresAt?: string | null }) {
    const { note } = await this.getById(noteId, userId);
    assertRole(note, userId, CollaboratorRole.OWNER);

    note.shareLink.enabled = input.enabled;
    if (input.enabled && !note.shareLink.token) note.shareLink.token = nanoid(24);
    if (input.role) note.shareLink.role = input.role;
    note.shareLink.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

    await note.save();
    await activityService.log({ actor: userId, action: ActivityAction.NOTE_SHARED, targetNote: note._id });
    return note;
  },
};
