import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { extractTenant } from './middleware/tenant/extractTenant';
import { notFoundHandler, globalErrorHandler } from './utils/errorHandler';

import authRoutes from './routes/auth';
import organizationRoutes from './routes/organizations';
import branchRoutes from './routes/branches';
import userRoutes from './routes/users';
import academicRoutes from './routes/academic';
import studentRoutes from './routes/students';
import attendanceRoutes from './routes/attendance';
import timetableRoutes from './routes/timetable';
import examRoutes from './routes/exams';
import assignmentRoutes from './routes/assignments';
import feeRoutes from './routes/fees';
import payrollRoutes from './routes/payroll';
import notificationRoutes from './routes/notifications';
import settingsRoutes from './routes/settings';
import sopRoutes from './routes/sops';
import topicRoutes from './routes/topics';
import paperRoutes from './routes/papers';
import clearanceRoutes from './routes/clearances';

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || env.isDev) return cb(null, true);
    if (
      origin === env.frontendUrl ||
      origin.endsWith(`.${env.baseDomain}`) ||
      origin.endsWith('.vercel.app')
    ) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

if (env.isDev) app.use(morgan('dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(extractTenant);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.nodeEnv, ts: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sops', sopRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/clearances', clearanceRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
