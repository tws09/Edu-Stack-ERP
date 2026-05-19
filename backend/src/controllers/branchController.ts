import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Branch } from '../models/Branch';

export const createBranchValidators = [
  body('name').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('code').optional().trim(),
  body('address').optional().trim(),
];

function autoCode(name: string): string {
  const initials = name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').join('');
  const suffix = Date.now().toString(36).slice(-3).toUpperCase();
  return `${initials}${suffix}`;
}

export async function createBranch(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return;
  }

  const orgId = req.user!.orgId || req.body.orgId;
  if (!orgId) {
    res.status(400).json({ success: false, message: 'orgId is required' });
    return;
  }

  const code = req.body.code?.trim() || autoCode(req.body.name);
  const address = req.body.address?.trim() || '-';

  const existing = await Branch.findOne({ orgId, code });
  if (existing) {
    res.status(409).json({ success: false, message: 'Branch code already exists in this organization' });
    return;
  }

  const branch = await Branch.create({ ...req.body, code, address, orgId });
  res.status(201).json({ success: true, data: branch });
}

export async function listBranches(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId || req.params.orgId;
  const branches = await Branch.find({ orgId }).sort({ name: 1 }).lean();
  res.json({ success: true, data: branches });
}

export async function getBranch(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const branch = await Branch.findOne({ _id: req.params.id, orgId });
  if (!branch) {
    res.status(404).json({ success: false, message: 'Branch not found' });
    return;
  }
  res.json({ success: true, data: branch });
}

export async function updateBranch(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const allowed = ['name', 'address', 'city', 'phone', 'email', 'principalName', 'status', 'settings', 'logoUrl'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  const branch = await Branch.findOneAndUpdate({ _id: req.params.id, orgId }, update, { new: true, runValidators: true });
  if (!branch) {
    res.status(404).json({ success: false, message: 'Branch not found' });
    return;
  }
  res.json({ success: true, data: branch });
}

export async function deleteBranch(req: Request, res: Response): Promise<void> {
  const orgId = req.user!.orgId;
  const branch = await Branch.findOneAndUpdate(
    { _id: req.params.id, orgId },
    { status: 'inactive' },
    { new: true }
  );
  if (!branch) {
    res.status(404).json({ success: false, message: 'Branch not found' });
    return;
  }
  res.json({ success: true, message: 'Branch deactivated' });
}
