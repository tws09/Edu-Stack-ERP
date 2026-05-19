import Redis, { type RedisOptions } from 'ioredis';
import { env } from './env';

let redisClient: Redis | null = null;

function createRedisClient(): Redis {
  const raw = env.redisUrl;
  // Parse rediss:// or redis:// URLs manually so ioredis gets explicit host/port/tls
  // rather than treating the URL string as a Unix socket path on Windows.
  try {
    const url = new URL(raw);
    const isTls = url.protocol === 'rediss:';
    const opts: RedisOptions = {
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : (isTls ? 6380 : 6379),
      username: url.username || 'default',
      password: url.password ? decodeURIComponent(url.password) : undefined,
      tls: isTls ? {} : undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 100, 3000),
    };
    return new Redis(opts);
  } catch {
    // Fallback: raw string (works for plain redis://host:port without TLS)
    return new Redis(raw, { lazyConnect: true, maxRetriesPerRequest: 3 });
  }
}

export function getRedis(): Redis | null {
  if (!env.redisEnabled) return null;

  if (!redisClient) {
    redisClient = createRedisClient();
    redisClient.on('connect', () => console.log('Redis connected'));
    redisClient.on('error', (err) => console.error('Redis error:', err));
  }
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
