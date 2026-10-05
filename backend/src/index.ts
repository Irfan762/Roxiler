import createApp from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import prisma from './config/prisma';

async function main() {
  // Verify database connection
  try {
    await prisma.$connect();
    logger.info('✅ Connected to database');
  } catch (err) {
    logger.error('❌ Failed to connect to database:', err);
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    logger.info(`   API base URL: http://localhost:${env.PORT}/api`);
    logger.info(`   Environment: ${env.NODE_ENV}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down...');
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  logger.error('Fatal error:', err);
  process.exit(1);
});
