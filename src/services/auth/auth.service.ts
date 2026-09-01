import { db } from '@/db';
import { usersTable } from '@/db/tables';
import type { PublicUser } from '@/types';
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@/utils';
import logger from '@/utils/logger';
import type { LoginInput, RegisterInput } from '@/validators';
import { eq } from 'drizzle-orm';
import { mailService } from '../notifications';
import { passwordService } from './password.service';
import { tokenService } from './token.service';
import { verificationService } from './verification.service';

class AuthService {
  async register(data: RegisterInput): Promise<void> {
    try {
      // normalize email
      const normalizedEmail = this.normalizeEmail(data.email);
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
      const username = this.extractUsername(normalizedEmail, data.username);

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

  async login(data: LoginInput): Promise<{
    accessToken: string;
    refreshToken: string;
    user: PublicUser;
  }> {
    try {
      const normalizedEmail = this.normalizeEmail(data.email);
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, normalizedEmail));

      if (!user) {
        logger.warn('Login attempt failed because user was not found', {
          email: normalizedEmail,
        });
        throw new UnauthorizedError('Invalid email or password');
      }

      // prevent inactive users from logging in
      if (!user.isActive) {
        logger.warn('Login attempt failed because user is inactive', {
          userId: user.id,
        });
        throw new BadRequestError(
          'Your account has been deactivated please contact support',
        );
      }

      // prevent unverified users from logging in
      if (!user.isEmailVerified) {
        logger.warn('Login attempt failed because email is not verified', {
          userId: user.id,
        });
        throw new UnauthorizedError('Please verify your email to continue');
      }

      const isPasswordValid = await passwordService.comparePassword(
        data.password,
        user.password,
      );

      if (!isPasswordValid) {
        logger.warn('Login attempt failed because password is invalid', {
          userId: user.id,
        });
        throw new UnauthorizedError('Invalid email or password');
      }

      const tokens = tokenService.generateAccessAndRefreshTokens({
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
      });

      await db
        .update(usersTable)
        .set({
          refreshToken: tokens.refreshToken,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, user.id));

      const publicUser: PublicUser = {
        id: user.id,
        username: this.extractUsername(user.email, user.username),
        email: user.email,
        isActive: user.isActive,
        role: user.role || 'user',
      };

      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: publicUser,
      };
    } catch (error: any) {
      logger.error('Failed user login', {
        ...error,
      });

      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed user login');
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

      const username = this.extractUsername(user.email, user.username);
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

  async resendVerification(email: string): Promise<void> {
    try {
      const normalizedEmail = this.normalizeEmail(email);
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, normalizedEmail));

      if (!user) {
        logger.warn('Resend verification skipped because user was not found', {
          email: normalizedEmail,
        });
        throw new NotFoundError('User not found');
      }

      if (!user.isActive) {
        logger.warn('Resend verification failed because user is inactive', {
          userId: user.id,
        });
        throw new BadRequestError(
          'Your account has been deactivated please contact support',
        );
      }

      if (user.isEmailVerified) {
        logger.warn(
          'Resend verification failed because email is already verified',
          {
            userId: user.id,
          },
        );
        throw new ConflictError('User is already verified');
      }

      const emailVerificationToken = verificationService.generateToken();
      const emailVerificationExpires =
        verificationService.generateTokenExpiration();

      await db
        .update(usersTable)
        .set({
          emailVerificationToken,
          emailVerificationExpires,
          refreshToken: null,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, user.id));

      const username = this.extractUsername(user.email, user.username);

      await mailService.sendVerificationEmail(normalizedEmail, {
        verificationToken: emailVerificationToken,
        name: username,
      });

      logger.info('Verification email resent successfully', {
        userId: user.id,
        email: user.email,
      });
    } catch (error: any) {
      logger.error('Failed to resend verification email', {
        ...error,
      });

      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to resend verification email');
    }
  }

  async me(userId: string): Promise<PublicUser> {
    try {
      const [user] = await db
        .select({
          id: usersTable.id,
          username: usersTable.username,
          email: usersTable.email,
          isActive: usersTable.isActive,
          role: usersTable.role,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      if (!user) {
        logger.error('Profile user not found', {
          userId,
        });
        throw new NotFoundError('User not found');
      }

      logger.info('User profile retrieved successfully', {
        userId: user.id,
      });

      return {
        id: user.id,
        username: this.extractUsername(user.email, user.username),
        email: user.email,
        isActive: user.isActive || true,
        role: user.role || 'user',
      };
    } catch (error: any) {
      logger.error('Failed to get user profile', {
        ...error,
      });

      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get user profile');
    }
  }
  // helper methods
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private extractUsername(
    email: string,
    username: string | null | undefined,
  ): string {
    return (username || email.split('@')[0]) as string;
  }
}

export const authService = new AuthService();
