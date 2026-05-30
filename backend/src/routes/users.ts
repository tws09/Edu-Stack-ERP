import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import {
  createUser,
  createUserValidators,
  listUsers,
  getUser,
  updateUser,
  resetUserPassword,
  updateFcmToken,
  removeFcmToken,
} from '../controllers/userController';

const router = Router();

router.use(authenticate);

router.post('/', authorize('user_management', 'create'), createUserValidators, createUser);
router.get('/', authorize('user_management', 'read'), listUsers);
router.get('/:id', authorize('user_management', 'read'), getUser);
router.put('/:id', authorize('user_management', 'update'), updateUser);
router.put('/:id/reset-password', authorize('user_management', 'update'), resetUserPassword);

// Mobile-only: FCM push token management (any authenticated user can manage their own token)
router.post('/me/fcm-token', updateFcmToken);
router.delete('/me/fcm-token', removeFcmToken);

export default router;
