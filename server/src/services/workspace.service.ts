import { nanoid } from 'nanoid';
import { Types } from 'mongoose';
import { workspaceRepository } from '../repositories/workspace.repository';

export const workspaceService = {
  async createDefaultWorkspace(userId: Types.ObjectId | string, userName: string) {
    const slug = `${userName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}-${nanoid(6)}`;
    return workspaceRepository.create({ name: 'My Workspace', slug, owner: userId });
  },

  listForUser(userId: string) {
    return workspaceRepository.findForUser(userId);
  },
};
