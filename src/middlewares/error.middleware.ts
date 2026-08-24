import { config } from '@/config';
import { AppError, ValidationError } from '@/utils/errors';
import logger from '@/utils/logger';
import { errorResponse } from '@/utils/responses';
import type { NextFunction, Request, Response } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  logger.error(err.message);

  // handle app errors
  if (err instanceof AppError) {
    const errors = err instanceof ValidationError ? err.errors : undefined;
    return errorResponse(res, err.message, err.statusCode, errors);
  }

  // handle jwt errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  const errorMessage =
    config.ndeoEnv === 'development'
      ? err.message || 'Internal Server Error'
      : 'Internal Server Error';

  return errorResponse(res, errorMessage, 500);
}
