import { createServer } from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDB, disconnectDB } from './config/db';
import { disconnectRedis } from './config/redis';
import { initializeSocket } from './socket';

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = createApp();
  const httpServer = createServer(app);
  await initializeSocket(httpServer);

  const server = httpServer.listen(env.PORT, () => {
    logger.info(`CollabNote API running on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`API docs available at http://localhost:${env.PORT}/api-docs`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      await disconnectRedis();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled rejection: ${reason instanceof Error ? reason.stack : reason}`);
  });
}

bootstrap().catch((err) => {
  logger.error(`Failed to start server: ${err instanceof Error ? err.stack : err}`);
  process.exit(1);
});
