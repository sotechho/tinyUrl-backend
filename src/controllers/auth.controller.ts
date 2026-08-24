import { authService } from '@/services';
import { createdResponse } from '@/utils';
import type { Request, Response } from 'express';

export async function register(req: Request, res: Response) {
  const data = req.body;
  await authService.register(data);
  return createdResponse(res, 'User registered successfully');
}
