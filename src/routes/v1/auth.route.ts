import { authController } from '@/controllers';
import { authenticate } from '@/middlewares/auth.middleware';
import {
  validateQuery,
  validateRequest,
} from '@/middlewares/validator.middleware';
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from '@/validators/auth.validator';
import express from 'express';

const router = express.Router();

router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register,
);

router.post('/login', validateRequest(loginSchema), authController.login);

router.get(
  '/verify-email',
  validateQuery(verifyEmailSchema),
  authController.verifyEmail,
);

router.post(
  '/resend-verification',
  validateRequest(resendVerificationSchema),
  authController.resendVerification,
);

router.get('/me', authenticate, authController.me);

router.post('/refresh-token', authController.refreshToken);

router.post('/logout', authenticate, authController.logout);

export default router;
