import { Router } from 'express';
import * as invitationController from '../controllers/invitation.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/:token/accept', invitationController.acceptInvitation);
router.post('/:token/decline', invitationController.declineInvitation);

export default router;
