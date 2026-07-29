import { Router } from 'express';
import * as noteController from '../controllers/note.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import {
  createNoteSchema,
  updateNoteSchema,
  listNotesQuerySchema,
  addCollaboratorSchema,
  updateShareLinkSchema,
  idParamSchema,
} from '../validators/note.validator';
import commentRouter from './comment.routes';
import attachmentRouter from './attachment.routes';
import aiRouter from './ai.routes';
import * as invitationController from '../controllers/invitation.controller';

const router = Router();

router.get('/shared/:token', optionalAuth, noteController.getPublicNote);

router.use(requireAuth);

router.post('/', validate(createNoteSchema), noteController.createNote);
router.get('/', validate(listNotesQuerySchema), noteController.listNotes);
router.get('/:id', validate(idParamSchema), noteController.getNote);
router.patch('/:id', validate(updateNoteSchema), noteController.updateNote);
router.delete('/:id', validate(idParamSchema), noteController.trashNote);
router.post('/:id/restore', validate(idParamSchema), noteController.restoreNote);
router.delete('/:id/permanent', validate(idParamSchema), noteController.permanentlyDeleteNote);
router.post('/:id/duplicate', validate(idParamSchema), noteController.duplicateNote);

router.post('/:id/pin', validate(idParamSchema), noteController.togglePin);
router.post('/:id/favorite', validate(idParamSchema), noteController.toggleFavorite);
router.post('/:id/archive', validate(idParamSchema), noteController.toggleArchive);

router.post('/:id/collaborators', validate(addCollaboratorSchema), noteController.addCollaborator);
router.delete('/:id/collaborators/:collaboratorId', noteController.removeCollaborator);
router.put('/:id/share-link', validate(updateShareLinkSchema), noteController.updateShareLink);

router.post('/:id/invitations', invitationController.inviteToNote);
router.get('/:id/invitations', invitationController.listInvitations);

router.get('/:id/versions', validate(idParamSchema), noteController.listVersions);
router.post('/:id/versions/:versionNumber/restore', noteController.restoreVersion);

router.use('/:id/comments', commentRouter);
router.use('/:id/attachments', attachmentRouter);
router.use('/:id/ai', aiRouter);

export default router;
