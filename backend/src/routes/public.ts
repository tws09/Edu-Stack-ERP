import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getOrgBySlug, getOrgSite } from '../controllers/publicController';

const router = Router();

router.get('/orgs/:slug', asyncHandler(getOrgBySlug));
router.get('/orgs/:slug/site', asyncHandler(getOrgSite));

export default router;
