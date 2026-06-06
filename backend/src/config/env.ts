import dotenv from 'dotenv';
dotenv.config();

const optional = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

export const env = {
  port: parseInt(optional('PORT', '5000'), 10),
  nodeEnv: optional('NODE_ENV', 'development'),
  isDev: optional('NODE_ENV', 'development') === 'development',

  mongoUri: (() => {
    const v = process.env.MONGODB_URI;
    if (!v) throw new Error('Missing required env var: MONGODB_URI');
    return v;
  })(),

  jwtSecret: (() => {
    const v = process.env.JWT_SECRET;
    if (!v || v.length < 32) throw new Error('JWT_SECRET missing or too short (min 32 chars)');
    return v;
  })(),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '15m'),
  jwtRefreshSecret: (() => {
    const v = process.env.JWT_REFRESH_SECRET;
    if (!v || v.length < 32) throw new Error('JWT_REFRESH_SECRET missing or too short (min 32 chars)');
    return v;
  })(),
  jwtRefreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),

  awsRegion: optional('AWS_REGION', 'us-west-004'),
  awsAccessKeyId: optional('AWS_ACCESS_KEY_ID', ''),
  awsSecretAccessKey: optional('AWS_SECRET_ACCESS_KEY', ''),
  awsS3Bucket: optional('AWS_S3_BUCKET', 'edustack-uploads'),
  s3Endpoint: optional('S3_ENDPOINT', ''),      // e.g. https://s3.us-west-004.backblazeb2.com
  s3PublicUrlBase: optional('S3_PUBLIC_URL_BASE', ''), // e.g. https://edustack-uploads.s3.us-west-004.backblazeb2.com
  s3Enabled: optional('AWS_ACCESS_KEY_ID', '') !== '',

  frontendUrl: optional('FRONTEND_URL', 'http://localhost:5173'),
  baseDomain: optional('BASE_DOMAIN', 'edustack.pk'),
  vercelPreviewUrl: optional('VERCEL_PREVIEW_URL', ''),

  // JazzCash M-Wallet API (sandbox: https://sandbox.jazzcash.com.pk)
  jazzCashMerchantId:     optional('JAZZCASH_MERCHANT_ID', ''),
  jazzCashPassword:       optional('JAZZCASH_PASSWORD', ''),
  jazzCashIntegritySalt:  optional('JAZZCASH_INTEGRITY_SALT', ''),
  jazzCashApiUrl:         optional('JAZZCASH_API_URL', 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction'),
  jazzCashEnabled:        optional('JAZZCASH_MERCHANT_ID', '') !== '',

  // EasyPaisa REST API
  easypaisaMerchantId:    optional('EASYPAISA_MERCHANT_ID', ''),
  easypaisaStoreId:       optional('EASYPAISA_STORE_ID', ''),
  easypaisaHashKey:       optional('EASYPAISA_HASH_KEY', ''),
  easypaisaApiUrl:        optional('EASYPAISA_API_URL', 'https://easypay.easypaisa.com.pk/easypay-service/rest/v4/initiate-ma-transaction'),
  easypaisaEnabled:       optional('EASYPAISA_MERCHANT_ID', '') !== '',
};

