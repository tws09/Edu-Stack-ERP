import { Branch } from '../../models/Branch';
import { Student } from '../../models/Student';
import { FeeStructure } from '../../models/FeeStructure';
import { Challan } from '../../models/Challan';
import { Organization } from '../../models/Organization';

export async function generateMonthlyChallans(): Promise<void> {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const month = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

  const orgs = await Organization.find({ status: 'active' }).lean();

  for (const org of orgs) {
    const branches = await Branch.find({ orgId: org._id, status: 'active' }).lean();

    for (const branch of branches) {
      const students = await Student.find({
        orgId: org._id,
        branchId: branch._id,
        status: 'active',
      }).lean();

      for (const student of students) {
        // Skip if challan already exists
        const exists = await Challan.findOne({
          orgId: org._id,
          branchId: branch._id,
          studentId: student._id,
          month,
        });
        if (exists) continue;

        const feeStructure = await FeeStructure.findOne({
          orgId: org._id,
          branchId: branch._id,
          classId: student.classId,
          isActive: true,
        });

        if (!feeStructure) continue;

        const dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), feeStructure.dueDay);
        const challanNo = `${String(org._id).slice(-4).toUpperCase()}-${String(branch._id).slice(-4).toUpperCase()}-${month}-${String(student._id).slice(-6).toUpperCase()}`;

        await Challan.create({
          orgId: org._id,
          branchId: branch._id,
          studentId: student._id,
          classId: student.classId,
          feeStructureId: feeStructure._id,
          month,
          challanNo,
          items: feeStructure.items.map((i) => ({ name: i.name, amount: i.amount })),
          totalAmount: feeStructure.totalAmount,
          netAmount: feeStructure.totalAmount,
          dueDate,
          status: 'unpaid',
        });
      }
    }
  }

  console.log(`[ChallanJob] Monthly challans generated for ${month}`);
}
