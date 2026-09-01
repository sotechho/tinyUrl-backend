import { db } from '@/db';
import { usersTable } from '@/db/tables';
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/utils';
import logger from '@/utils/logger';
import type { RegisterInput } from '@/validators';
import { eq } from 'drizzle-orm';
import { mailService } from '../notifications';
import { passwordService } from './password.service';
import { verificationService } from './verification.service';

class AuthService {
  async register(data: RegisterInput): Promise<void> {
    try {
      // normalize email
      const normalizedEmail = data.email.trim().toLowerCase();
      // check if user exists
      const userExists = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, normalizedEmail));

      // throw conflict error
      if (userExists.length > 0) {
        throw new ConflictError('User is already exists');
      }
      // hash the password
      const hashedPassword = await passwordService.hashPassword(data.password);
      // verification token and expires
      const emailVerificationToken = verificationService.generateToken();
      const emailVerificationExpires =
        verificationService.generateTokenExpiration();
      // username extract
      const username = (data.username ||
        normalizedEmail.split('@')[0]) as string;

      // insert to the database
      await db.insert(usersTable).values({
        email: normalizedEmail,
        username,
        password: hashedPassword,
        emailVerificationToken,
        emailVerificationExpires,
      });
      // send verification mail
      await mailService.sendVerificationEmail(normalizedEmail, {
        verificationToken: emailVerificationToken,
        name: username,
      });
    } catch (error: any) {
      logger.error('Failed user registeration', {
        ...error,
      });

      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed user registeration');
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      // find user by token
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.emailVerificationToken, token));

      // check if user exists
      if (!user) {
        logger.error('user not found with verification token:', { token });
        throw new NotFoundError('user not found');
      }

      logger.info('user found with verification token:', {
        token,
        userId: user.id,
      });

      // check if user is active
      if (!user.isActive) {
        logger.error('user is not active:', { token });
        throw new BadRequestError(
          'your account has been deactivated please contact support',
        );
      }

      // check if user is already verified
      if (user.isEmailVerified) {
        logger.error('user is already verified:', { token });
        throw new ConflictError('user is already verified');
      }
      // check if token is expired
      const isTokenExpired = verificationService.isTokenExpired(
        user.emailVerificationExpires as Date,
      );

      if (isTokenExpired) {
        logger.error('user verification token expired:', { token });
        throw new BadRequestError(
          'verification token expired please request again',
        );
      }
      // update user to verified and send welcome email
      await db
        .update(usersTable)
        .set({
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        })
        .where(eq(usersTable.id, user.id));

      const username = (user.username || user.email.split('@')[0]) as string;
      await mailService.sendWelcomeEmail(user.email, username);
    } catch (error: any) {
      logger.error('Failed user email verification', {
        ...error,
      });
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed user email verification');
    }
  }
}

export const authService = new AuthService();
