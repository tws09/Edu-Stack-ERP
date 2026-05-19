import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Sop } from '../models/Sop';

export const sopValidators = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('targetRoles').isArray({ min: 1 }).withMessage('At least one target role is required'),
];

/** GET /api/sops — returns SOPs visible to the current user's role */
export async function listSops(req: Request, res: Response): Promise<void> {
  const orgId = req.orgId;
  const branchId = req.user!.branchId;
  const role = req.user!.role;

  const filter: Record<string, unknown> = { orgId, isPublished: true, targetRoles: role };
  if (branchId) filter.branchId = branchId;

  // Principals and IT admin see all SOPs in their branch
  const isAdmin = ['branch_principal', 'it_admin', 'group_admin'].includes(role);
  const adminFilter: Record<string, unknown> = { orgId };
  if (branchId) adminFilter.branchId = branchId;

  const sops = await Sop.find(isAdmin ? adminFilter : filter)
    .sort({ category: 1, order: 1, createdAt: 1 })
    .lean();

  res.json({ success: true, data: sops });
}

/** POST /api/sops — create */
export async function createSop(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return;
  }

  const { title, category, content, targetRoles, order, isPublished } = req.body;

  const sop = await Sop.create({
    orgId: req.orgId,
    branchId: req.user!.branchId,
    title,
    category,
    content,
    targetRoles,
    order: order ?? 0,
    isPublished: isPublished !== false,
    createdBy: req.user!.id,
  });

  res.status(201).json({ success: true, data: sop });
}

/** PUT /api/sops/:id — update */
export async function updateSop(req: Request, res: Response): Promise<void> {
  const allowed = ['title', 'category', 'content', 'targetRoles', 'order', 'isPublished'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  const sop = await Sop.findOneAndUpdate(
    { _id: req.params.id, orgId: req.orgId },
    update,
    { new: true, runValidators: true }
  );

  if (!sop) {
    res.status(404).json({ success: false, message: 'SOP not found' });
    return;
  }
  res.json({ success: true, data: sop });
}

/** DELETE /api/sops/:id */
export async function deleteSop(req: Request, res: Response): Promise<void> {
  const sop = await Sop.findOneAndDelete({ _id: req.params.id, orgId: req.orgId });
  if (!sop) {
    res.status(404).json({ success: false, message: 'SOP not found' });
    return;
  }
  res.json({ success: true, message: 'SOP deleted' });
}
