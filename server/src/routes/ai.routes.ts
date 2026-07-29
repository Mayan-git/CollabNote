import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { aiRateLimiter } from '../middlewares/rateLimiter';

const router = Router({ mergeParams: true });

router.use(aiRateLimiter);

router.post('/summarize', aiController.summarize);
router.post('/fix-grammar', aiController.fixGrammar);
router.post('/rewrite', aiController.rewrite);
router.post('/translate', aiController.translate);
router.post('/generate-title', aiController.generateTitle);
router.post('/generate-tags', aiController.generateTags);
router.post('/meeting-notes', aiController.generateMeetingNotes);
router.post('/action-items', aiController.extractActionItems);

export default router;
