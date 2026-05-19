import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import {
  listClearances,
  getClearance,
  approveClearance,
  approveClearanceValidators,
  waiveClearance,
  enterClearanceMarks,
  enterClearanceMarksValidators,
  getClearanceSummary,
} from '../controllers/clearanceController';

const router = Router();
router.use(authenticate);

router.get('/summary', authorize('academic_intelligence', 'read'), getClearanceSummary);
router.get('/', authorize('academic_intelligence', 'read'), listClearances);
router.get('/:id', authorize('academic_intelligence', 'read'), getClearance);
router.post('/:id/approve', authorize('academic_intelligence', 'approve'), approveClearanceValidators, approveClearance);
router.post('/:id/waive', authorize('academic_intelligence', 'approve'), waiveClearance);
router.post('/:id/marks', authorize('academic_intelligence', 'mark'), enterClearanceMarksValidators, enterClearanceMarks);

export default router;
