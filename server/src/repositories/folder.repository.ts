import { Types } from 'mongoose';
import { FolderModel, IFolder } from '../models/Folder.model';

export const folderRepository = {
  create(data: Partial<IFolder>) {
    return FolderModel.create(data);
  },

  findById(id: string | Types.ObjectId) {
    return FolderModel.findById(id);
  },

  listForWorkspace(workspaceId: string, includeTrashed = false) {
    return FolderModel.find({ workspace: workspaceId, isTrashed: includeTrashed }).sort({ name: 1 });
  },

  updateById(id: string | Types.ObjectId, update: Partial<IFolder>) {
    return FolderModel.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  },

  deleteById(id: string | Types.ObjectId) {
    return FolderModel.findByIdAndDelete(id);
  },
};
