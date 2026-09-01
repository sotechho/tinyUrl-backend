import { parseBool } from '@/utils';
import dotenv from 'dotenv';

dotenv.config();

type SMTPOptions = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  logger: boolean;
  debug: boolean;
};

const smtp: SMTPOptions = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: parseBool(
    process.env.SMTP_SECURE,
    process.env.NODE_ENV === 'production',
  ),
  user: process.env.SMTP_USER || '',
  password: process.env.SMTP_PASSWORD || '',
  from: process.env.EMAIL_FROM || 'info@headshotpro.ai',
  logger: process.env.NODE_ENV === 'development',
  debug: process.env.NODE_ENV === 'development',
};

const jwt = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
};

export const config = {
  ndeoEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8800,
  database: {
    url: process.env.DATABASE_URL!,
  },
  jwt,
  smtp,
};
