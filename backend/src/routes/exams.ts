import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import {
  createExam, createExamValidators, listExams, getExam, updateExam,
  enterMarks, enterMarksValidators, publishExam, getResults,
} from '../controllers/examController';

const router = Router();
router.use(authenticate);

router.get('/', authorize('exams', 'read'), listExams);
router.post('/', authorize('exams', 'create'), createExamValidators, createExam);
router.get('/results', authorize('results', 'read'), getResults);
router.get('/:id', authorize('exams', 'read'), getExam);
router.put('/:id', authorize('exams', 'update'), updateExam);
router.post('/:examId/marks', authorize('results', 'mark'), enterMarksValidators, enterMarks);
router.post('/:id/publish', authorize('exams', 'update'), publishExam);

export default router;
