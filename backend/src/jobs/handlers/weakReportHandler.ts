import { Types } from 'mongoose';
import { Branch } from '../../models/Branch';
import { Paper } from '../../models/Paper';
import { PaperResult } from '../../models/PaperResult';
import { ClearanceExam, ClearanceStatus } from '../../models/ClearanceExam';
import { Notification } from '../../models/Notification';
import { User } from '../../models/User';

/**
 * Runs on the 1st of each month (PKT).
 * Looks at the previous month's weekly paper results per branch, computes
 * per-student per-subject averages, and auto-creates ClearanceExam records
 * for any student whose average falls below the branch failingThreshold.
 * Notifies each teacher of their weak-student summary.
 */
export async function generateMonthlyWeakReport(): Promise<void> {
  const now = new Date();
  // Previous month
  const month = now.getMonth() === 0 ? 12 : now.getMonth();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const activeBranches = await Branch.find({ status: 'active' }).lean();

  for (const branch of activeBranches) {
    const orgId = branch.orgId as Types.ObjectId;
    const branchId = branch._id as Types.ObjectId;
    const failingThreshold = branch.academicThresholds?.failingThreshold ?? 40;

    // Get all weekly papers for this branch in the previous month
    const papers = await Paper.find({ orgId, branchId, month, year, paperType: 'weekly' })
      .select('_id subjectId classId sectionId teacherId')
      .lean();

    if (!papers.length) continue;

    const paperIds = papers.map((p) => p._id);

    // Aggregate average percentage per student per subject
    const averages = await PaperResult.aggregate([
      { $match: { orgId, branchId, paperId: { $in: paperIds } } },
      {
        $group: {
          _id: { studentId: '$studentId', subjectId: '$subjectId' },
          avgPercentage: { $avg: '$percentage' },
          classId: { $first: '$classId' },
          sectionId: { $first: '$sectionId' },
        },
      },
      { $match: { avgPercentage: { $lt: failingThreshold } } },
    ]);

    // Upsert ClearanceExam for each flagged student-subject pair
    const clearanceOps = averages.map((row) => ({
      updateOne: {
        filter: {
          orgId,
          branchId,
          studentId: row._id.studentId,
          subjectId: row._id.subjectId,
          triggerMonth: month,
          triggerYear: year,
        },
        update: {
          $setOnInsert: {
            orgId,
            branchId,
            studentId: row._id.studentId,
            subjectId: row._id.subjectId,
            classId: row.classId,
            sectionId: row.sectionId,
            triggerMonth: month,
            triggerYear: year,
            averagePercentage: Math.round(row.avgPercentage * 100) / 100,
            status: 'pending_approval' as ClearanceStatus,
          },
        },
        upsert: true,
      },
    }));

    if (clearanceOps.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ClearanceExam.bulkWrite(clearanceOps as any[]);
    }

    // Notify each teacher about their weak students
    await notifyTeachers({ orgId, branchId, papers, month, year, paperIds, failingThreshold });
  }
}

async function notifyTeachers(ctx: {
  orgId: Types.ObjectId;
  branchId: Types.ObjectId;
  papers: Array<{ _id: unknown; teacherId: Types.ObjectId; subjectId: Types.ObjectId; classId: Types.ObjectId }>;
  month: number;
  year: number;
  paperIds: unknown[];
  failingThreshold: number;
}): Promise<void> {
  const { orgId, branchId, papers, month, year, paperIds, failingThreshold } = ctx;

  // Group papers by teacher
  const byTeacher = new Map<string, { subjectIds: Set<string>; classIds: Set<string> }>();
  for (const p of papers) {
    const tid = String(p.teacherId);
    if (!byTeacher.has(tid)) byTeacher.set(tid, { subjectIds: new Set(), classIds: new Set() });
    byTeacher.get(tid)!.subjectIds.add(String(p.subjectId));
    byTeacher.get(tid)!.classIds.add(String(p.classId));
  }

  // Count weak students per teacher's papers
  const weakCounts = await PaperResult.aggregate([
    { $match: { orgId, branchId, paperId: { $in: paperIds }, isWeak: true } },
    {
      $group: {
        _id: { subjectId: '$subjectId', classId: '$classId' },
        weakStudents: { $addToSet: '$studentId' },
      },
    },
  ]);

  const monthName = new Date(year, month - 1).toLocaleString('en-PK', { month: 'long', year: 'numeric' });

  const notifications: Array<{
    orgId: Types.ObjectId;
    branchId: Types.ObjectId;
    recipientId: Types.ObjectId;
    type: 'system';
    title: string;
    message: string;
    link: string;
  }> = [];

  for (const [teacherId, { subjectIds }] of byTeacher) {
    const teacherWeakCount = weakCounts
      .filter((w) => subjectIds.has(String(w._id.subjectId)))
      .reduce((sum, w) => sum + w.weakStudents.length, 0);

    if (teacherWeakCount === 0) continue;

    notifications.push({
      orgId,
      branchId,
      recipientId: new Types.ObjectId(teacherId),
      type: 'system',
      title: `Monthly Weak Report — ${monthName}`,
      message: `${teacherWeakCount} student(s) in your subject(s) scored below ${failingThreshold}% this month. Clearance exams are pending your approval.`,
      link: `/papers/monthly-report?month=${month}&year=${year}`,
    });
  }

  if (notifications.length) {
    await Notification.insertMany(notifications);
  }
}
