import { boolean, timestamp, pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  username: text(),
  email: text().notNull().unique(),
  password: text().notNull(),
  isActive: boolean().default(true),
  isEmailVerified: boolean().default(false),
  refreshToken: text(),
  emailVerificationToken: text(),
  emailVerificationExpires: timestamp({ withTimezone: true }),
  role: text().default('user'),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
