import { Router } from 'express';
import { listAuditLog, networkStats } from '../controllers/statsController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();
router.get('/audit-log', requireAuth, requireRole('SYSTEM_ADMIN'), listAuditLog);
router.get('/network', requireAuth, requireRole('SYSTEM_ADMIN'), networkStats);
export default router;
