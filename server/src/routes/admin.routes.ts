import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

router.use(requireAuth, requireRole(UserRole.ADMIN));

router.get('/users', adminController.listUsers);
router.patch('/users/:id/suspend', adminController.suspendUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/notes', adminController.listNotes);
router.delete('/notes/:id', adminController.deleteNote);

router.get('/analytics', adminController.getAnalytics);
router.get('/logs', adminController.listActivityLogs);

export default router;
