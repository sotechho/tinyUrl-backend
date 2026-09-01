import { authService } from '@/services';
import { createdResponse, successResponse } from '@/utils';
import type { Request, Response } from 'express';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function register(req: Request, res: Response) {
  const data = req.body;
  await authService.register(data);
  return createdResponse(res, 'User registered successfully');
}

export async function login(req: Request, res: Response) {
  const data = req.body;
  const { user, accessToken, refreshToken } = await authService.login(data);
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  }); // 15 minutes
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }); // 7 days
  return successResponse(res, 'Login successfully', { user });
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.query;
  await authService.verifyEmail(token as string);
  return createdResponse(res, 'Email verified successfully');
}

export async function resendVerification(req: Request, res: Response) {
  const data = req.body;
  await authService.resendVerification(data.email);
  return createdResponse(res, 'Verification email sent successfully');
}

export async function me(req: Request, res: Response) {
  const userId = req.user?.id;
  const user = await authService.me(userId as string);
  return successResponse(res, 'User profile retrieved successfully', user);
}

function getRefreshTokenFromRequest(req: Request): string | undefined {
  const cookieToken = req.cookies?.refreshToken;
  if (cookieToken) {
    return cookieToken;
  }

  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return undefined;
  }

  return authorizationHeader.substring(7, authorizationHeader.length).trim();
}

export async function refreshToken(req: Request, res: Response) {
  const refreshToken = getRefreshTokenFromRequest(req);

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshToken(refreshToken as string);

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', newRefreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return successResponse(res, 'Token refreshed successfully');
}

export async function logout(req: Request, res: Response) {
  const userId = req.user?.id;

  await authService.logout(userId as string);

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  return successResponse(res, 'Logout successful', null);
}
