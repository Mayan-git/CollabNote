import { Types } from 'mongoose';
import { NoteModel } from '../models/Note.model';
import { folderRepository } from '../repositories/folder.repository';
import { workspaceRepository } from '../repositories/workspace.repository';
import { ApiError } from '../utils/ApiError';
import { IFolder } from '../models/Folder.model';

interface CreateFolderInput {
  name: string;
  workspace: string;
  parent?: string | null;
  color?: string;
  icon?: string;
}

export const folderService = {
  async create(userId: string, input: CreateFolderInput) {
    const isMember = await workspaceRepository.isMember(input.workspace, userId);
    if (!isMember) throw ApiError.forbidden('You do not have access to this workspace');

    return folderRepository.create({
      name: input.name,
      workspace: new Types.ObjectId(input.workspace),
      parent: input.parent ? new Types.ObjectId(input.parent) : null,
      color: input.color,
      icon: input.icon,
      owner: new Types.ObjectId(userId),
    });
  },

  list(workspaceId: string) {
    return folderRepository.listForWorkspace(workspaceId, false);
  },

  async update(folderId: string, userId: string, updates: Partial<Pick<CreateFolderInput, 'name' | 'color' | 'icon' | 'parent'>>) {
    const folder = await folderRepository.findById(folderId);
    if (!folder) throw ApiError.notFound('Folder not found');
    if (folder.owner.toString() !== userId) throw ApiError.forbidden('You do not own this folder');

    const update: Partial<IFolder> = {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.color !== undefined && { color: updates.color }),
      ...(updates.icon !== undefined && { icon: updates.icon }),
      ...(updates.parent !== undefined && { parent: updates.parent ? new Types.ObjectId(updates.parent) : null }),
    };

    return folderRepository.updateById(folderId, update);
  },

  async remove(folderId: string, userId: string) {
    const folder = await folderRepository.findById(folderId);
    if (!folder) throw ApiError.notFound('Folder not found');
    if (folder.owner.toString() !== userId) throw ApiError.forbidden('You do not own this folder');

    await NoteModel.updateMany({ folder: folderId }, { folder: null });
    await folderRepository.deleteById(folderId);
  },
};
