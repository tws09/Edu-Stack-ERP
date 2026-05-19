import 'dotenv/config';
import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { getRedis } from './config/redis';
import { initSocket } from './socket';
async function bootstrap(): Promise<void> {
  await connectDatabase();

  const redis = getRedis();
  if (redis) {
    await redis.connect();
  }

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  if (env.redisEnabled) {
    const { registerWorkers, scheduleRecurringJobs } = await import('./jobs');
    registerWorkers();
    await scheduleRecurringJobs();
  }

  httpServer.listen(env.port, () => {
    console.log(`EduStack PK API running on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down...`);
    httpServer.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
