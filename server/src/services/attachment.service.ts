import { Types } from 'mongoose';
import { attachmentRepository } from '../repositories/attachment.repository';
import { noteRepository } from '../repositories/note.repository';
import { uploadService } from './upload.service';
import { assertRole } from './permission.service';
import { CollaboratorRole } from '../constants/roles';
import { ApiError } from '../utils/ApiError';

export const attachmentService = {
  async upload(noteId: string, userId: string, file: Express.Multer.File) {
    const note = await noteRepository.findById(noteId);
    if (!note) throw ApiError.notFound('Note not found');
    assertRole(note, userId, CollaboratorRole.EDITOR);

    const result = await uploadService.uploadBuffer(file.buffer, 'attachments');

    return attachmentRepository.create({
      note: note._id,
      uploadedBy: new Types.ObjectId(userId),
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSizeBytes: file.size,
      url: result.url,
      publicId: result.publicId,
    });
  },

  async list(noteId: string, userId: string) {
    const note = await noteRepository.findById(noteId);
    if (!note) throw ApiError.notFound('Note not found');
    assertRole(note, userId, CollaboratorRole.VIEWER);
    return attachmentRepository.listForNote(noteId);
  },

  async remove(attachmentId: string, noteId: string, userId: string) {
    const note = await noteRepository.findById(noteId);
    if (!note) throw ApiError.notFound('Note not found');
    assertRole(note, userId, CollaboratorRole.EDITOR);

    const attachment = await attachmentRepository.findById(attachmentId);
    if (!attachment) throw ApiError.notFound('Attachment not found');

    await uploadService.deleteByPublicId(attachment.publicId);
    await attachmentRepository.deleteById(attachmentId);
  },
};
