import { Router } from 'express';
import { authenticate } from '../middleware/auth/authenticate';
import { authorize } from '../middleware/rbac/authorize';
import {
  listGatewayConfigs,
  upsertGatewayConfig,
  upsertGatewayValidators,
  removeGatewayConfig,
  testGatewayConfig,
} from '../controllers/paymentGatewaySettingsController';

const router = Router();
router.use(authenticate);

router.get('/',               authorize('system_settings', 'read'),   listGatewayConfigs);
router.post('/',              authorize('system_settings', 'update'),  upsertGatewayValidators, upsertGatewayConfig);
router.delete('/:gateway',    authorize('system_settings', 'update'),  removeGatewayConfig);
router.post('/:gateway/test', authorize('system_settings', 'read'),   testGatewayConfig);

export default router;
