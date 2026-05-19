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

  jwtSecret: optional('JWT_SECRET', 'dev_jwt_secret_please_change_in_production_min32chars'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '15m'),
  jwtRefreshSecret: optional('JWT_REFRESH_SECRET', 'dev_refresh_secret_please_change_in_production_min32'),
  jwtRefreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),

  // Redis is optional in development; if placeholder or missing, auth blacklisting is skipped
  redisUrl: optional('REDIS_URL', ''),
  redisEnabled: (() => {
    const url = optional('REDIS_URL', '');
    return url !== '' && !url.includes('<password>') && !url.includes('<host>');
  })(),

  awsRegion: optional('AWS_REGION', 'ap-southeast-1'),
  awsAccessKeyId: optional('AWS_ACCESS_KEY_ID', ''),
  awsSecretAccessKey: optional('AWS_SECRET_ACCESS_KEY', ''),
  awsS3Bucket: optional('AWS_S3_BUCKET', 'edustack-uploads'),
  s3Enabled: optional('AWS_ACCESS_KEY_ID', '') !== '',

  frontendUrl: optional('FRONTEND_URL', 'http://localhost:5173'),
  baseDomain: optional('BASE_DOMAIN', 'edustack.pk'),
};

if (env.isDev && !env.redisEnabled) {
  console.warn('[DEV] Redis not configured — token blacklisting disabled. Set REDIS_URL for production.');
}
if (env.isDev && env.jwtSecret.startsWith('dev_')) {
  console.warn('[DEV] Using default JWT secrets — set JWT_SECRET and JWT_REFRESH_SECRET for production.');
}
