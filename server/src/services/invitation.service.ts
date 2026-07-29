import { nanoid } from 'nanoid';
import { invitationRepository } from '../repositories/invitation.repository';
import { noteRepository } from '../repositories/note.repository';
import { userRepository } from '../repositories/user.repository';
import { assertRole } from './permission.service';
import { noteService } from './note.service';
import { sendMail, inviteEmailTemplate } from '../helpers/mailer';
import { env } from '../config/env';
import { CollaboratorRole } from '../constants/roles';
import { ApiError } from '../utils/ApiError';

const INVITATION_TTL_DAYS = 7;

export const invitationService = {
  async invite(noteId: string, inviterId: string, email: string, role: CollaboratorRole) {
    const note = await noteRepository.findById(noteId);
    if (!note) throw ApiError.notFound('Note not found');
    assertRole(note, inviterId, CollaboratorRole.OWNER);

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return noteService.addCollaborator(noteId, inviterId, email, role);
    }

    const inviter = await userRepository.findById(inviterId);
    const token = nanoid(32);
    const invitation = await invitationRepository.create({
      note: note._id,
      invitedEmail: email,
      invitedBy: inviter?._id,
      role,
      token,
      status: 'pending',
      expiresAt: new Date(Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000),
    });

    const inviteUrl = `${env.CLIENT_URL}/invitations/${token}`;
    void sendMail({
      to: email,
      subject: `${inviter?.name ?? 'Someone'} invited you to collaborate on CollabNote`,
      html: inviteEmailTemplate(inviter?.name ?? 'A CollabNote user', note.title, inviteUrl),
    });

    return invitation;
  },

  async accept(token: string, userId: string) {
    const invitation = await invitationRepository.findByToken(token);
    if (!invitation) throw ApiError.notFound('Invitation not found');
    if (invitation.status !== 'pending') throw ApiError.badRequest('This invitation is no longer valid');
    if (invitation.expiresAt < new Date()) {
      await invitationRepository.updateStatus(invitation._id.toString(), 'expired');
      throw ApiError.badRequest('This invitation has expired');
    }

    const user = await userRepository.findById(userId);
    if (!user || user.email !== invitation.invitedEmail) {
      throw ApiError.forbidden('This invitation was sent to a different email address');
    }

    const note = await noteRepository.findById(invitation.note);
    if (!note) throw ApiError.notFound('Note no longer exists');

    const alreadyCollaborator = note.collaborators.some((c) => c.user.toString() === userId);
    if (!alreadyCollaborator) {
      note.collaborators.push({ user: user._id, role: invitation.role, addedAt: new Date() });
      await note.save();
    }

    await invitationRepository.updateStatus(invitation._id.toString(), 'accepted');
    return note;
  },

  async decline(token: string) {
    const invitation = await invitationRepository.findByToken(token);
    if (!invitation) throw ApiError.notFound('Invitation not found');
    await invitationRepository.updateStatus(invitation._id.toString(), 'declined');
  },

  listForNote(noteId: string) {
    return invitationRepository.listForNote(noteId);
  },
};
