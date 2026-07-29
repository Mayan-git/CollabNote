import { Router } from 'express';
import * as attachmentController from '../controllers/attachment.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router({ mergeParams: true });

router.post('/', upload.single('file'), attachmentController.uploadAttachment);
router.get('/', attachmentController.listAttachments);
router.delete('/:attachmentId', attachmentController.deleteAttachment);

export default router;
