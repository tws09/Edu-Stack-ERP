import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import { listSops, createSop, updateSop, deleteSop, sopValidators } from '../controllers/sopController';

const router = Router();
router.use(authenticate);

router.get('/', authorize('sop', 'read'), listSops);
router.post('/', authorize('sop', 'create'), sopValidators, createSop);
router.put('/:id', authorize('sop', 'update'), updateSop);
router.delete('/:id', authorize('sop', 'delete'), deleteSop);

export default router;
