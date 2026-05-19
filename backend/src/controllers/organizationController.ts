import { Request, Response } from 'express';
import { body, validationResult, param } from 'express-validator';
import { Organization } from '../models/Organization';
import { Branch } from '../models/Branch';
import { User } from '../models/User';
import { hashPassword, generateTokens, storeRefreshToken } from '../services/authService';

export const createOrgValidators = [
  body('name').trim().notEmpty(),
  body('slug').trim().isSlug(),
  body('contactEmail').isEmail().normalizeEmail(),
  body('adminName').trim().notEmpty(),
  body('adminEmail').isEmail().normalizeEmail(),
  body('adminPassword').isLength({ min: 8 }),
];

/** Super Admin: create a new tenant organization with its first Group Admin */
export async function createOrganization(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return;
  }

  const { name, slug, contactEmail, contactPhone, adminName, adminEmail, adminPassword, plan } = req.body;

  const existingSlug = await Organization.findOne({ slug });
  if (existingSlug) {
    res.status(409).json({ success: false, message: 'Slug already taken' });
    return;
  }

  const existingEmail = await User.findOne({ email: adminEmail });
  if (existingEmail) {
    res.status(409).json({ success: false, message: 'Admin email already registered' });
    return;
  }

  const org = await Organization.create({
    name,
    slug,
    contactEmail,
    contactPhone,
    plan: plan ?? 'starter',
    status: 'trial',
    trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const adminUser = await User.create({
    orgId: org._id,
    role: 'group_admin',
    name: adminName,
    email: adminEmail,
    passwordHash: await hashPassword(adminPassword),
    active: true,
  });

  await Branch.create({
    orgId: org._id,
    name: 'Main Branch',
    code: 'MAIN',
    address: '-',
    city: '-',
  });

  res.status(201).json({
    success: true,
    data: { organization: org, adminUser: { id: adminUser.id, email: adminUser.email } },
  });
}

export async function listOrganizations(req: Request, res: Response): Promise<void> {
  const { page = '1', limit = '20', status } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const [orgs, total] = await Promise.all([
    Organization.find(filter).skip(skip).limit(parseInt(limit as string)).sort({ createdAt: -1 }).lean(),
    Organization.countDocuments(filter),
  ]);

  res.json({ success: true, data: orgs, meta: { total, page: parseInt(page as string) } });
}

export async function getOrganization(req: Request, res: Response): Promise<void> {
  const callerRole = req.user!.role;
  const { id } = req.params;

  if (callerRole !== 'super_admin' && req.user!.orgId?.toString() !== id) {
    res.status(403).json({ success: false, message: 'Access denied' });
    return;
  }

  const org = await Organization.findById(id);
  if (!org) {
    res.status(404).json({ success: false, message: 'Organization not found' });
    return;
  }
  res.json({ success: true, data: org });
}

export async function updateOrganization(req: Request, res: Response): Promise<void> {
  const callerRole = req.user!.role;
  const { id } = req.params;

  if (callerRole !== 'super_admin' && req.user!.orgId?.toString() !== id) {
    res.status(403).json({ success: false, message: 'Access denied' });
    return;
  }

  // group_admin cannot change plan or status — only super_admin can
  const allowedFields = callerRole === 'super_admin'
    ? ['name', 'contactEmail', 'contactPhone', 'address', 'status', 'plan', 'settings']
    : ['name', 'contactEmail', 'contactPhone', 'address', 'settings'];

  const update: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  const org = await Organization.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!org) {
    res.status(404).json({ success: false, message: 'Organization not found' });
    return;
  }
  res.json({ success: true, data: org });
}

export async function getUsageMetrics(req: Request, res: Response): Promise<void> {
  const { month } = req.query;
  const filter: Record<string, unknown> = {};
  if (month) filter.month = month;

  const { UsageMetric } = await import('../models/UsageMetric');
  const metrics = await UsageMetric.find(filter).sort({ month: -1 }).lean();

  res.json({ success: true, data: metrics });
}
