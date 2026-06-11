import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { Types } from 'mongoose';
import { PaymentGatewayConfig } from '../models/PaymentGatewayConfig';
import {
  encryptCreds,
  loadTenantGateway,
  initiateJazzCash,
  initiateEasypaisa,
  JazzCashCreds,
  EasypaisaCreds,
} from '../services/paymentGatewayService';
import { AppError } from '../utils/errorHandler';

export const upsertGatewayValidators = [
  body('gateway').isIn(['jazzcash', 'easypaisa']).withMessage('Invalid gateway'),
  body('isSandbox').isBoolean(),
  body('credentials').isObject(),
];

export async function listGatewayConfigs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const configs = await PaymentGatewayConfig.find(
      { orgId: req.orgId, isActive: true },
    ).select('-credentials').lean();
    res.json({ success: true, data: configs });
  } catch (err) { next(err); }
}

export async function upsertGatewayConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(422).json({ success: false, errors: errors.array() }); return; }

    const { gateway, isSandbox, credentials } = req.body as {
      gateway: 'jazzcash' | 'easypaisa';
      isSandbox: boolean;
      credentials: Record<string, string>;
    };

    if (gateway === 'jazzcash') {
      if (!credentials['merchantId'] || !credentials['password'] || !credentials['integritySalt']) {
        throw new AppError('JazzCash requires merchantId, password, and integritySalt', 422);
      }
    } else {
      if (!credentials['merchantId'] || !credentials['storeId'] || !credentials['hashKey']) {
        throw new AppError('EasyPaisa requires merchantId, storeId, and hashKey', 422);
      }
    }

    const encrypted = encryptCreds(credentials);

    const config = await PaymentGatewayConfig.findOneAndUpdate(
      { orgId: new Types.ObjectId(req.orgId!), gateway },
      { isSandbox, isActive: true, credentials: encrypted },
      { upsert: true, new: true }
    ).select('-credentials');

    res.json({ success: true, data: config });
  } catch (err) { next(err); }
}

export async function removeGatewayConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { gateway } = req.params as { gateway: string };
    if (!['jazzcash', 'easypaisa'].includes(gateway)) throw new AppError('Invalid gateway', 400);

    await PaymentGatewayConfig.findOneAndUpdate(
      { orgId: new Types.ObjectId(req.orgId!), gateway: gateway as 'jazzcash' | 'easypaisa' },
      { isActive: false }
    );
    res.json({ success: true, message: `${gateway} configuration removed` });
  } catch (err) { next(err); }
}

export async function testGatewayConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { gateway } = req.params as { gateway: string };
    if (!['jazzcash', 'easypaisa'].includes(gateway)) throw new AppError('Invalid gateway', 400);

    const creds = await loadTenantGateway(req.orgId!, gateway as 'jazzcash' | 'easypaisa');
    if (!creds) throw new AppError(`${gateway} is not configured for your organization`, 404);

    const testOpts = {
      amount: 1,
      mobileNumber: '03001234567',
      challanNo: 'TEST-PING',
      description: 'EduStack gateway connectivity test',
    };

    const result = gateway === 'jazzcash'
      ? await initiateJazzCash(testOpts, creds as JazzCashCreds)
      : await initiateEasypaisa(testOpts, creds as EasypaisaCreds);

    // Any response from the gateway (even an error code) means credentials + connectivity are working.
    // NET_ERR means we couldn't reach the gateway at all.
    const reachable = result.responseCode !== 'NET_ERR';

    res.json({
      success: reachable,
      data: {
        reachable,
        responseCode: result.responseCode,
        responseDesc: result.responseDesc,
      },
    });
  } catch (err) { next(err); }
}
