import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import {
  markAttendance, markAttendanceValidators,
  getAttendance, getStudentMonthlySummary, getSectionSummary, getMyAttendance,
} from '../controllers/attendanceController';

const router = Router();
router.use(authenticate);

router.get('/my-records', getMyAttendance); // student: own attendance only
router.post('/', authorize('attendance', 'mark'), markAttendanceValidators, markAttendance);
router.get('/', authorize('attendance', 'read'), getAttendance);
router.get('/student-summary', authorize('attendance', 'read'), getStudentMonthlySummary);
router.get('/section-summary', authorize('attendance', 'read'), getSectionSummary);

export default router;
