import { Router } from 'express';
import { myActiveRoute, confirmDelivery, updateLocation } from '../controllers/routeController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();
router.get('/mine', requireAuth, myActiveRoute);
router.post('/:id/confirm-delivery', requireAuth, requireRole('AMBULANCE', 'HOSPITAL_ADMIN'), confirmDelivery);
router.post('/:id/location', requireAuth, requireRole('AMBULANCE'), updateLocation);

export default router;
