import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import {
  createAcademicYear, createYearValidators, listAcademicYears, updateAcademicYear,
  createClass, createClassValidators, listClasses, updateClass, deleteClass,
  createSection, createSectionValidators, listSections, updateSection, deleteSection,
  createSubject, createSubjectValidators, listSubjects, updateSubject, deleteSubject,
} from '../controllers/academicController';

const router = Router();
router.use(authenticate);

// Academic years
router.get('/years', authorize('system_settings', 'read'), listAcademicYears);
router.post('/years', authorize('system_settings', 'update'), createYearValidators, createAcademicYear);
router.put('/years/:id', authorize('system_settings', 'update'), updateAcademicYear);

// Classes
router.get('/classes', authorize('student_admissions', 'read'), listClasses);
router.post('/classes', authorize('system_settings', 'update'), createClassValidators, createClass);
router.put('/classes/:id', authorize('system_settings', 'update'), updateClass);
router.delete('/classes/:id', authorize('system_settings', 'update'), deleteClass);

// Sections
router.get('/sections', authorize('student_admissions', 'read'), listSections);
router.post('/sections', authorize('system_settings', 'update'), createSectionValidators, createSection);
router.put('/sections/:id', authorize('system_settings', 'update'), updateSection);
router.delete('/sections/:id', authorize('system_settings', 'update'), deleteSection);

// Subjects
router.get('/subjects', authorize('student_admissions', 'read'), listSubjects);
router.post('/subjects', authorize('system_settings', 'update'), createSubjectValidators, createSubject);
router.put('/subjects/:id', authorize('system_settings', 'update'), updateSubject);
router.delete('/subjects/:id', authorize('system_settings', 'update'), deleteSubject);

export default router;
