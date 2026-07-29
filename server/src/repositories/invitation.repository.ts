import { InvitationModel, IInvitation } from '../models/Invitation.model';

export const invitationRepository = {
  create(data: Partial<IInvitation>) {
    return InvitationModel.create(data);
  },

  findByToken(token: string) {
    return InvitationModel.findOne({ token });
  },

  listForNote(noteId: string) {
    return InvitationModel.find({ note: noteId, status: 'pending' }).sort({ createdAt: -1 });
  },

  updateStatus(id: string, status: IInvitation['status']) {
    return InvitationModel.findByIdAndUpdate(id, { status }, { new: true });
  },
};
