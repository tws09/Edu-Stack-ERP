import { Request, Response, NextFunction } from 'express';
import { Organization } from '../../models/Organization';
import { env } from '../../config/env';

declare global {
  namespace Express {
    interface Request {
      orgId?: string;
      orgSlug?: string;
      tenantDoc?: import('../../models/Organization').IOrganization;
    }
  }
}

/**
 * Extracts orgId from the subdomain: [slug].edustack.pk → lookup slug → attach orgId.
 * Super Admin routes under app.edustack.pk skip tenant extraction.
 */
export async function extractTenant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const host = req.hostname;
  const baseDomain = env.baseDomain;

  // app.edustack.pk — Super Admin; skip tenant extraction
  if (host === `app.${baseDomain}` || host === 'localhost') {
    return next();
  }

  const slug = host.replace(`.${baseDomain}`, '');

  if (!slug || slug === host) {
    res.status(400).json({ success: false, message: 'Invalid tenant subdomain' });
    return;
  }

  try {
    const org = await Organization.findOne({ slug, status: 'active' }).lean();

    if (!org) {
      res.status(404).json({ success: false, message: 'Organization not found or inactive' });
      return;
    }

    req.orgId = String(org._id);
    req.orgSlug = slug;
    next();
  } catch (err) {
    next(err);
  }
}
