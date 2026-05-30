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

  // admin.tws.enterprises — Super Admin; skip tenant extraction
  if (host === `admin.${baseDomain}` || host === 'localhost') {
    // Still check for X-Org-Slug header (mobile requests on localhost dev)
    const headerSlug = req.headers['x-org-slug'] as string | undefined;
    if (headerSlug) {
      try {
        const org = await Organization.findOne({ slug: headerSlug.toLowerCase(), status: 'active' }).lean();
        if (org) {
          req.orgId = String(org._id);
          req.orgSlug = headerSlug.toLowerCase();
        }
      } catch { /* non-critical — continue without org */ }
    }
    return next();
  }

  // Mobile / Railway direct URL — no subdomain match
  // Check X-Org-Slug header sent by Flutter app
  if (!host.endsWith(`.${baseDomain}`)) {
    const headerSlug = req.headers['x-org-slug'] as string | undefined;
    if (headerSlug) {
      try {
        const org = await Organization.findOne({ slug: headerSlug.toLowerCase(), status: 'active' }).lean();
        if (org) {
          req.orgId = String(org._id);
          req.orgSlug = headerSlug.toLowerCase();
        }
      } catch { /* fall through — controller will use JWT orgId */ }
    }
    return next();
  }

  // Subdomain-based resolution (standard web flow)
  const slug = host.slice(0, host.length - baseDomain.length - 1);

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
