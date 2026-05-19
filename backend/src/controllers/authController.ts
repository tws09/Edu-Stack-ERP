import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { Branch } from '../models/Branch';
import {
  generateTokens,
  hashPassword,
  blacklistToken,
  storeRefreshToken,
  rotateRefreshToken,
} from '../services/authService';

export const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

export async function login(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, active: true }).select('+passwordHash');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const tokens = generateTokens({
      userId: user.id,
      role: user.role,
      orgId: user.orgId?.toString(),
      branchId: user.branchId?.toString(),
    });

    await storeRefreshToken(user.id, tokens.refreshToken);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          orgId: user.orgId,
          branchId: user.branchId,
          profilePhotoUrl: user.profilePhotoUrl,
        },
        ...tokens,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    await blacklistToken(authHeader.slice(7));
  }
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, message: 'Refresh token required' });
    return;
  }

  const result = await rotateRefreshToken(refreshToken);
  if (!result) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    return;
  }

  res.json({ success: true, data: result.tokens });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.user!.id).select('-passwordHash');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
}

export const changePasswordValidators = [
  body('currentPassword').isLength({ min: 6 }),
  body('newPassword').isLength({ min: 8 }),
];

export async function changePassword(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user!.id).select('+passwordHash');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(400).json({ success: false, message: 'Current password is incorrect' });
    return;
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
}

export const registerOrgValidators = [
  body('orgName').trim().notEmpty().withMessage('School name is required'),
  body('slug').trim().matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase letters, numbers and hyphens only'),
  body('contactEmail').isEmail().normalizeEmail().withMessage('Valid contact email required'),
  body('contactPhone').optional().trim(),
  body('adminName').trim().notEmpty().withMessage('Your name is required'),
  body('adminEmail').isEmail().normalizeEmail().withMessage('Valid admin email required'),
  body('adminPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

/** Public: self-service school registration — creates org + group admin + returns tokens */
export async function registerOrg(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return;
  }

  const { orgName, slug, contactEmail, contactPhone, adminName, adminEmail, adminPassword } = req.body;

  const [existingSlug, existingEmail] = await Promise.all([
    Organization.findOne({ slug }),
    User.findOne({ email: adminEmail }),
  ]);

  if (existingSlug) {
    res.status(409).json({ success: false, message: 'This URL slug is already taken. Try a different one.' });
    return;
  }
  if (existingEmail) {
    res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    return;
  }

  const { PlatformSettings } = await import('../models/PlatformSettings');
  const platformSettings = await PlatformSettings.findOne();
  const trialDays = platformSettings?.trialDays ?? 30;

  const org = await Organization.create({
    name: orgName,
    slug,
    contactEmail,
    contactPhone,
    plan: 'starter',
    status: 'trial',
    trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
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

  const tokens = generateTokens({
    userId: adminUser.id,
    role: 'group_admin',
    orgId: org._id.toString(),
  });

  await storeRefreshToken(adminUser.id, tokens.refreshToken);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        orgId: org._id,
      },
      ...tokens,
      trialEndsAt: org.trialEndsAt,
      trialDays,
    },
  });
}
