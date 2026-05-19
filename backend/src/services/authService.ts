import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { getRedis } from '../config/redis';
import { User, IUser, UserRole } from '../models/User';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  userId: string;
  role: UserRole;
  orgId?: string;
  branchId?: string;
}

export function generateTokens(payload: JwtPayload): TokenPair {
  const accessToken = jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(
    { ...payload, jti: uuidv4() },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] }
  );

  return { accessToken, refreshToken };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function blacklistToken(token: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return; // Redis not configured — skip blacklisting in dev

  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) return;

  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redis.setex(`bl:${token}`, ttl, '1');
  }
}

export async function storeRefreshToken(
  userId: string,
  refreshToken: string
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const decoded = jwt.decode(refreshToken) as { exp?: number; jti?: string } | null;
  if (!decoded?.exp || !decoded?.jti) return;

  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  await redis.setex(`rt:${userId}:${decoded.jti}`, ttl, refreshToken);
}

export async function rotateRefreshToken(
  oldToken: string
): Promise<{ user: IUser; tokens: TokenPair } | null> {
  let payload: JwtPayload & { jti?: string };
  try {
    payload = jwt.verify(oldToken, env.jwtRefreshSecret) as JwtPayload & { jti: string };
  } catch {
    return null;
  }

  const redis = getRedis();

  if (redis && payload.jti) {
    const stored = await redis.get(`rt:${payload.userId}:${payload.jti}`);
    if (!stored || stored !== oldToken) return null;
    await redis.del(`rt:${payload.userId}:${payload.jti}`);
  }

  const user = await User.findById(payload.userId);
  if (!user || !user.active) return null;

  const tokens = generateTokens({
    userId: user.id,
    role: user.role,
    orgId: user.orgId?.toString(),
    branchId: user.branchId?.toString(),
  });

  await storeRefreshToken(user.id, tokens.refreshToken);

  return { user, tokens };
}
