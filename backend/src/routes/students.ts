import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import {
  createStudent, createStudentValidators, listStudents,
  getStudent, updateStudent, getDocumentUploadUrl, addDocument, getMyProfile,
} from '../controllers/studentController';

const router = Router();
router.use(authenticate);

router.get('/me', getMyProfile); // student views own profile
router.get('/', authorize('student_admissions', 'read'), listStudents);
router.post('/', authorize('student_admissions', 'create'), createStudentValidators, createStudent);
router.get('/:id', authorize('student_admissions', 'read'), getStudent);
router.put('/:id', authorize('student_admissions', 'update'), updateStudent);
router.post('/:id/upload-url', authorize('student_admissions', 'update'), getDocumentUploadUrl);
router.post('/:id/documents', authorize('student_admissions', 'update'), addDocument);

export default router;
