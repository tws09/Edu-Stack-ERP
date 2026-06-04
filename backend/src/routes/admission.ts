import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import { asyncHandler } from '../utils/asyncHandler';
import {
  listPrograms, createProgram, createProgramValidators, updateProgram, deleteProgram,
  listApplications, getApplication, updateApplicationStatus,
  verifyDocument, verifySpecialField, addNote,
  generateMeritList, getMeritList, getSeatOccupancy,
  enrollApplication, enrollValidators,
  getAdmissionStats,
} from '../controllers/admissionController';

const router = Router();
router.use(authenticate);

// Programs management
router.get('/programs', authorize('admission_management', 'read'), asyncHandler(listPrograms));
router.post('/programs', authorize('admission_management', 'configure'), createProgramValidators, asyncHandler(createProgram));
router.put('/programs/:id', authorize('admission_management', 'configure'), asyncHandler(updateProgram));
router.delete('/programs/:id', authorize('admission_management', 'delete'), asyncHandler(deleteProgram));

// Applications
router.get('/applications', authorize('admission_management', 'read'), asyncHandler(listApplications));
router.get('/applications/stats', authorize('admission_management', 'read'), asyncHandler(getAdmissionStats));
router.get('/applications/:id', authorize('admission_management', 'read'), asyncHandler(getApplication));
router.put('/applications/:id/status', authorize('admission_management', 'update'), asyncHandler(updateApplicationStatus));
router.put('/applications/:id/documents/:docType/verify', authorize('admission_management', 'update'), asyncHandler(verifyDocument));
router.put('/applications/:id/verify/:field', authorize('admission_management', 'update'), asyncHandler(verifySpecialField));
router.post('/applications/:id/notes', authorize('admission_management', 'update'), asyncHandler(addNote));
router.post('/applications/:id/enroll', authorize('admission_management', 'approve'), enrollValidators, asyncHandler(enrollApplication));

// Merit list
router.post('/merit-list/generate', authorize('admission_management', 'approve'), asyncHandler(generateMeritList));
router.get('/merit-list', authorize('admission_management', 'read'), asyncHandler(getMeritList));
router.get('/seat-occupancy', authorize('admission_management', 'read'), asyncHandler(getSeatOccupancy));

export default router;
