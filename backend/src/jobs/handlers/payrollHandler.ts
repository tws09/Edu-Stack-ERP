import { Payroll } from '../../models/Payroll';
import { StaffAttendance } from '../../models/StaffAttendance';

interface PayrollJobData {
  orgId: string;
  branchId: string;
  staffId: string;
  month: string;
  basicSalary: number;
  allowances: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  workingDays: number;
}

export async function processPayroll(data: PayrollJobData): Promise<void> {
  const { orgId, branchId, staffId, month, basicSalary, allowances, deductions, workingDays } = data;

  // Count absent days for the month
  const [year, monthNum] = month.split('-').map(Number);
  const monthStart = new Date(year, monthNum - 1, 1);
  const monthEnd = new Date(year, monthNum, 0);

  const absentRecords = await StaffAttendance.countDocuments({
    orgId,
    branchId,
    staffId,
    date: { $gte: monthStart, $lte: monthEnd },
    status: 'absent',
  });

  const dailyRate = basicSalary / workingDays;
  const absentDeduction = Math.round(dailyRate * absentRecords);

  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0) + absentDeduction;
  const grossSalary = basicSalary + totalAllowances;
  const netPay = Math.max(0, grossSalary - totalDeductions);

  await Payroll.findOneAndUpdate(
    { orgId, branchId, staffId, month },
    {
      orgId,
      branchId,
      staffId,
      month,
      basicSalary,
      allowances,
      deductions,
      absentDays: absentRecords,
      absentDeduction,
      grossSalary,
      totalDeductions,
      netPay,
      status: 'draft',
    },
    { upsert: true, new: true }
  );
}
