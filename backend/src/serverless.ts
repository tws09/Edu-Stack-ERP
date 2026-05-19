import 'dotenv/config';
import type { IncomingMessage, ServerResponse } from 'http';
import app from './app';
import { connectDatabase } from './config/database';

// Reuse DB connection across warm Vercel Lambda invocations
let dbReady = false;

const ensureDb = async () => {
  if (dbReady) return;
  await connectDatabase();
  dbReady = true;
};

export default async (req: IncomingMessage, res: ServerResponse) => {
  await ensureDb();
  app(req as any, res as any);
};
