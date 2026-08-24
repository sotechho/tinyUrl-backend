import { authController } from '@/controllers';
import { validateRequest } from '@/middlewares/validator.middleware';
import { registerSchema } from '@/validators/auth.validator';
import express from 'express';

const router = express.Router();

router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register,
);

export default router;
