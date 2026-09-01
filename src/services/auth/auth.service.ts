import { db } from '@/db';
import { usersTable } from '@/db/tables';
import { AppError, ConflictError } from '@/utils';
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
}

export const authService = new AuthService();
