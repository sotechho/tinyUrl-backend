import app from './app';
import { config } from '@/config';

function startServer(): void {
  try {
    const server = app.listen(config.port, () =>
      console.log(`http://localhost:${config.port}`),
    );

    server.on('error', function (error: NodeJS.ErrnoException) {
      if (error.code === 'EADDRINUSE') {
        console.log('Server port is in use');
        process.exit(1);
      } else {
        console.log('Start server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.log('Start server error:', error);
    process.exit(1);
  }
}

startServer();
