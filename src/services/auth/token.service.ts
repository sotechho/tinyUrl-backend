import { config } from '@/config';
import type { GenerateAccessAndRefreshToken, TokenPayload } from '@/types';
import { UnauthorizedError } from '@/utils/errors';
import logger from '@/utils/logger';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

class TokenService {
  generateAccessToken(payload: TokenPayload): string {
    const { accessExpiresIn, accessSecret } = config.jwt;
    return jwt.sign(payload, accessSecret, {
      expiresIn: accessExpiresIn as StringValue,
    });
  }
  generateRefreshToken(payload: TokenPayload): string {
    const { refreshExpiresIn, refreshSecret } = config.jwt;
    return jwt.sign(payload, refreshSecret, {
      expiresIn: refreshExpiresIn as StringValue,
    });
  }

  generateAccessAndRefreshTokens(
    payload: TokenPayload,
  ): GenerateAccessAndRefreshToken {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      const { accessSecret } = config.jwt;
      const payload = jwt.verify(token, accessSecret) as TokenPayload;
      return payload;
    } catch (error) {
      logger.error('Access Token Verification Error', error);
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
  verifyRefreshToken(token: string): TokenPayload {
    try {
      const { refreshSecret } = config.jwt;
      const payload = jwt.verify(token, refreshSecret) as TokenPayload;
      return payload;
    } catch (error) {
      logger.error('Access Token Verification Error', error);
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

export const tokenService = new TokenService();
