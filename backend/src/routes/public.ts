import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getOrgBySlug, getOrgSite } from '../controllers/publicController';
import {
  getAdmissionConfig, getPublicUploadUrl,
  submitApplication, submitApplicationValidators,
} from '../controllers/admissionController';

const router = Router();

router.get('/orgs/:slug', asyncHandler(getOrgBySlug));
router.get('/orgs/:slug/site', asyncHandler(getOrgSite));

// Public admission (no auth required)
router.get('/admission/:slug', asyncHandler(getAdmissionConfig));
router.post('/admission/:slug/upload-url', asyncHandler(getPublicUploadUrl));
router.post('/admission/:slug', submitApplicationValidators, asyncHandler(submitApplication));

export default router;
