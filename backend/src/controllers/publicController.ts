import { Request, Response } from 'express';
import { Organization } from '../models/Organization';

/** Public — no auth. Returns published school site if add-on is enabled. */
export async function getOrgSite(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug).toLowerCase();

  const org = await Organization.findOne({ slug })
    .select('name slug logoUrl tagline primaryColor welcomeMessage websiteAddon site status')
    .lean();

  if (!org || org.status === 'suspended' || !org.websiteAddon || !org.site?.published) {
    res.status(404).json({ success: false, message: 'Site not found' });
    return;
  }

  res.json({
    success: true,
    data: {
      orgName: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl ?? null,
      tagline: org.tagline ?? null,
      primaryColor: org.primaryColor ?? null,
      welcomeMessage: org.welcomeMessage ?? null,
      ...org.site,
    },
  });
}

/** Public — no auth. Returns org branding for the login page. */
export async function getOrgBySlug(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug).toLowerCase();

  const org = await Organization.findOne({ slug })
    .select('name slug logoUrl welcomeMessage tagline primaryColor status')
    .lean();

  if (!org || org.status === 'suspended') {
    res.status(404).json({ success: false, message: 'School not found' });
    return;
  }

  res.json({
    success: true,
    data: {
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl ?? null,
      welcomeMessage: org.welcomeMessage ?? null,
      tagline: org.tagline ?? null,
      primaryColor: org.primaryColor ?? null,
    },
  });
}
