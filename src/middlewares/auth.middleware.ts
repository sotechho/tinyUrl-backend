import { db } from '@/db';
import { usersTable } from '@/db/tables';
import { tokenService } from '@/services/auth/token.service';
import { AppError, UnauthorizedError } from '@/utils/errors';
import logger from '@/utils/logger';
import { eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    let token = req.cookies.accessToken;

    if (!token) {
      const authorizationHeader = req.headers.authorization;
      if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        token = authorizationHeader
          .substring(7, authorizationHeader.length)
          .trim();
      }
    }

    if (!token) {
      logger.warn(
        'Authentication failed because cookie or bearer token is missing',
      );
      throw new UnauthorizedError('Unauthorized token is missing');
    }

    const payload = tokenService.verifyAccessToken(token);

    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId));

    if (!user) {
      logger.warn('Authentication failed because user was not found', {
        userId: payload.userId,
      });
      throw new UnauthorizedError('Unauthorized token is invalid');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
    };

    next();
  } catch (error: any) {
    logger.error('Authentication middleware failed', {
      ...error,
    });

    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError('Unauthorized failed to authenticate user'));
  }
}
