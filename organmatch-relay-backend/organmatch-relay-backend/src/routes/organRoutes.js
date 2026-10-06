import { Router } from 'express';
import { registerOrgan, listOrgans, updateOrganStatus } from '../controllers/organController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();
router.get('/', requireAuth, requireRole('DONOR_COORDINATOR', 'SYSTEM_ADMIN'), listOrgans);
router.post('/', requireAuth, requireRole('DONOR_COORDINATOR'), registerOrgan);
router.patch('/:id/status', requireAuth, requireRole('DONOR_COORDINATOR'), updateOrganStatus);
export default router;
