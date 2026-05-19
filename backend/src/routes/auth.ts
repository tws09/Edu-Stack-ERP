import { Router } from 'express';
import {
  login,
  loginValidators,
  logout,
  refresh,
  getMe,
  changePassword,
  changePasswordValidators,
  registerOrg,
  registerOrgValidators,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth/authenticate';

const router = Router();

router.post('/login', loginValidators, login);
router.post('/register', registerOrgValidators, registerOrg);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePasswordValidators, changePassword);

export default router;
