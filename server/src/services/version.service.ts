import { Types } from 'mongoose';
import { versionRepository } from '../repositories/version.repository';
import { noteRepository } from '../repositories/note.repository';
import { ApiError } from '../utils/ApiError';
import { INote } from '../models/Note.model';
import { assertRole } from './permission.service';
import { CollaboratorRole } from '../constants/roles';

export const versionService = {
  async snapshot(note: INote, userId: string, changeType: 'auto' | 'manual' | 'restore' = 'auto') {
    const versionNumber = note.currentVersion;
    await versionRepository.create({
      note: note._id,
      versionNumber,
      title: note.title,
      content: note.content,
      editedBy: userId,
      changeType,
    });
  },

  async listForNote(noteId: string, skip: number, limit: number) {
    const [items, totalItems] = await Promise.all([
      versionRepository.listForNote(noteId, skip, limit),
      versionRepository.count(noteId),
    ]);
    return { items, totalItems };
  },

  async restore(noteId: string, versionNumber: number, userId: string) {
    const note = await noteRepository.findById(noteId);
    if (!note) throw ApiError.notFound('Note not found');
    assertRole(note, userId, CollaboratorRole.EDITOR);

    const version = await versionRepository.findByNoteAndVersion(noteId, versionNumber);
    if (!version) throw ApiError.notFound('Version not found');

    await this.snapshot(note, userId, 'restore');

    note.title = version.title;
    note.content = version.content;
    note.currentVersion += 1;
    note.lastEditedBy = new Types.ObjectId(userId);
    await note.save();

    return note;
  },
};
