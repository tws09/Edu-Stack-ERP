import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { getRedis } from '../../config/redis';
import type { IUser, UserRole } from '../../models/User';

interface JwtPayload {
  userId: string;
  role: UserRole;
  orgId?: string;
  branchId?: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        orgId?: string;
        branchId?: string;
        doc?: IUser;
      };
      orgId?: string;
      orgSlug?: string;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

    const redis = getRedis();
    if (redis) {
      const isBlacklisted = await redis.get(`bl:${token}`);
      if (isBlacklisted) {
        res.status(401).json({ success: false, message: 'Token has been invalidated' });
        return;
      }
    }

    req.user = {
      id: payload.userId,
      role: payload.role,
      orgId: payload.orgId,
      branchId: payload.branchId,
    };

    // When running on localhost the subdomain middleware doesn't set req.orgId,
    // so fall back to the orgId embedded in the JWT.
    if (!req.orgId && payload.orgId) {
      req.orgId = payload.orgId;
    }

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expired' });
      return;
    }
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}
