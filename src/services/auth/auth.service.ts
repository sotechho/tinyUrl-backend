import { db } from '@/db';
import { usersTable } from '@/db/tables';
import { ConflictError } from '@/utils';
import type { RegisterInput } from '@/validators';
import { eq } from 'drizzle-orm';
import { passwordService } from './password.service';
import { verificationService } from './verification.service';

class AuthService {
  async register(data: RegisterInput): Promise<void> {
    const normalizedEmail = data.email.trim().toLowerCase();
    // check if user exists
    const userExists = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail));

    if (userExists.length > 0) {
      throw new ConflictError('User is already exists');
    }

    const hashedPassword = await passwordService.hashPassword(data.password);
    const emailVerificationToken = verificationService.generateToken();
    const emailVerificationExpires =
      verificationService.generateTokenExpiration();

    const username = data.username || normalizedEmail.split('@')[0];

    await db.insert(usersTable).values({
      email: normalizedEmail,
      username,
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpires,
    });
  }
}

export const authService = new AuthService();
