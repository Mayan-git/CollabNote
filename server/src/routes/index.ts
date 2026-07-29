import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import noteRoutes from './note.routes';
import folderRoutes from './folder.routes';
import workspaceRoutes from './workspace.routes';
import notificationRoutes from './notification.routes';
import invitationRoutes from './invitation.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/notes', noteRoutes);
router.use('/folders', folderRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/invitations', invitationRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
