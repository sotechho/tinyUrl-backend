import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email({ error: 'Invalid email' }).trim().toLowerCase(),
  username: z.string().trim().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .trim()
    .regex(/[A-Z]/, 'Password must contain at least one capital latter')
    .regex(/[a-z]/, 'Password must contain at least one small latter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.email({ error: 'Invalid email' }).trim().toLowerCase(),
  password: z.string().min(1, 'Password is required').trim(),
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(1, 'Token is required'),
});

export const resendVerificationSchema = z.object({
  email: z.email({ error: 'Invalid email' }).trim().toLowerCase(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
