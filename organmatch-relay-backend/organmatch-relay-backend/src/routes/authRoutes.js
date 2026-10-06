import { Router } from 'express';
import { register, login, me, updateProfile, googleLogin } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, updateProfile);
export default router;
