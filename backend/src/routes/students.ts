import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createStudent, createStudentValidators, listStudents,
  getStudent, updateStudent, getDocumentUploadUrl, addDocument, getMyProfile,
  initiateLeavingProcess, checkAndClearFinanceDues, issueTc, issueCharacterCert, getLeavingStatus,
} from '../controllers/studentController';

const router = Router();
router.use(authenticate);

router.get('/me', asyncHandler(getMyProfile));
router.get('/', authorize('student_admissions', 'read'), asyncHandler(listStudents));
router.post('/', authorize('student_admissions', 'create'), createStudentValidators, asyncHandler(createStudent));
router.get('/:id', authorize('student_admissions', 'read'), asyncHandler(getStudent));
router.put('/:id', authorize('student_admissions', 'update'), asyncHandler(updateStudent));
router.post('/:id/upload-url', authorize('student_admissions', 'update'), asyncHandler(getDocumentUploadUrl));
router.post('/:id/documents', authorize('student_admissions', 'update'), asyncHandler(addDocument));

// Student leaving flow
router.get('/:id/leaving-status', authorize('student_admissions', 'read'), asyncHandler(getLeavingStatus));
router.post('/:id/initiate-leaving', authorize('student_admissions', 'update'), asyncHandler(initiateLeavingProcess));
router.post('/:id/clear-dues', authorize('student_admissions', 'update'), asyncHandler(checkAndClearFinanceDues));
router.post('/:id/issue-tc', authorize('student_admissions', 'update'), asyncHandler(issueTc));
router.post('/:id/issue-char-cert', authorize('student_admissions', 'update'), asyncHandler(issueCharacterCert));

export default router;
