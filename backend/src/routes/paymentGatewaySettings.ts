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

router.get('/',               authorize('fee_management', 'read'),   listGatewayConfigs);
router.post('/',              authorize('fee_management', 'update'),  upsertGatewayValidators, upsertGatewayConfig);
router.delete('/:gateway',    authorize('fee_management', 'update'),  removeGatewayConfig);
router.post('/:gateway/test', authorize('fee_management', 'read'),   testGatewayConfig);

export default router;
