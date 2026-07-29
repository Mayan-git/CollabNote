import { Types } from 'mongoose';
import { commentRepository } from '../repositories/comment.repository';
import { noteRepository } from '../repositories/note.repository';
import { assertRole } from './permission.service';
import { notificationService } from './notification.service';
import { activityService } from './activity.service';
import { CollaboratorRole } from '../constants/roles';
import { ActivityAction } from '../models/Activity.model';
import { ApiError } from '../utils/ApiError';
import { socketBus } from '../socket/socketBus';

interface CreateCommentInput {
  content: string;
  anchor?: { from: number; to: number } | null;
  parentComment?: string | null;
  mentions?: string[];
}

export const commentService = {
  async create(noteId: string, userId: string, input: CreateCommentInput) {
    const note = await noteRepository.findById(noteId);
    if (!note) throw ApiError.notFound('Note not found');
    assertRole(note, userId, CollaboratorRole.COMMENTER);

    const comment = await commentRepository.create({
      note: note._id,
      author: new Types.ObjectId(userId),
      content: input.content,
      anchor: input.anchor ?? null,
      parentComment: input.parentComment ? new Types.ObjectId(input.parentComment) : null,
      mentions: (input.mentions ?? []).map((id) => new Types.ObjectId(id)),
    });

    const populated = await comment.populate('author', 'name email avatarUrl');

    await activityService.log({ actor: userId, action: ActivityAction.COMMENT_ADDED, targetNote: note._id });

    for (const mentionedUserId of input.mentions ?? []) {
      await notificationService.notify({
        recipient: mentionedUserId,
        sender: userId,
        type: 'mention',
        title: 'You were mentioned in a comment',
        message: `You were mentioned in a comment on "${note.title}"`,
        note: note._id.toString(),
      });
    }

    socketBus.emit('comment-added', noteId, populated);
    return populated;
  },

  async list(noteId: string, userId: string) {
    const note = await noteRepository.findById(noteId);
    if (!note) throw ApiError.notFound('Note not found');
    assertRole(note, userId, CollaboratorRole.VIEWER);
    return commentRepository.listForNote(noteId);
  },

  async resolve(commentId: string, noteId: string, userId: string) {
    const note = await noteRepository.findById(noteId);
    if (!note) throw ApiError.notFound('Note not found');
    assertRole(note, userId, CollaboratorRole.COMMENTER);

    const comment = await commentRepository.findById(commentId);
    if (!comment) throw ApiError.notFound('Comment not found');

    comment.isResolved = true;
    comment.resolvedBy = new Types.ObjectId(userId);
    comment.resolvedAt = new Date();
    await comment.save();

    socketBus.emit('comment-resolved', noteId, comment);
    return comment;
  },

  async remove(commentId: string, noteId: string, userId: string) {
    const note = await noteRepository.findById(noteId);
    if (!note) throw ApiError.notFound('Note not found');

    const comment = await commentRepository.findById(commentId);
    if (!comment) throw ApiError.notFound('Comment not found');

    const isAuthor = comment.author.toString() === userId;
    if (!isAuthor) assertRole(note, userId, CollaboratorRole.OWNER);

    await commentRepository.deleteById(commentId);
  },
};
