import { Router } from 'express';
import * as folderController from '../controllers/folder.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', folderController.createFolder);
router.get('/', folderController.listFolders);
router.patch('/:id', folderController.updateFolder);
router.delete('/:id', folderController.deleteFolder);

export default router;
