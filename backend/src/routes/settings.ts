import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { requireSuperAdmin } from '../middleware/rbac/authorize';
import { PlatformSettings } from '../models/PlatformSettings';

const router = Router();
router.use(authenticate, requireSuperAdmin);

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({});
  }
  res.json({ success: true, data: settings });
});

router.put('/', async (req: Request, res: Response): Promise<void> => {
  const allowed = ['planPricing', 'trialDays', 'supportEmail', 'maintenanceMode'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create(update);
  } else {
    Object.assign(settings, update);
    await settings.save();
  }
  res.json({ success: true, data: settings });
});

export default router;
