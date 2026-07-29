import { Types } from 'mongoose';
import { WorkspaceModel } from '../models/Workspace.model';

export const workspaceRepository = {
  create(data: { name: string; slug: string; owner: Types.ObjectId | string }) {
    return WorkspaceModel.create({ ...data, members: [{ user: data.owner, role: 'admin' }] });
  },

  findById(id: string | Types.ObjectId) {
    return WorkspaceModel.findById(id);
  },

  findForUser(userId: string | Types.ObjectId) {
    return WorkspaceModel.find({ $or: [{ owner: userId }, { 'members.user': userId }] }).sort({ createdAt: 1 });
  },

  isMember(workspaceId: string | Types.ObjectId, userId: string) {
    return WorkspaceModel.exists({
      _id: workspaceId,
      $or: [{ owner: userId }, { 'members.user': userId }],
    });
  },
};
