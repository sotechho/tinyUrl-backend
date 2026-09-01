import crypto from 'crypto';

class VerificationService {
  private readonly tokenLength: number = 32;
  private readonly tokenExpires: number = 15;

  generateToken(): string {
    return crypto.randomBytes(this.tokenLength).toString('hex');
  }

  generateTokenExpiration(): Date {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + this.tokenExpires);
    return expires;
  }

  isTokenExpired(expires: Date): boolean {
    return new Date() > expires;
  }
}

export const verificationService = new VerificationService();
