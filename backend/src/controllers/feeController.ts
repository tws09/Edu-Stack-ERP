import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { FeeStructure } from '../models/FeeStructure';
import { Challan } from '../models/Challan';
import { Student } from '../models/Student';
import { AppError } from '../utils/errorHandler';

// ─── Fee Structures ────────────────────────────────────────────────────────

export async function listFeeStructures(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId, academicYearId } = req.query;
    const filter: Record<string, unknown> = { orgId: req.orgId, branchId: req.user!.branchId };
    if (classId) filter['classId'] = classId;
    if (academicYearId) filter['academicYearId'] = academicYearId;

    const structures = await FeeStructure.find(filter)
      .populate('classId', 'name level')
      .populate('academicYearId', 'label')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: structures });
  } catch (err) { next(err); }
}

export async function createFeeStructure(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId, academicYearId, name, items, dueDay } = req.body;
    const totalAmount = (items as { amount: number }[]).reduce((sum, i) => sum + i.amount, 0);

    const structure = await FeeStructure.create({
      orgId: req.orgId,
      branchId: req.user!.branchId,
      classId,
      academicYearId,
      name,
      items,
      totalAmount,
      dueDay: dueDay ?? 10,
    });

    res.status(201).json({ success: true, data: structure });
  } catch (err) { next(err); }
}

export async function updateFeeStructure(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { items, name, dueDay } = req.body;
    const totalAmount = items ? (items as { amount: number }[]).reduce((sum, i) => sum + i.amount, 0) : undefined;

    const structure = await FeeStructure.findOneAndUpdate(
      { _id: req.params['id'], orgId: req.orgId },
      { name, items, dueDay, ...(totalAmount != null ? { totalAmount } : {}) },
      { new: true }
    );

    if (!structure) throw new AppError('Fee structure not found', 404);
    res.json({ success: true, data: structure });
  } catch (err) { next(err); }
}

export async function deleteFeeStructure(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const structure = await FeeStructure.findOneAndUpdate(
      { _id: req.params['id'], orgId: req.orgId },
      { isActive: false },
      { new: true }
    );
    if (!structure) throw new AppError('Fee structure not found', 404);
    res.json({ success: true, message: 'Fee structure deactivated' });
  } catch (err) { next(err); }
}

// ─── Challans ──────────────────────────────────────────────────────────────

export async function listChallans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { month, studentId, status, page = '1', limit = '50' } = req.query;
    const filter: Record<string, unknown> = {
      orgId: req.orgId,
      branchId: req.user!.role === 'student' ? req.user!.branchId : (req.user!.branchId),
    };
    if (month) filter['month'] = month;
    if (studentId) filter['studentId'] = studentId;
    if (status) filter['status'] = status;

    // Students can only see their own challans
    if (req.user!.role === 'student') {
      const student = await Student.findOne({ orgId: req.orgId, userId: req.user!.id }).select('_id').lean();
      if (student) filter['studentId'] = student._id;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [challans, total] = await Promise.all([
      Challan.find(filter)
        .populate('studentId', 'rollNo profile.name')
        .populate('classId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string))
        .lean(),
      Challan.countDocuments(filter),
    ]);

    res.json({ success: true, data: challans, meta: { total, page: parseInt(page as string), limit: parseInt(limit as string) } });
  } catch (err) { next(err); }
}

export async function getChallan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const challan = await Challan.findOne({ _id: req.params['id'], orgId: req.orgId })
      .populate('studentId', 'rollNo profile admissionNo')
      .populate('classId', 'name level')
      .lean();
    if (!challan) throw new AppError('Challan not found', 404);
    res.json({ success: true, data: challan });
  } catch (err) { next(err); }
}

