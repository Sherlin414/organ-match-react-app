import { Router } from 'express';
import { listWaitlist, registerPatient, updatePatientStatus } from '../controllers/patientController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();
router.get('/', requireAuth, requireRole('DOCTOR', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN'), listWaitlist);
router.post('/', requireAuth, requireRole('DOCTOR'), registerPatient);
router.patch('/:id/status', requireAuth, requireRole('DOCTOR', 'HOSPITAL_ADMIN'), updatePatientStatus);
export default router;
