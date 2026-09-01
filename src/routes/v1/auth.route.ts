import { authController } from '@/controllers';
import {
  validateQuery,
  validateRequest,
} from '@/middlewares/validator.middleware';
import { registerSchema, verifyEmailSchema } from '@/validators/auth.validator';
import express from 'express';

const router = express.Router();

router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register,
);

router.get(
  '/verify-email',
  validateQuery(verifyEmailSchema),
  authController.verifyEmail,
);

export default router;
