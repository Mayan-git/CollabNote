import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';

const router = Router({ mergeParams: true });

router.post('/', commentController.createComment);
router.get('/', commentController.listComments);
router.post('/:commentId/resolve', commentController.resolveComment);
router.delete('/:commentId', commentController.deleteComment);

export default router;
