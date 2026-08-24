import app from './app';
import { config } from '@/config';
import logger from '@/utils/logger';

function startServer(): void {
  try {
    const server = app.listen(config.port, () =>
      logger.info(`http://localhost:${config.port}`),
    );

    server.on('error', function (error: NodeJS.ErrnoException) {
      if (error.code === 'EADDRINUSE') {
        logger.error('Server port is in use');
        process.exit(1);
      } else {
        logger.error('Start server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('Start server error:', error);
    process.exit(1);
  }
}

startServer();
