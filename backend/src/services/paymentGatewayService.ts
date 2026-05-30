import crypto from 'crypto';
import https from 'https';
import { env } from '../config/env';

export type GatewayName = 'jazzcash' | 'easypaisa';

export interface GatewayInitResult {
  success: boolean;
  txnRefNo: string;
  responseCode: string;
  responseDesc: string;
  raw?: Record<string, unknown>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowPK(): string {
  // YYYYMMDDHHMMSS in PKT (UTC+5)
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

function postJson(url: string, body: Record<string, string>, headers: Record<string, string> = {}): Promise<Record<string, unknown>> {
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
// Docs: https://sandbox.jazzcash.com.pk/DocumentationAPI/Content/

function jazzCashHash(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .filter(k => k.startsWith('pp_') || k.startsWith('PP_'))
    .sort()
    .map(k => params[k])
    .join('&');
  const message = env.jazzCashIntegritySalt + '&' + sorted;
  return crypto.createHmac('sha256', env.jazzCashIntegritySalt).update(message).digest('hex');
}

export async function initiateJazzCash(opts: {
  amount: number;
  mobileNumber: string;
  cnic?: string;
  challanNo: string;
  description?: string;
}): Promise<GatewayInitResult> {
  const ref = txnRef();
  const now = nowPK();
  const exp = expiryPK(30);
  const amountPaisas = String(Math.round(opts.amount * 100));

  const params: Record<string, string> = {
    pp_Version:             '2.0',
    pp_TxnType:             'MWALLET',
    pp_Language:            'EN',
    pp_MerchantID:          env.jazzCashMerchantId,
    pp_SubMerchantID:       '',
    pp_Password:            env.jazzCashPassword,
    pp_TxnRefNo:            ref,
    pp_Amount:              amountPaisas,
    pp_TxnCurrency:         'PKR',
    pp_TxnDateTime:         now,
    pp_BillReference:       opts.challanNo,
    pp_Description:         opts.description ?? `Fee challan ${opts.challanNo}`,
    pp_TxnExpiryDateTime:   exp,
    pp_MobileNumber:        opts.mobileNumber,
    pp_CNIC:                opts.cnic ?? '',
    pp_SecuredHash:         '',
  };
  params.pp_SecuredHash = jazzCashHash(params);

  let raw: Record<string, unknown> = {};
  try {
    raw = await postJson(env.jazzCashApiUrl, params);
  } catch (err) {
    return { success: false, txnRefNo: ref, responseCode: 'NET_ERR', responseDesc: String(err), raw: {} };
  }

  const code = String(raw['pp_ResponseCode'] ?? raw['responseCode'] ?? '999');
  const desc = String(raw['pp_ResponseMessage'] ?? raw['responseMessage'] ?? 'Unknown error');
  return {
    success: code === '000',
    txnRefNo: ref,
    responseCode: code,
    responseDesc: desc,
    raw,
  };
}

// ─── EasyPaisa M-Wallet ───────────────────────────────────────────────────────
// Docs: https://developer.easypaisa.com.pk

function easypaisaHash(storeId: string, amount: string, orderRefNum: string, txnDateTime: string, hashKey: string): string {
  const message = `amount=${amount}&orderRefNum=${orderRefNum}&storeId=${storeId}&transactionDateTime=${txnDateTime}&transactionType=MA`;
  return crypto.createHmac('sha256', hashKey).update(message).digest('hex');
}

export async function initiateEasypaisa(opts: {
  amount: number;
  mobileNumber: string;
  challanNo: string;
  description?: string;
}): Promise<GatewayInitResult> {
  const ref = `EP${Date.now()}`;
  const now = nowPK();
  const amountStr = opts.amount.toFixed(2);
  const hash = easypaisaHash(env.easypaisaStoreId, amountStr, ref, now, env.easypaisaHashKey);

  const body: Record<string, string> = {
    storeId:             env.easypaisaStoreId,
    amount:              amountStr,
    postBackURL:         '',
    orderRefNum:         ref,
    expiryDate:          expiryPK(60),
    autoRedirect:        '0',
    transactionType:     'MA',
    mobileAccountNo:     opts.mobileNumber,
    transactionDateTime: now,
    encryptedHashRequest: hash,
  };

  const credential = Buffer.from(`${env.easypaisaMerchantId}:${env.easypaisaHashKey}`).toString('base64');

  let raw: Record<string, unknown> = {};
  try {
    raw = await postJson(env.easypaisaApiUrl, body, { Authorization: `Basic ${credential}` });
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
