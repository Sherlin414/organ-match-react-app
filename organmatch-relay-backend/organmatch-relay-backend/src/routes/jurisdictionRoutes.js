import { Router } from 'express';
import { myCorridorAlerts, clearSignals, flagCongestion } from '../controllers/jurisdictionController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();
router.get('/alerts/mine', requireAuth, requireRole('POLICE'), myCorridorAlerts);
router.post('/alerts/:id/clear', requireAuth, requireRole('POLICE'), clearSignals);
router.post('/alerts/:id/flag-congestion', requireAuth, requireRole('POLICE'), flagCongestion);
export default router;
