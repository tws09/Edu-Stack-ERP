import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import {
  createAssignment, createAssignmentValidators, listAssignments,
  getAssignment, updateAssignment,
  submitAssignment, submitAssignmentValidators,
  gradeSubmission, listSubmissions, getSubmissionUploadUrl,
} from '../controllers/assignmentController';

const router = Router();
router.use(authenticate);

router.get('/', authorize('assignments', 'read'), listAssignments);
router.post('/', authorize('assignments', 'create'), createAssignmentValidators, createAssignment);
router.get('/:id', authorize('assignments', 'read'), getAssignment);
router.put('/:id', authorize('assignments', 'update'), updateAssignment);

// Submissions
router.get('/:assignmentId/submissions', authorize('assignments', 'read'), listSubmissions);
router.post('/:assignmentId/submit', authorize('assignments', 'submit'), submitAssignmentValidators, submitAssignment);
router.post('/:assignmentId/upload-url', authorize('assignments', 'submit'), getSubmissionUploadUrl);
router.put('/:assignmentId/submissions/:submissionId/grade', authorize('assignments', 'mark'), gradeSubmission);

export default router;
