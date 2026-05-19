import { Organization } from '../../models/Organization';
import { Branch } from '../../models/Branch';
import { Student } from '../../models/Student';
import { Attendance } from '../../models/Attendance';
import { UsageMetric } from '../../models/UsageMetric';

const PRICING: Record<string, { limit: number; rate: number }[]> = {
  starter: [{ limit: 150, rate: 50 }],
  growth: [{ limit: 150, rate: 50 }, { limit: 350, rate: 40 }],
  scale: [{ limit: 150, rate: 50 }, { limit: 350, rate: 40 }, { limit: 500, rate: 30 }],
};

function getRateForCount(plan: string, count: number): number {
  const tiers = PRICING[plan] ?? PRICING.starter;
  let rate = tiers[0].rate;
  for (const tier of tiers) {
    if (count <= tier.limit) {
      rate = tier.rate;
      break;
    }
  }
  return rate;
}

export async function countActiveStudents(): Promise<void> {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const orgs = await Organization.find({ status: 'active' }).lean();

  for (const org of orgs) {
    const branches = await Branch.find({ orgId: org._id, status: 'active' }).lean();

    for (const branch of branches) {
      // Active = status active AND has at least 1 attendance record this month
      const studentsWithAttendance = await Attendance.distinct('records.studentId', {
        orgId: org._id,
        branchId: branch._id,
        date: { $gte: monthStart, $lte: monthEnd },
      });

      const activeCount = studentsWithAttendance.length;
      const rate = getRateForCount(org.plan, activeCount);
      const total = activeCount * rate;

      await UsageMetric.findOneAndUpdate(
        { orgId: org._id, branchId: branch._id, month },
        {
          orgId: org._id,
          branchId: branch._id,
          month,
          activeStudents: activeCount,
          plan: org.plan,
          ratePerStudent: rate,
          totalAmount: total,
          generatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    // Update org-level total
    await Organization.findByIdAndUpdate(org._id, {
      'usageBilling.lastCountedAt': new Date(),
    });
  }

  console.log(`[BillingJob] Active student count completed for month ${month}`);
}