export async function generateChallans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { month, classId } = req.body; // month = "2025-06"
    if (!month) throw new AppError('month is required (YYYY-MM)', 400);

    const branchId = req.user!.branchId;
    const orgId = req.orgId;

    // Find fee structures for branch
    const structureFilter: Record<string, unknown> = { orgId, branchId, isActive: true };
    if (classId) structureFilter['classId'] = classId;
    const structures = await FeeStructure.find(structureFilter).lean();
    if (structures.length === 0) throw new AppError('No active fee structures found', 400);

    const structureMap = new Map(structures.map(s => [s.classId.toString(), s]));

    // Find active students
    const studentFilter: Record<string, unknown> = { orgId, branchId, status: 'active' };
    if (classId) studentFilter['classId'] = classId;
    const students = await Student.find(studentFilter).select('_id classId').lean();

    // Get last challan number to continue sequence
    const lastChallan = await Challan.findOne({ orgId }).sort({ createdAt: -1 }).select('challanNo').lean();
    let challanSeq = lastChallan?.challanNo
      ? parseInt(lastChallan.challanNo.replace(/\D/g, '')) + 1
      : 1001;

    const [year, m] = month.split('-');
    const dueDate = new Date(parseInt(year), parseInt(m) - 1, 10); // 10th of that month

    let created = 0;
    let skipped = 0;

    for (const student of students) {
      const structure = structureMap.get(student.classId.toString());
      if (!structure) { skipped++; continue; }

      // Skip if challan already exists for this student+month
      const exists = await Challan.findOne({ orgId, studentId: student._id, month }).lean();
      if (exists) { skipped++; continue; }

      const netAmount = structure.totalAmount;
      await Challan.create({
        orgId,
        branchId,
        studentId: student._id,
        classId: student.classId,
        feeStructureId: structure._id,
        month,
        challanNo: `CH-${year}-${String(challanSeq).padStart(5, '0')}`,
        items: structure.items,
        totalAmount: structure.totalAmount,
        discount: 0,
        waiver: 0,
        netAmount,
        paidAmount: 0,
        dueDate,
        status: 'unpaid',
        payments: [],
      });
      challanSeq++;
      created++;
    }

    res.status(201).json({ success: true, data: { created, skipped }, message: `Generated ${created} challans, skipped ${skipped}` });
  } catch (err) { next(err); }
}

export async function recordPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { amount, method, transactionRef } = req.body;
    const challan = await Challan.findOne({ _id: req.params['id'], orgId: req.orgId });
    if (!challan) throw new AppError('Challan not found', 404);
    if (challan.status === 'paid' || challan.status === 'waived') {
      throw new AppError('Challan is already settled', 400);
    }

    const receiptNo = `RCP-${Date.now()}`;
    challan.payments.push({
      amount,
      method,
      transactionRef,
      collectedById: new Types.ObjectId(req.user!.id),
      paidAt: new Date(),
      receiptNo,
    });
    challan.paidAmount = challan.payments.reduce((sum, p) => sum + p.amount, 0);

    if (challan.paidAmount >= challan.netAmount) {
      challan.status = 'paid';
    } else if (challan.paidAmount > 0) {
      challan.status = 'partial';
    }

    await challan.save();
    res.json({ success: true, data: challan, meta: { receiptNo } });
  } catch (err) { next(err); }
}

export async function applyWaiver(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { discount, waiver, reason } = req.body;
    const challan = await Challan.findOne({ _id: req.params['id'], orgId: req.orgId });
    if (!challan) throw new AppError('Challan not found', 404);

    if (discount != null) challan.discount = discount;
    if (waiver != null) challan.waiver = waiver;
    challan.netAmount = challan.totalAmount - challan.discount - challan.waiver;

    if (challan.waiver >= challan.totalAmount) {
      challan.status = 'waived';
    } else if (challan.paidAmount >= challan.netAmount) {
      challan.status = 'paid';
    }

    if (reason) {
      challan.set('waiverReason', reason);
    }

    await challan.save();
    res.json({ success: true, data: challan });
  } catch (err) { next(err); }
}

export async function getFeeSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { month } = req.query;
    const match: Record<string, unknown> = { orgId: req.orgId, branchId: req.user!.branchId };
    if (month) match['month'] = month;

    const summary = await Challan.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalNet: { $sum: '$netAmount' },
          totalPaid: { $sum: '$paidAmount' },
        },
      },
    ]);

    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
}
