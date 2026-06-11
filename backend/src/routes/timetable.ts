import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import { createTimetable, createTimetableValidators, getTimetable, getMyTimetable, updateTimetable } from '../controllers/timetableController';

const router = Router();
router.use(authenticate);

router.get('/my', authorize('timetable', 'read'), getMyTimetable);
router.get('/', authorize('timetable', 'read'), getTimetable);
router.post('/', authorize('timetable', 'create'), createTimetableValidators, createTimetable);
router.put('/:id', authorize('timetable', 'update'), updateTimetable);

export default router;
