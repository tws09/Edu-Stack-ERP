import { Request, Response, NextFunction } from 'express';
import { hasPermission } from './permissions';

type Module = Parameters<typeof hasPermission>[1];
type Action = Parameters<typeof hasPermission>[2];

/**
 * Middleware factory: authorize(module, action).
 * Call after authenticate() — requires req.user to be set.
 */
export function authorize(module: Module, action: Action) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!hasPermission(req.user.role, module, action)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: ${req.user.role} cannot ${action} on ${module}`,
      });
      return;
    }

    next();
  };
}

/** Restrict to specific roles — use when PERMISSIONS config doesn't express the rule cleanly. */
export function requireRoles(...roles: import('../../models/User').UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient privileges' });
      return;
    }
    next();
  };
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'super_admin') {
    res.status(403).json({ success: false, message: 'Super Admin access required' });
    return;
  }
  next();
}
