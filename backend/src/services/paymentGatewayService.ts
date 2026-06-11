import crypto from 'crypto';
import https from 'https';
import { Types } from 'mongoose';
import { env } from '../config/env';
import { PaymentGatewayConfig } from '../models/PaymentGatewayConfig';

export type GatewayName = 'jazzcash' | 'easypaisa';

export interface GatewayInitResult {
  success: boolean;
  txnRefNo: string;
  responseCode: string;
  responseDesc: string;
  raw?: Record<string, unknown>;
}

export interface JazzCashCreds {
  merchantId: string;
  password: string;
  integritySalt: string;
  apiUrl: string;
}

export interface EasypaisaCreds {
  merchantId: string;
  storeId: string;
  hashKey: string;
  apiUrl: string;
}

// ─── Credential Encryption ────────────────────────────────────────────────────

function encryptionKey(): Buffer {
  if (!env.gatewayEncryptionKey) throw new Error('GATEWAY_ENCRYPTION_KEY is not configured');
  return Buffer.from(env.gatewayEncryptionKey, 'hex');
}

export function encryptCreds(creds: Record<string, string>): { encrypted: string; iv: string; tag: string } {
  const key = encryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(creds), 'utf8'), cipher.final()]);
  return {
    encrypted: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex'),
  };
}

