import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate';
import { upload } from '../middlewares/upload.middleware';
import { updateProfileSchema, deleteAccountSchema } from '../validators/auth.validator';

const router = Router();

router.use(requireAuth);

router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.post('/me/avatar', upload.single('avatar'), userController.uploadAvatar);
router.delete('/me', validate(deleteAccountSchema), userController.deleteAccount);
router.get('/search', userController.searchUsers);

export default router;
