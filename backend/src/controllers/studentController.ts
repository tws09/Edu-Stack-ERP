import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { hashPassword } from '../services/authService';
import { getUploadUrl, getPublicUrl } from '../services/s3Service';

// Auto-generate roll number: CLASS_CODE + SECTION_CODE + YEAR + SEQ
async function generateRollNumber(orgId: string, branchId: string, classId: string, sectionId: string, academicYearId: string): Promise<string> {
  const count = await Student.countDocuments({ orgId, branchId, classId, sectionId, academicYearId });
  const seq = String(count + 1).padStart(3, '0');
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  return `${yearSuffix}${seq}`;
}

async function generateAdmissionNumber(orgId: string): Promise<string> {
  const count = await Student.countDocuments({ orgId });
  return `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
}

export const createStudentValidators = [
  body('profile.name').trim().notEmpty(),
  body('profile.dateOfBirth').isISO8601(),
  body('profile.gender').isIn(['male', 'female', 'other']),
  body('profile.cnicOrBForm').trim().notEmpty(),
  body('guardianInfo.fatherName').trim().notEmpty(),
  body('guardianInfo.fatherPhone').trim().notEmpty(),
  body('classId').isMongoId(),
  body('sectionId').isMongoId(),
  body('academicYearId').isMongoId(),
  body('email').isEmail().normalizeEmail(),
];

export async function createStudent(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(422).json({ success: false, errors: errors.array() }); return; }

  const { orgId, branchId } = req.user!;
  const { profile, guardianInfo, classId, sectionId, academicYearId, email, previousSchool, admissionDate } = req.body;

  const existing = await User.findOne({ email });
  if (existing) { res.status(409).json({ success: false, message: 'Email already in use' }); return; }

  const rollNo = await generateRollNumber(orgId!, branchId!, classId, sectionId, academicYearId);
  const admissionNo = await generateAdmissionNumber(orgId!);

  const tempPassword = `${profile.name.split(' ')[0].toLowerCase()}@${new Date(profile.dateOfBirth).getFullYear()}`;

  const userDoc = await User.create({
    orgId,
    branchId,
    role: 'student',
    name: profile.name,
    email,
    passwordHash: await hashPassword(tempPassword),
    active: true,
  });

  const student = await Student.create({
    orgId,
    branchId,
    userId: userDoc._id,
    classId,
    sectionId,
    academicYearId,
    rollNo,
    admissionNo,
    profile,
    guardianInfo,
    status: 'enrolled',
    previousSchool,
    admissionDate: admissionDate ?? new Date(),
  });

  res.status(201).json({
    success: true,
    data: { student, tempPassword, userId: userDoc.id },
  });
}

export async function listStudents(req: Request, res: Response): Promise<void> {
  const { orgId, branchId } = req.user!;
  const { classId, sectionId, academicYearId, status, page = '1', limit = '30' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const filter: Record<string, unknown> = { orgId, branchId };
  if (classId) filter.classId = classId;
  if (sectionId) filter.sectionId = sectionId;
  if (academicYearId) filter.academicYearId = academicYearId;
  if (status) filter.status = status;

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('classId', 'name level')
      .populate('sectionId', 'name')
      .sort({ rollNo: 1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .lean(),
    Student.countDocuments(filter),
  ]);

  res.json({ success: true, data: students, meta: { total, page: parseInt(page as string) } });
}

export async function getStudent(req: Request, res: Response): Promise<void> {
  const { orgId } = req.user!;
  const student = await Student.findOne({ _id: req.params.id, orgId })
    .populate('classId', 'name level')
    .populate('sectionId', 'name')
    .populate('userId', 'email active lastLoginAt');

  if (!student) { res.status(404).json({ success: false, message: 'Student not found' }); return; }
  res.json({ success: true, data: student });
}

export async function updateStudent(req: Request, res: Response): Promise<void> {
  const { orgId } = req.user!;
  const allowed = ['profile', 'guardianInfo', 'classId', 'sectionId', 'status', 'previousSchool'];
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (req.body[k] !== undefined) update[k] = req.body[k];

  const student = await Student.findOneAndUpdate({ _id: req.params.id, orgId }, update, { new: true, runValidators: true });
  if (!student) { res.status(404).json({ success: false, message: 'Student not found' }); return; }
  res.json({ success: true, data: student });
}

export async function getDocumentUploadUrl(req: Request, res: Response): Promise<void> {
  const { filename, contentType } = req.body;
  if (!filename || !contentType) {
    res.status(400).json({ success: false, message: 'filename and contentType required' });
    return;
  }

  const result = await getUploadUrl(`students/${req.params.id}/documents`, filename, contentType);

  if (!result) {
    res.status(503).json({ success: false, message: 'File storage not configured' });
    return;
  }

  res.json({ success: true, data: result });
}

export async function addDocument(req: Request, res: Response): Promise<void> {
  const { orgId } = req.user!;
  const { type, key } = req.body;

  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, orgId },
    { $push: { documents: { type, url: getPublicUrl(key), uploadedAt: new Date() } } },
    { new: true }
  );

  if (!student) { res.status(404).json({ success: false, message: 'Student not found' }); return; }
  res.json({ success: true, data: student.documents });
}

export async function getMyProfile(req: Request, res: Response): Promise<void> {
  const student = await Student.findOne({ userId: req.user!.id })
    .populate('classId', 'name level')
    .populate('sectionId', 'name');

  if (!student) { res.status(404).json({ success: false, message: 'Student profile not found' }); return; }
  res.json({ success: true, data: student });
}
