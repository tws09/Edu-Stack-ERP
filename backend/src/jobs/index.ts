import { Queue, Worker } from 'bullmq';
import { env } from '../config/env';

const connection = { url: env.redisUrl };

// Queue definitions
export const monthlyBillingQueue = new Queue('monthly-billing', { connection });
export const challanGenerationQueue = new Queue('challan-generation', { connection });
export const payrollQueue = new Queue('payroll-processing', { connection });
export const pdfExportQueue = new Queue('pdf-export', { connection });
export const weakReportQueue = new Queue('weak-report', { connection });

/** Schedule recurring jobs. Call once at app start. */
export async function scheduleRecurringJobs(): Promise<void> {
  // Count active students on 1st of every month at midnight PKT (UTC+5 = 19:00 UTC prev day)
  await monthlyBillingQueue.add(
    'count-active-students',
    {},
    {
      repeat: { pattern: '0 19 28-31 * *' },
      jobId: 'recurring-billing-count',
    }
  );

  // Auto-generate challans on 25th of each month for next month
  await challanGenerationQueue.add(
    'generate-monthly-challans',
    {},
    {
      repeat: { pattern: '0 0 25 * *' },
      jobId: 'recurring-challan-gen',
    }
  );

  // Generate monthly weak report + auto-flag clearances on 1st of each month at 01:00 PKT (20:00 UTC)
  await weakReportQueue.add(
    'generate-weak-report',
    {},
    {
      repeat: { pattern: '0 20 1 * *' },
      jobId: 'recurring-weak-report',
    }
  );
}

export function registerWorkers(): void {
  const billingWorker = new Worker(
    'monthly-billing',
    async (job) => {
      if (job.name === 'count-active-students') {
        const { countActiveStudents } = await import('./handlers/billingHandler');
        await countActiveStudents();
      }
    },
    { connection }
  );

  const challanWorker = new Worker(
    'challan-generation',
    async (job) => {
      if (job.name === 'generate-monthly-challans') {
        const { generateMonthlyChallans } = await import('./handlers/challanHandler');
        await generateMonthlyChallans();
      }
    },
    { connection }
  );

  const payrollWorker = new Worker(
    'payroll-processing',
    async (job) => {
      if (job.name === 'process-payroll') {
        const { processPayroll } = await import('./handlers/payrollHandler');
        await processPayroll(job.data);
      }
    },
    { connection }
  );

  const weakReportWorker = new Worker(
    'weak-report',
    async (job) => {
      if (job.name === 'generate-weak-report') {
        const { generateMonthlyWeakReport } = await import('./handlers/weakReportHandler');
        await generateMonthlyWeakReport();
      }
    },
    { connection }
  );

  billingWorker.on('failed', (job, err) => {
    console.error(`Billing job ${job?.id} failed:`, err);
  });

  challanWorker.on('failed', (job, err) => {
    console.error(`Challan job ${job?.id} failed:`, err);
  });

  weakReportWorker.on('failed', (job, err) => {
    console.error(`Weak report job ${job?.id} failed:`, err);
  });
}
