import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import {
  listPayroll, createPayroll, updatePayroll, approvePayroll, markPaid, bulkProcessPayroll,
} from '../controllers/payrollController';

const router = Router();
router.use(authenticate);

router.get('/', authorize('payroll', 'read'), listPayroll);
router.post('/', authorize('payroll', 'create'), createPayroll);
router.post('/bulk', authorize('payroll', 'create'), bulkProcessPayroll);
router.put('/:id', authorize('payroll', 'update'), updatePayroll);
router.post('/:id/approve', authorize('payroll', 'approve'), approvePayroll);
router.post('/:id/pay', authorize('payroll', 'approve'), markPaid);

export default router;