export function decryptCreds(data: { encrypted: string; iv: string; tag: string }): Record<string, string> {
  const key = encryptionKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(data.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(data.tag, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data.encrypted, 'hex')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8')) as Record<string, string>;
}

// ─── Tenant Gateway Loader ────────────────────────────────────────────────────

const JAZZCASH_LIVE_URL    = 'https://payments.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction';
const JAZZCASH_SANDBOX_URL = 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction';
const EASYPAISA_LIVE_URL    = 'https://easypay.easypaisa.com.pk/easypay-service/rest/v4/initiate-ma-transaction';
const EASYPAISA_SANDBOX_URL = 'https://easypaystg.easypaisa.com.pk/easypay-service/rest/v4/initiate-ma-transaction';

export async function loadTenantGateway(
  orgId: string,
  gateway: GatewayName
): Promise<JazzCashCreds | EasypaisaCreds | null> {
  const config = await PaymentGatewayConfig.findOne({
    orgId: new Types.ObjectId(orgId),
    gateway,
    isActive: true,
  }).lean();

  if (!config) return null;

  const raw = decryptCreds(config.credentials);
  const sandbox = config.isSandbox;

  if (gateway === 'jazzcash') {
    return {
      merchantId:    raw['merchantId']!,
      password:      raw['password']!,
      integritySalt: raw['integritySalt']!,
      apiUrl:        raw['apiUrl'] ?? (sandbox ? JAZZCASH_SANDBOX_URL : JAZZCASH_LIVE_URL),
    };
  }

  return {
    merchantId: raw['merchantId']!,
    storeId:    raw['storeId']!,
    hashKey:    raw['hashKey']!,
    apiUrl:     raw['apiUrl'] ?? (sandbox ? EASYPAISA_SANDBOX_URL : EASYPAISA_LIVE_URL),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowPK(): string {
  const d = new Date(Date.now() + 5 * 60 * 60 * 1000);
  return d.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
}

function expiryPK(minutesAhead = 30): string {
  const d = new Date(Date.now() + (5 * 60 + minutesAhead) * 60 * 1000);
  return d.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
}

function txnRef(): string {
  return `T${Date.now()}`;
}

function postJson(
  url: string,
  body: Record<string, string>,
  headers: Record<string, string> = {}
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw) as Record<string, unknown>); }
        catch { resolve({ raw }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ─── JazzCash M-Wallet ────────────────────────────────────────────────────────

function jazzCashHash(params: Record<string, string>, integritySalt: string): string {
  const sorted = Object.keys(params)
    .filter(k => k.startsWith('pp_') || k.startsWith('PP_'))
    .sort()
    .map(k => params[k])
    .join('&');
  const message = integritySalt + '&' + sorted;
  return crypto.createHmac('sha256', integritySalt).update(message).digest('hex');
}

export async function initiateJazzCash(
  opts: {
    amount: number;
    mobileNumber: string;
    cnic?: string;
    challanNo: string;
    description?: string;
  },
  creds: JazzCashCreds
): Promise<GatewayInitResult> {
  const ref = txnRef();
  const now = nowPK();
  const exp = expiryPK(30);
  const amountPaisas = String(Math.round(opts.amount * 100));

  const params: Record<string, string> = {
    pp_Version:           '2.0',
    pp_TxnType:           'MWALLET',
    pp_Language:          'EN',
    pp_MerchantID:        creds.merchantId,
    pp_SubMerchantID:     '',
    pp_Password:          creds.password,
    pp_TxnRefNo:          ref,
    pp_Amount:            amountPaisas,
    pp_TxnCurrency:       'PKR',
    pp_TxnDateTime:       now,
    pp_BillReference:     opts.challanNo,
    pp_Description:       opts.description ?? `Fee challan ${opts.challanNo}`,
    pp_TxnExpiryDateTime: exp,
    pp_MobileNumber:      opts.mobileNumber,
    pp_CNIC:              opts.cnic ?? '',
    pp_SecuredHash:       '',
  };
  params['pp_SecuredHash'] = jazzCashHash(params, creds.integritySalt);

  let raw: Record<string, unknown> = {};
  try {
    raw = await postJson(creds.apiUrl, params);
  } catch (err) {
    return { success: false, txnRefNo: ref, responseCode: 'NET_ERR', responseDesc: String(err), raw: {} };
  }

  const code = String(raw['pp_ResponseCode'] ?? raw['responseCode'] ?? '999');
  const desc = String(raw['pp_ResponseMessage'] ?? raw['responseMessage'] ?? 'Unknown error');
  return { success: code === '000', txnRefNo: ref, responseCode: code, responseDesc: desc, raw };
}

// ─── EasyPaisa M-Wallet ───────────────────────────────────────────────────────

function easypaisaHash(
  storeId: string,
  amount: string,
  orderRefNum: string,
  txnDateTime: string,
  hashKey: string
): string {
  const message = `amount=${amount}&orderRefNum=${orderRefNum}&storeId=${storeId}&transactionDateTime=${txnDateTime}&transactionType=MA`;
  return crypto.createHmac('sha256', hashKey).update(message).digest('hex');
}

export async function initiateEasypaisa(
  opts: {
    amount: number;
    mobileNumber: string;
    challanNo: string;
    description?: string;
  },
  creds: EasypaisaCreds
): Promise<GatewayInitResult> {
  const ref = `EP${Date.now()}`;
  const now = nowPK();
  const amountStr = opts.amount.toFixed(2);
  const hash = easypaisaHash(creds.storeId, amountStr, ref, now, creds.hashKey);

  const body: Record<string, string> = {
    storeId:              creds.storeId,
    amount:               amountStr,
    postBackURL:          '',
    orderRefNum:          ref,
    expiryDate:           expiryPK(60),
    autoRedirect:         '0',
    transactionType:      'MA',
    mobileAccountNo:      opts.mobileNumber,
    transactionDateTime:  now,
    encryptedHashRequest: hash,
  };

  const credential = Buffer.from(`${creds.merchantId}:${creds.hashKey}`).toString('base64');

  let raw: Record<string, unknown> = {};
  try {
    raw = await postJson(creds.apiUrl, body, { Authorization: `Basic ${credential}` });
  } catch (err) {
    return { success: false, txnRefNo: ref, responseCode: 'NET_ERR', responseDesc: String(err), raw: {} };
  }

  const code = String(raw['responseCode'] ?? raw['status'] ?? '999');
  const desc = String(raw['responseDesc'] ?? raw['message'] ?? 'Unknown error');
  return {
    success: code === '0000' || code === '200',
    txnRefNo: ref,
    responseCode: code,
    responseDesc: desc,
    raw,
  };
}
