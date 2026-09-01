import { AppError, ValidationError } from '@/utils/errors';
import type { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

export function validateRequest(schema: z.ZodType<unknown>) {
  return function (req: Request, _res: Response, next: NextFunction) {
    try {
      const validated = z.parse(schema, req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => {
          return {
            path: issue.path.join('.'),
            message: issue.message,
          };
        });

        return next(new ValidationError('Validation error', errors));
      }
      next(new AppError('Validation Error', 422, 'VALIDATION', true));
    }
  };
}

export function validateQuery(schema: z.ZodType<unknown>) {
  return function (req: Request, _res: Response, next: NextFunction) {
    try {
      const validated = z.parse(schema, req.query);
      Object.assign(req.query, validated);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => {
          return {
            path: issue.path.join('.'),
            message: issue.message,
          };
        });

        return next(new ValidationError('Validation error', errors));
      }
      next(new AppError('Validation Error', 422, 'VALIDATION', true));
    }
  };
}
