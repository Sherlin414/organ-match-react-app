import { Router } from 'express';
import { listPendingMatches, confirmMatch, rejectMatch } from '../controllers/matchController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();
router.get('/pending', requireAuth, requireRole('HOSPITAL_ADMIN'), listPendingMatches);
router.post('/:id/confirm', requireAuth, requireRole('HOSPITAL_ADMIN'), confirmMatch);
router.post('/:id/reject', requireAuth, requireRole('HOSPITAL_ADMIN'), rejectMatch);
export default router;
