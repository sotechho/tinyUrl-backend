import fs from 'fs';
import path from 'path';
import winston from 'winston';

const logDirectory = path.join(process.cwd(), 'logs');

fs.mkdirSync(logDirectory, { recursive: true });

if (fs.existsSync(logDirectory)) {
  fs.writeFileSync(path.join(logDirectory, '.gitignore'), '*');
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(function ({
          level,
          message,
          timestamp,
          ...metadata
        }) {
          let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

          // Clean up internal winston metadata flags if they exist
          delete metadata[Symbol.for('splat')];

          if (Object.keys(metadata).length > 0) {
            log += `\n${JSON.stringify(metadata, null, 2)}`;
          }

          return log;
        }),
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, 'combined.log'),
    }),
    new winston.transports.File({
      level: 'error',
      filename: path.join(logDirectory, 'error.log'),
    }),
  ],
});

export default logger;
