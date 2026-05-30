import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import { asyncHandler } from '../utils/asyncHandler';
import {
  markAttendance, markAttendanceValidators,
  getAttendance, getStudentMonthlySummary, getSectionSummary, getMyAttendance,
  markStaffAttendance, markStaffAttendanceValidators,
  getStaffAttendance, getStaffMonthlySummary,
} from '../controllers/attendanceController';

const router = Router();
router.use(authenticate);

router.get('/my-records', asyncHandler(getMyAttendance));
router.post('/', authorize('attendance', 'mark'), markAttendanceValidators, asyncHandler(markAttendance));
router.get('/', authorize('attendance', 'read'), asyncHandler(getAttendance));
router.get('/student-summary', authorize('attendance', 'read'), asyncHandler(getStudentMonthlySummary));
router.get('/section-summary', authorize('attendance', 'read'), asyncHandler(getSectionSummary));

// Staff attendance (principal / IT admin)
router.post('/staff', authorize('attendance', 'mark'), markStaffAttendanceValidators, asyncHandler(markStaffAttendance));
router.get('/staff', authorize('attendance', 'read'), asyncHandler(getStaffAttendance));
router.get('/staff/summary', authorize('attendance', 'read'), asyncHandler(getStaffMonthlySummary));

export default router;
