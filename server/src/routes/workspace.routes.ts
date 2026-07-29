import { Router } from 'express';
import * as workspaceController from '../controllers/workspace.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.get('/', workspaceController.listWorkspaces);

export default router;
