import { Router } from 'express';
import { myNotifications, markRead } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/mine', requireAuth, myNotifications);
router.patch('/:id/read', requireAuth, markRead);
export default router;
